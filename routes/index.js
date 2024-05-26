const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/canteen','/canteen/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const items = await Item.find({ category });
    res.render('canteen', { items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
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
