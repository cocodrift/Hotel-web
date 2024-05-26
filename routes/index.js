const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require( '../models/Order')

router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/canteen', async (req, res) => {
  try {
      const items = await Item.find();  // Fetch items from MongoDB
      res.render('canteen', { items });  // Render the template with items data
  } catch (err) {
      console.error('Failed to fetch items', err);
      res.status(500).send('Internal Server Error');
  }
});

router.post('/api/place-order', async (req, res) => {
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


router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/addProducts', (req, res) => {
  res.render('addProducts');
});

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
