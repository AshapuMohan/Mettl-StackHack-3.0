const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('children')
      .sort({ sortOrder: 1, name: 1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category tree
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.find({ parent: null, isActive: true })
      .populate({
        path: 'children',
        populate: { path: 'children' }
      })
      .sort({ sortOrder: 1, name: 1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent')
      .populate('children');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin (you might want to add role checking middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const category = new Category(req.body);
    await category.save();
    
    // Update parent's children array if this is a subcategory
    if (category.parent) {
      await Category.findByIdAndUpdate(
        category.parent,
        { $push: { children: category._id } }
      );
    }
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;