// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { orderItems, couponCode, amount } = req.body;

    let finalAmount = Number(amount) || 0;

    // Recalculate true amount from DB if orderItems are passed
    if (Array.isArray(orderItems) && orderItems.length > 0) {
      let itemsTotal = 0;
      for (const item of orderItems) {
        const qty = Math.max(1, Number(item.quantity) || 1);
        let unitPrice = Number(item.price) || 0;

        if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          const dbProduct = await Product.findById(item.product);
          const dbVariant = dbProduct?.variants?.find((v) => v.weight === item.weight);
          if (dbVariant) unitPrice = dbVariant.price;
        }
        itemsTotal += unitPrice * qty;
      }

      let discount = 0;
      if (couponCode && couponCode.trim()) {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase().trim(),
          isActive: true,
        });
        if (coupon && itemsTotal >= coupon.minOrderAmount) {
          discount =
            coupon.discountType === 'FLAT'
              ? coupon.discountValue
              : Math.round((itemsTotal * coupon.discountValue) / 100);
          discount = Math.min(discount, itemsTotal);
        }
      }

      const shipping = itemsTotal >= 499 ? 0 : 30;
      const handling = 12;
      finalAmount = Math.max(1, itemsTotal - discount + shipping + handling);
    }

    if (finalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Mock order fallback if Razorpay keys are not yet configured in .env
    if (!keyId || !keySecret) {
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: finalAmount * 100,
        currency: 'INR',
        keyId: 'rzp_test_mock_key',
        isMock: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      isMock: false,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order' });
  }
});

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET || razorpay_order_id?.startsWith('order_mock_')) {
      return res.json({ verified: true, message: 'Mock payment verified' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ verified: false, message: 'Invalid payment signature' });
    }

    res.json({ verified: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification error' });
  }
});

module.exports = router;