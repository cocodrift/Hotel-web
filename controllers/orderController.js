// controllers/orderController.js
const Order = require('../models/Order');
const Counter = require('../models/Counter');

exports.placeOrder = async (req, res, next) => {
  const { cart, phoneNumber, paymentMethod } = req.body;

  // Validate the cart
  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  try {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight

    // Atomically find the counter and increment the order number
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' }, // Find the order number counter
      {
        $setOnInsert: { lastUpdated: today }, // Set lastUpdated only if a new document is created
        $inc: { value: 1 },
      },
      { new: true, upsert: true } // Create a new counter if none exists
    );

    const orderNumber = counter.value; // Use the updated order number

    // Create and save the order
    const order = new Order({
      orderNumber,
      items: cart,
      totalPrice,
      placedAt: new Date(),
      phoneNumber,
      paymentMethod,
    });

    const savedOrder = await order.save();

    // Respond with success
    res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
    console.error('Error in placeOrder:', err); // Log detailed error information
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
