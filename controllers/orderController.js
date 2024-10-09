// controllers/orderController.js
const Order = require('../models/Order');
const Counter = require('../models/Counter');

exports.placeOrder = async (req, res, next) => {
  const { cart, tableNumber, paymentMethod } = req.body;
  console.log('Received order:', { cart, tableNumber, paymentMethod }); // Log incoming order data

  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  console.log('Total price calculated:', totalPrice);

  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const counter = await Counter.findOne({ name: 'orderNumber' });
    console.log('Counter retrieved:', counter);

    // Continue with the rest of the logic and log important variables...
  } catch (err) {
    console.error('Error in placeOrder:', err); // Log detailed error information
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


    const order = new Order({ orderNumber, items: cart, totalPrice, placedAt: new Date(), tableNumber, paymentMethod });
    const savedOrder = await order.save();
    res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
    next(err);
  }
};
