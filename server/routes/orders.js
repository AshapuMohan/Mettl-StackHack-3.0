const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate item structure
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ 
          message: 'Invalid item structure. ProductId and quantity are required.' 
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }

      if (!product.isActive) {
        return res.status(400).json({ 
          message: `Product ${product.name} is no longer available` 
        });
      }

      if (product.inventory.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant || null,
        seller: product.seller
      });

      // Update inventory
      product.inventory.quantity -= item.quantity;
      await product.save();
    }

    const shipping = 50; // Fixed shipping cost
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${(orderCount + 1).toString().padStart(4, '0')}`;

    const order = new Order({
      orderNumber,
      customer: req.userId,
      items: orderItems,
      pricing: { subtotal, shipping, tax, total },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: { method: paymentMethod }
    });

    await order.save();
    await order.populate('items.product items.seller customer');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${order._id}`).emit('order-created', order);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid ID format', 
        error: error.message 
      });
    }

    res.status(500).json({ 
      message: 'Server error during order creation', 
      error: error.message 
    });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { customer: req.userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.product', 'name images price')
      .populate('items.seller', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('items.seller', 'name email')
      .populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is a seller
    const isOwner = order.customer._id.toString() === req.userId;
    const isSeller = order.items.some(item => 
      item.seller._id.toString() === req.userId
    );

    if (!isOwner && !isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (sellers/admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, trackingInfo } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is seller for this order
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.userId
    );

    if (!isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    
    if (trackingInfo) {
      order.tracking = { ...order.tracking, ...trackingInfo };
    }

    // Add tracking update
    order.tracking.updates.push({
      status,
      message: `Order ${status}`,
      timestamp: new Date()
    });

    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`order-${order._id}`).emit('order-updated', {
      orderId: order._id,
      status,
      tracking: order.tracking
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Track order
router.get('/:id/track', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber status tracking createdAt')
      .populate('items.product', 'name isDigital');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      tracking: order.tracking,
      isDigital: order.items.every(item => item.product.isDigital),
      createdAt: order.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request return
router.post('/:id/return', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only return delivered orders' });
    }

    order.returnRequest = {
      requested: true,
      reason,
      status: 'pending',
      requestedAt: new Date()
    };

    await order.save();
    res.json({ message: 'Return request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;