// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for guest checkout
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        weight: { type: String, required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      },
    ],
    itemsPrice: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    handlingPrice: { type: Number, default: 12 },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
    },
    deliveryInstruction: { type: String, default: 'door' },
    gstinNumber: { type: String, default: '' },
    couponCode: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Preparing Batch', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Preparing Batch',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);