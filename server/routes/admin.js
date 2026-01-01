const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Apply auth and adminAuth to all routes
router.use(auth);
router.use(adminAuth);

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().populate('pricing')
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const lowStockProducts = await Product.countDocuments({ 'inventory.quantity': { $lt: 10 } });

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Recent Orders
router.get('/orders/recent', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Recent Users
router.get('/users/recent', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: '-password',
      sort: { createdAt: -1 }
    };

    const users = await User.paginate(query, options);
    
    res.json({
      users: users.docs,
      totalPages: users.totalPages,
      currentPage: users.page,
      total: users.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { action } = req.body;
    
    let update = {};
    if (action === 'verify') {
      update.isVerified = true;
    } else if (action === 'suspend') {
      update.isVerified = false;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get current period data
    const [orders, users, products] = await Promise.all([
      Order.find({ createdAt: { $gte: startDate } }).populate('pricing'),
      User.find({ createdAt: { $gte: startDate } }),
      Product.find()
    ]);

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(days));
    
    const [prevOrders, prevUsers] = await Promise.all([
      Order.find({ 
        createdAt: { $gte: prevStartDate, $lt: startDate } 
      }).populate('pricing'),
      User.find({ 
        createdAt: { $gte: prevStartDate, $lt: startDate } 
      })
    ]);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    const prevRevenue = prevOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const orderGrowth = prevOrders.length > 0 ? ((orders.length - prevOrders.length) / prevOrders.length) * 100 : 0;
    const userGrowth = prevUsers.length > 0 ? ((users.length - prevUsers.length) / prevUsers.length) * 100 : 0;

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product',
        sales: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }},
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }},
      { $unwind: '$product' },
      { $project: {
        name: '$product.name',
        sales: 1,
        revenue: 1
      }}
    ]);

    // Recent sales
    const recentSales = await Order.find()
      .populate('customer', 'name')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      revenue: {
        total: totalRevenue,
        thisMonth: totalRevenue,
        lastMonth: prevRevenue,
        growth: revenueGrowth
      },
      orders: {
        total: orders.length,
        thisMonth: orders.length,
        lastMonth: prevOrders.length,
        growth: orderGrowth
      },
      users: {
        total: users.length,
        thisMonth: users.length,
        lastMonth: prevUsers.length,
        growth: userGrowth
      },
      products: {
        total: products.length,
        active: products.filter(p => p.isActive).length,
        inactive: products.filter(p => !p.isActive).length
      },
      topProducts,
      topCategories: [],
      recentSales
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Settings
router.get('/settings', async (req, res) => {
  try {
    // Return default settings (in a real app, these would be stored in database)
    res.json({
      general: {
        siteName: 'Marketplace',
        siteDescription: 'Your trusted online marketplace',
        contactEmail: 'admin@marketplace.com',
        supportPhone: '+1 (555) 123-4567',
        currency: 'USD',
        timezone: 'UTC'
      },
      notifications: {
        emailNotifications: true,
        orderUpdates: true,
        pushNotifications: true,
        marketingEmails: false
      },
      security: {
        requireEmailVerification: true,
        enableTwoFactor: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    // In a real app, save settings to database
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Order Management
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'customer', select: 'name email' },
        { path: 'items.product', select: 'name price' }
      ],
      sort: { createdAt: -1 }
    };

    const orders = await Order.paginate(query, options);
    
    res.json({
      orders: orders.docs,
      totalPages: orders.totalPages,
      currentPage: orders.page,
      total: orders.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Order Status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingInfo } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    
    if (trackingInfo) {
      order.tracking.updates.push({
        status,
        message: trackingInfo.message || `Order ${status}`,
        timestamp: new Date()
      });
    }

    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${order._id}`).emit('order-updated', {
        orderId: order._id,
        status,
        tracking: order.tracking
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price images')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Product Management
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'category', select: 'name' },
        { path: 'seller', select: 'name email' }
      ],
      sort: { createdAt: -1 }
    };

    const products = await Product.paginate(query, options);
    
    res.json({
      products: products.docs,
      totalPages: products.totalPages,
      currentPage: products.page,
      total: products.totalDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Product Status
router.put('/products/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).populate('category seller');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;