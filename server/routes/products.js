const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Test route to check if products API is working
router.get('/test', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected',
        productCount: 0,
        categoryCount: 0,
        dbStatus: 'disconnected'
      });
    }

    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    res.json({
      message: 'Products API is working',
      productCount,
      categoryCount,
      dbStatus: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'API test failed', error: error.message });
  }
});

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      seller
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (seller) query.seller = seller;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'seller', select: 'name' }
      ]
    };

    const products = await Product.paginate(query, options);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (sellers only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const productData = { ...req.body, seller: req.userId };
    
    // Handle uploaded images
    if (req.files) {
      productData.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name
      }));
    }

    const product = new Product(productData);
    await product.save();
    
    await product.populate('category seller');
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        alt: req.body.name || product.name
      }));
      updates.images = [...(product.images || []), ...newImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('category seller');

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Compare products
router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || productIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 products required for comparison' });
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category seller');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;