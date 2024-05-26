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

router.get('/canteen', async (req, res) => {
  try {
      const items = await Item.find();  // Fetch items from MongoDB
      res.render('canteen', { items });  // Render the template with items data
  } catch (err) {
      console.error('Failed to fetch items', err);
      res.status(500).send('Internal Server Error');
  }
});
// Dummy cart for simplicity (in a real app, use session or database)
let cart = [];

// Route to add items to cart
router.post('/cart/add', async (req, res) => {
    const itemId = req.body.id;
    try {
        const item = await Item.findById(itemId);
        if (item) {
            cart.push(item);  // Add item to cart
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        console.error('Failed to add item to cart', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to view cart
router.get('/cart', (req, res) => {
    res.render('cart', { cart });  // Render the cart template with cart data
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
