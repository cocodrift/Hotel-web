const express = require('express');
const router = express.Router();
const Item = require('../models/Item');


router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    next(error)
  }
});

router.get('/canteen', (req, res) => {
  // Assuming Item.find() retrieves items from the database
  Item.find()
    .then(items => {
      res.render('canteen', { items }); // Pass the items variable to the view
    })
    .catch(err => {
      console.error('Error fetching items:', err);
      res.status(500).send('Error fetching items');
    });
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
      res.redirect('/');
  } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).send('Internal Server Error');
  }

  newItem.save()
    .then(() => res.redirect('/canteen'))
    .catch(err => res.status(400).send('Unable to save item to database'));
});

module.exports = router;
