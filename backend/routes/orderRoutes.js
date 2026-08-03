// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyAdmin } = require('../middleware/authMiddleware');
const sendWhatsAppMessage = require('../utils/sendWhatsApp');

// GET /api/orders/track/:phone - Public: Track orders by customer phone number
router.get('/track/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.phone': req.params.phone }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found associated with this phone number.' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order status' });
  }
});

// POST /api/orders - Public: Place a new order
router.post('/', async (req, res) => {
  try {
    const { customer, orderItems, itemsPrice, shippingPrice, totalPrice, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in cart' });
    }

    const order = new Order({
      customer,
      orderItems,
      itemsPrice,
      shippingPrice,
      totalPrice,
      paymentMethod,
    });

    const createdOrder = await order.save();

    // 📲 1. TRIGGER ORDER CONFIRMATION WHATSAPP
    const itemListText = orderItems
      .map((item) => `• ${item.quantity}x ${item.name} (${item.weight}) - ₹${item.price * item.quantity}`)
      .join('\n');

    const confirmationMsg = `🌶️ *ORDER CONFIRMED - CHICKEN PICKLE STORE*\n\nHi ${customer.name}, thank you for your order!\n\n📦 *Order Items:*\n${itemListText}\n\n💰 *Total Amount:* ₹${totalPrice} (${paymentMethod})\n📍 *Delivery Address:* ${customer.address} (${customer.pincode})\n\nWe are preparing your fresh batch right now! 🍗\nTrack live updates at: http://localhost:3000/track`;

    sendWhatsAppMessage(customer.phone, confirmationMsg);

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to place order' });
  }
});

// GET /api/orders - Protected: Admin only
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/status - Protected: Admin only
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // 📲 2. TRIGGER STATUS UPDATE WHATSAPP
    const statusEmoji = {
      'Preparing Batch': '🌶️',
      Packed: '📦',
      'Out for Delivery': '🚚',
      Delivered: '✅',
    }[status] || '📦';

    const statusMsg = `📦 *ORDER STATUS UPDATE - CHICKEN PICKLE STORE*\n\nHi ${order.customer.name}, your order status has changed!\n\nStatus: *${status}* ${statusEmoji}\n\nTrack your order anytime at: http://localhost:3000/track`;

    sendWhatsAppMessage(order.customer.phone, statusMsg);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;