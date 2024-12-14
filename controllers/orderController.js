const Order = require('../models/Order');
const Counter = require('../models/Counter');

exports.placeOrder = async (req, res, next) => {
  const { cart, phoneNumber, paymentMethod } = req.body;

  // Validate input data
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or invalid.' });
  }
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    return res.status(400).json({ error: 'Invalid payment method.' });
  }

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  try {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight

    // Atomically find and increment the counter for order numbers
    const counter = await Counter.findOneAndUpdate(
      { name: 'orderNumber' },
      {
        $setOnInsert: { name: 'orderNumber', lastUpdated: today }, // Set initial values if creating
        $inc: { value: 1 },
      },
      { new: true, upsert: true }
    );

    const orderNumber = counter.value;

    // Create a new order document
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
    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: savedOrder._id,
      orderNumber,
    });
  } catch (err) {
    console.error('Error in placeOrder:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
