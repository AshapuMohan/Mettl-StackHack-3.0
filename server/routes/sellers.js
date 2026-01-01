const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Get seller profile
router.get('/:id', async (req, res) => {
  try {
    const seller = await User.findById(req.params.id)
      .select('-password -email')
      .where('role').equals('seller');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get seller stats
    const productCount = await Product.countDocuments({ 
      seller: seller._id, 
      isActive: true 
    });
    
    const orderCount = await Order.countDocuments({
      'items.seller': seller._id,
      status: 'delivered'
    });

    res.json({
      ...seller.toObject(),
      stats: {
        productCount,
        orderCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller products
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    
    const products = await Product.find({ 
      seller: req.params.id, 
      isActive: true 
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({ 
      seller: req.params.id, 
      isActive: true 
    });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller dashboard (seller only)
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }

    const sellerId = req.userId;

    // Get various stats
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const activeProducts = await Product.countDocuments({ 
      seller: sellerId, 
      isActive: true 
    });
    
    const totalOrders = await Order.countDocuments({
      'items.seller': sellerId
    });
    
    const pendingOrders = await Order.countDocuments({
      'items.seller': sellerId,
      status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    // Revenue calculation
    const revenueData = await Order.aggregate([
      { $match: { 'items.seller': mongoose.Types.ObjectId(sellerId) } },
      { $unwind: '$items' },
      { $match: { 'items.seller': mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: { $multiply: ['$items.price', '$items.quantity'] } 
          }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;