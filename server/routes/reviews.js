const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment, pros, cons } = req.body;

    // Verify user purchased this product
    const order = await Order.findOne({
      _id: orderId,
      customer: req.userId,
      'items.product': productId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        message: 'You can only review products you have purchased and received' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      product: productId,
      customer: req.userId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      customer: req.userId,
      order: orderId,
      rating,
      title,
      comment,
      pros: pros || [],
      cons: cons || [],
      verified: true
    });

    await review.save();
    await review.populate('customer', 'name avatar');

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', rating } = req.query;
    
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const query = { 
      product: req.params.productId,
      status: 'approved'
    };
    
    if (rating) query['rating.overall'] = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('customer', 'name avatar')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);
    
    // Get rating distribution - handle case where no reviews exist
    let ratingStats = [];
    try {
      ratingStats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
        {
          $group: {
            _id: '$rating.overall',
            count: { $sum: 1 }
          }
        }
      ]);
    } catch (aggregateError) {
      console.log('Rating stats aggregation failed:', aggregateError.message);
      ratingStats = [];
    }

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      ratingStats
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.customer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    Object.assign(review, updates);
    
    await review.save();
    await review.populate('customer', 'name avatar');

    // Update product rating
    await updateProductRating(review.product);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.userId;
    const hasVoted = review.helpful.users.includes(userId);

    if (hasVoted) {
      // Remove vote
      review.helpful.users = review.helpful.users.filter(
        id => id.toString() !== userId
      );
      review.helpful.count -= 1;
    } else {
      // Add vote
      review.helpful.users.push(userId);
      review.helpful.count += 1;
    }

    await review.save();
    res.json({ helpful: review.helpful.count, hasVoted: !hasVoted });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Seller response to review
router.post('/:id/response', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    const review = await Review.findById(req.params.id).populate('product');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the seller of the product
    if (review.product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.response.seller = {
      message,
      respondedAt: new Date(),
      respondedBy: req.userId
    };

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error('Invalid product ID for rating update:', productId);
      return;
    }

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const { averageRating = 0, totalReviews = 0 } = stats[0] || {};

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(averageRating * 10) / 10,
      'ratings.count': totalReviews
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

module.exports = router;