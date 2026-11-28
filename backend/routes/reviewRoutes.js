// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'chicken_pickle_secret_key_2026';

// Helper: Recalculate and update Product average rating & review count
const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 4.8, numReviews: 0 });
    return;
  }
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: reviews.length,
  });
};

// GET /api/reviews/:productId - Public: Fetch all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load reviews' });
  }
});

// POST /api/reviews/:productId - Customer: Add or update review
router.post('/:productId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please sign in to write a review' });
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Please select a star rating between 1 and 5' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Please write a short review comment' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Customer account not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if customer actually ordered this pickle (for Verified Purchase badge)
    const userConditions = [{ user: user._id }];
    if (user.phone) {
      userConditions.push({ 'customer.phone': user.phone });
    }

    const matchingOrder = await Order.findOne({
      $or: userConditions,
      'orderItems.product': product._id,
      status: { $ne: 'Cancelled' },
    });

    const isVerifiedPurchase = Boolean(matchingOrder);

    // Update existing review if user already reviewed this product, else create new
    let review = await Review.findOne({ product: productId, user: user._id });
    if (review) {
      review.rating = numericRating;
      review.comment = comment.trim();
      review.isVerifiedPurchase = review.isVerifiedPurchase || isVerifiedPurchase;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: user._id,
        userName: user.name,
        rating: numericRating,
        comment: comment.trim(),
        isVerifiedPurchase,
      });
    }

    await recalculateProductRating(productId);
    res.status(201).json(review);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }
    res.status(500).json({ message: error.message || 'Failed to submit review' });
  }
});

// DELETE /api/reviews/:id - Admin: Delete inappropriate review
router.delete('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin authorization required' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access denied' });
    }

    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await recalculateProductRating(review.product);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

module.exports = router;