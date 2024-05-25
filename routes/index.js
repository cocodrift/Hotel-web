const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Category = require('../models/Category');

router.get('/', (req, res) => {
  res.render('index');
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

router.post('/addProducts', (req, res) => {
  const newItem = new Item({
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    imageUrl: req.body.imageUrl, // Add the imageUrl field
  });

  newItem.save()
    .then(() => res.redirect('/canteen'))
    .catch(err => res.status(400).send('Unable to save item to database'));
});

module.exports = router;
