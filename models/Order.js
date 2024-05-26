// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{ type: String }], // Adjust schema based on your needs
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
