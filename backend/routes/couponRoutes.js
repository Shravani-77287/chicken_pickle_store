// backend/routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET /api/coupons - Fetch all coupons (Admin Only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// POST /api/coupons - Create a new coupon (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ message: 'Please provide code and discount value' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountType: discountType || 'FLAT',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      isActive: true,
    });

    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon' });
  }
});

// POST /api/coupons/apply - Validate and apply coupon (Public)
router.post('/apply', async (req, res) => {
  try {
    const { code, itemsTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    if (itemsTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order total of ₹${coupon.minOrderAmount} required for code ${coupon.code}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'FLAT') {
      discount = coupon.discountValue;
    } else if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((itemsTotal * coupon.discountValue) / 100);
    }

    // Ensure discount doesn't exceed items total
    if (discount > itemsTotal) {
      discount = itemsTotal;
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      message: `Coupon '${coupon.code}' applied successfully!`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply coupon' });
  }
});

// DELETE /api/coupons/:id - Delete a coupon (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

module.exports = router;