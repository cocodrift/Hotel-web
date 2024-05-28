// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: Number, required: true },
  items: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  placedAt: { type: Date, default: Date.now },
  tableNumber: { type: Number, required: true },
  paymentMethod: { type: String, required: true }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
