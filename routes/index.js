const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); // Ensure this path is correct

// Middleware to log requests
const morgan = require('morgan');
router.use(morgan('dev'));

router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    console.error('Error rendering index:', err);
    res.status(500).send('Internal Server Error');
  }
});

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
  try {
    res.render('contact');
  } catch (err) {
    console.error('Error rendering contact:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/addProducts', (req, res) => {
  try {
    res.render('addProducts');
  } catch (err) {
    console.error('Error rendering addProducts:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/addProducts', async (req, res) => {
  const { name, price, category, imageUrl } = req.body;

  try {
    const newItem = new Item({
      name,
      price,
      category: Array.isArray(category) ? category : [category], // Ensure category is an array
      imageUrl
    });

    await newItem.save();
    res.redirect('/canteen');
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
