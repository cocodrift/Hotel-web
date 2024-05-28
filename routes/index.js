const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
require('../config/passport-config')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport'); // Make sure Passport.js is configured and initialized
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

router.use(express.urlencoded({ extended: true }));
router.use(passport.initialize()); // Initialize Passport.js

const sessionSecret = process.env.SESSION_SECRET || 'default_secret_key';

// Set up session middleware
router.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
}));

const User = require('../models/User'); // Make sure to import the User model

// Initialize flash middleware
router.use(flash());

router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Login Page Route
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') }); // Render login form with flash message
});

// Login Action Route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin', // Redirect to the admin page on successful login
  failureRedirect: '/login', // Redirect back to the login page on failure
  failureFlash: true // Enable flash messages for displaying login errors
}));



router.get('/canteen', async (req, res) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Error fetching items');
  }
});


router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/addProducts', (req, res) => {
  res.render('addProducts');
});


router.post('/addProducts', async (req, res) => {
  const { name, category, imageUrl, priceInKES } = req.body;

  try {
    const newItem = new Item({
      name,
      price: priceInKES,
      currency: 'KES',
      category,
      imageUrl
    });

    await newItem.save();
    res.redirect('/canteen'); // Redirect to the canteen page after adding a new item
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Internal Server Error');
  }
});

function calculateTotalPrice(cart) {
  let totalPrice = 0;
  for (const item of cart) {
      totalPrice += item.price * item.quantity;
  }
  return totalPrice;
}

router.post('/place-order', async (req, res) => {
  const { cart, tableNumber, paymentMethod } = req.body;

  if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ error: 'Invalid cart data' });
  }

  const totalPrice = calculateTotalPrice(cart);

  try {
      // Get the current order number
      let counter = await Counter.findOneAndUpdate(
          { name: 'orderNumber' },
          { $inc: { value: 1 } },
          { new: true, upsert: true }
      );

      const orderNumber = counter.value;

      const order = new Order({
          orderNumber,
          items: cart,
          totalPrice,
          placedAt: new Date(),
          tableNumber,
          paymentMethod,
      });

      const savedOrder = await order.save();
      res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
      console.error('Error placing order:', err);
      res.status(500).json({ error: 'Failed to place order. Please try again later.' });
  }
});

router.get('/orders',  ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'active' }).sort({ placedAt: -1 });
    res.render('orders', { orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to move an order to cleared status
router.post('/orders/clear/:id',  ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'cleared' });
    res.redirect('/orders');
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).send('Internal Server Error');
  }
});


// GET route to render the editProduct form
router.get('/editProduct/:id',  ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const items = await Item.find();
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.render('editProduct', { item, items });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST route to update product details and description
router.post('/editProduct/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, imageUrl, description } = req.body;

  try {
    const updatedProduct = await Item.findByIdAndUpdate(id, {
      name,
      price,
      category,
      imageUrl,
      description
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }

    // Redirect to admin page after successful update
    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete Product Route
router.post('/deleteProduct/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).send('Product not found');
    }

    res.redirect('/admin'); // Redirect to the admin page after deleting a product
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to display all products on the admin page
router.get('/admin', ensureAuthenticated, ensureAdmin, async (req, res) => {
  try {
    const items = await Item.find();
    res.render('admin', { items, user: req.user }); // Pass the user object to the template
  } catch (err) {
    console.error('Error fetching items for admin page:', err);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
