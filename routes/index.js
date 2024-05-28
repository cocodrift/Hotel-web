const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
require('../config/passport-config');
const passport = require('passport');

// Custom session middleware
router.use((req, res, next) => {
  if (!req.cookies.sessionId) {
    const sessionId = uuid.v4();
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  }
  if (!req.session) {
    req.session = {};
  }
  next();
});

// Initialize Passport middleware
router.use(passport.initialize());
router.use(passport.session());

// Centralized error handler
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send('Internal Server Error');
}

// Helper function to check admin role
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

router.get('/admin', isAdmin, async (req, res) => {
  try {
    const items = await Item.find();
    res.render('admin', { items, user: req.user });
  } catch (err) {
    next(err);
  }
});

router.get('/canteen', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    next(err);
  }
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/addProducts', isAdmin, (req, res) => {
  res.render('addProducts');
});

router.post('/addProducts', isAdmin, async (req, res, next) => {
  const { name, category, imageUrl, priceInKES } = req.body;
  try {
    const newItem = new Item({ name, price: priceInKES, currency: 'KES', category, imageUrl });
    await newItem.save();
    res.redirect('/canteen');
  } catch (error) {
    next(error);
  }
});

function calculateTotalPrice(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

router.post('/place-order', async (req, res, next) => {
  const { cart, tableNumber, paymentMethod } = req.body;
  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }
  const totalPrice = calculateTotalPrice(cart);
  try {
    const counter = await Counter.findOneAndUpdate({ name: 'orderNumber' }, { $inc: { value: 1 } }, { new: true, upsert: true });
    const orderNumber = counter.value;
    const order = new Order({ orderNumber, items: cart, totalPrice, placedAt: new Date(), tableNumber, paymentMethod });
    const savedOrder = await order.save();
    res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'active' }).sort({ placedAt: -1 });
    res.render('orders', { orders });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/clear/:id', async (req, res, next) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'cleared' });
    res.redirect('/orders');
  } catch (err) {
    next(err);
  }
});

router.get('/editProduct/:id', isAdmin, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.render('editProduct', { item });
  } catch (err) {
    next(err);
  }
});

router.post('/editProduct/:id', isAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { name, price, category, imageUrl, description } = req.body;
  try {
    const updatedProduct = await Item.findByIdAndUpdate(id, { name, price, category, imageUrl, description }, { new: true });
    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

router.post('/deleteProduct/:id', isAdmin, async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

// Use the error handler
router.use(errorHandler);

module.exports = router;
