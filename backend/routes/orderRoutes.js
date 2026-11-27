// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'chicken_pickle_secret_key_2026';

const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin authorization required' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access denied' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

const requireCustomer = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please sign in to view your orders' });
    }
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
};

const extractUserId = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      return decoded.id || null;
    }
  } catch (e) {}
  return null;
};

// POST /api/orders - Validate Stock, Recalculate Price & Deduct Inventory
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      orderItems,
      paymentMethod,
      paymentResult,
      deliveryInstruction,
      gstinNumber,
      couponCode,
    } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.pincode) {
      return res.status(400).json({ message: 'Please provide complete delivery details and PIN code' });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    let calculatedItemsPrice = 0;
    const verifiedItems = [];

    // 1. Verify prices & check available stock from MongoDB
    for (const item of orderItems) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let unitPrice = Number(item.price) || 0;
      let productName = item.name;

      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        const dbProduct = await Product.findById(item.product);
        if (dbProduct) {
          productName = dbProduct.name;
          const dbVariant = dbProduct.variants?.find((v) => v.weight === item.weight);
          if (dbVariant) {
            if (dbVariant.stock !== undefined && dbVariant.stock < qty) {
              return res.status(400).json({
                message:
                  dbVariant.stock === 0
                    ? `${dbProduct.name} (${item.weight}) is currently Out of Stock.`
                    : `Only ${dbVariant.stock} jar(s) of ${dbProduct.name} (${item.weight}) left in stock.`,
              });
            }
            unitPrice = dbVariant.price;
          }
        }
      }

      calculatedItemsPrice += unitPrice * qty;
      verifiedItems.push({
        name: productName,
        quantity: qty,
        price: unitPrice,
        weight: item.weight || '250g',
        product: item.product || null,
      });
    }

    // 2. Re-validate coupon server-side
    let discountPrice = 0;
    let appliedCode = '';

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      });

      if (coupon && calculatedItemsPrice >= coupon.minOrderAmount) {
        appliedCode = coupon.code;
        discountPrice =
          coupon.discountType === 'FLAT'
            ? coupon.discountValue
            : Math.round((calculatedItemsPrice * coupon.discountValue) / 100);
        discountPrice = Math.min(discountPrice, calculatedItemsPrice);
      }
    }

    // 3. Calculate shipping, handling & grand total
    const shippingPrice = calculatedItemsPrice >= 499 ? 0 : 30;
    const handlingPrice = 12;
    const totalPrice = Math.max(0, calculatedItemsPrice - discountPrice + shippingPrice + handlingPrice);

    const paymentStatus = paymentResult?.status === 'COMPLETED' ? 'PAID' : 'PENDING';
    const userId = extractUserId(req);

    const order = await Order.create({
      user: userId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        pincode: customer.pincode.trim(),
      },
      orderItems: verifiedItems,
      itemsPrice: calculatedItemsPrice,
      discountPrice,
      shippingPrice,
      handlingPrice,
      totalPrice,
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      paymentStatus,
      paymentResult: paymentResult || {},
      deliveryInstruction: deliveryInstruction || 'door',
      gstinNumber: gstinNumber || '',
      couponCode: appliedCode,
    });

    // 4. Atomically deduct variant stock
    for (const item of verifiedItems) {
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        await Product.updateOne(
          { _id: item.product, 'variants.weight': item.weight },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message || 'Failed to place order' });
  }
});

// GET /api/orders/my-orders - Customer: Fetch logged-in user's orders
router.get('/my-orders', requireCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const conditions = [{ user: req.user.id }];
    if (user?.phone) {
      conditions.push({ 'customer.phone': user.phone });
    }

    const orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load your orders' });
  }
});

// PUT /api/orders/:id/cancel - Customer: Cancel order & restore variant stock
router.put('/:id/cancel', requireCustomer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const user = await User.findById(req.user.id);
    const isOwner =
      (order.user && String(order.user) === String(req.user.id)) ||
      (user?.phone && order.customer?.phone === user.phone);

    if (!isOwner) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }

    if (order.status !== 'Preparing Batch') {
      return res.status(400).json({
        message: `Cannot cancel order because it is already "${order.status}".`,
      });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock for cancelled items
    for (const item of order.orderItems || []) {
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        await Product.updateOne(
          { _id: item.product, 'variants.weight': item.weight },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
    }

    res.json({ message: 'Order cancelled and stock restored', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// GET /api/orders - Admin: Get all orders
router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/track/:identifier - Public: Track by phone or Order ID
router.get('/track/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { $or: [{ _id: identifier }, { 'customer.phone': identifier }] }
      : { 'customer.phone': identifier };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this phone number or order ID.' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to track order' });
  }
});

// PUT /api/orders/:id/status - Admin: Update order status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;