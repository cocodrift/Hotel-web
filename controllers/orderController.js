// controllers/orderController.js
const Order = require('../models/Order');
const Counter = require('../models/Counter');

exports.placeOrder = async (req, res, next) => {
  const { cart, tableNumber, paymentMethod } = req.body;
  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  try {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight

    // Find the current counter, check if it's for today, and reset if necessary
    const counter = await Counter.findOne({ name: 'orderNumber' });

    let orderNumber;

    if (!counter) {
      // If no counter exists, create a new one starting from 1
      const newCounter = new Counter({ name: 'orderNumber', value: 1, lastUpdated: today });
      await newCounter.save();
      orderNumber = newCounter.value;
    } else {
      // If the last updated date is not today, reset the counter
      const lastUpdated = new Date(counter.lastUpdated).setHours(0, 0, 0, 0);
      
      if (lastUpdated < today) {
        // Reset the counter for the new day
        counter.value = 1;
        counter.lastUpdated = today;
      } else {
        // Increment the counter if it's the same day
        counter.value += 1;
      }
      
      await counter.save();
      orderNumber = counter.value;
    }

    const order = new Order({
      orderNumber,
      items: cart,
      totalPrice,
      placedAt: new Date(),
      tableNumber,
      paymentMethod
    });

    const savedOrder = await order.save();

    res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
    console.error('Error in placeOrder:', err); // Log detailed error information
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
