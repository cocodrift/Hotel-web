const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require('../models/Order');
const logger = require('../middleware/logger');

// Render the home page
router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Render the canteen page with items fetched from MongoDB
router.get('/canteen', async (req, res) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    console.error('Failed to fetch items', err);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to place an order
router.post('/place-order', async (req, res) => {
  const { cart } = req.body;

  try {
    const order = new Order({ items: cart });
    await order.save();
    res.json({ message: 'Order placed successfully', orderId: order._id });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Render the contact page
router.get('/contact', (req, res) => {
  res.render('contact');
});

// Render the add products page
router.get('/addProducts', (req, res) => {
  res.render('addProducts');
});

// Handle form submission to add a new product
router.post('/addProducts', async (req, res) => {
  const { name, price, category, imageUrl } = req.body;

  try {
    const newItem = new Item({
      name,
      price,
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

module.exports = router;
