const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const { errorHandler} = require('../middleware/common');
const isAuthenticated = require('../middleware/isAuthenticated');

// Render home page
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/admin', async (req, res) => {
  try {
    const items = await Item.find();
    console.log('Items fetched for admin page:', items); // Debugging output
    res.render('admin', { items });
  } catch (err) {
    console.error('Error fetching items for admin page:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Handle logout
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    req.session.destroy();
    res.redirect('/');
  });
});

// Render canteen page
router.get('/canteen', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    next(err);
  }
});

// Render contact page
router.get('/contact', (req, res) => {
  res.render('contact');
});

// Handle placing orders
router.post('/place-order', async (req, res, next) => {
  const { cart, tableNumber, paymentMethod } = req.body;
  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  try {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight
    const counter = await Counter.findOne({ name: 'orderNumber' });

    let orderNumber;
    if (!counter) {
      // If no counter exists, create a new one
      const newCounter = new Counter({ name: 'orderNumber', value: 1, lastUpdated: today });
      await newCounter.save();
      orderNumber = newCounter.value;
    } else {
      const lastUpdated = new Date(counter.lastUpdated).setHours(0, 0, 0, 0);
      if (lastUpdated < today) {
        // If the counter was last updated on a different day, reset it
        counter.value = 1;
        counter.lastUpdated = today;
      } else {
        // Otherwise, increment the counter
        counter.value += 1;
      }
      await counter.save();
      orderNumber = counter.value;
    }

    const order = new Order({ orderNumber, items: cart, totalPrice, placedAt: new Date(), tableNumber, paymentMethod });
    const savedOrder = await order.save();
    res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
    next(err);
  }
});

// Use the error handler
router.use(errorHandler);

module.exports = router;
