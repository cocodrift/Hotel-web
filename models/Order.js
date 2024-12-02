// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: Number, required: true, unique: true },
    items: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    totalPrice: { type: Number, required: true },
    phoneNumber: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['mobile-money', 'cash'], // Ensure it's one of the specified values
    },
    placedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
