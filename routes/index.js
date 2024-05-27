const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const convertCurrency = require('../utils/currencyConverter');

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
    const items = await Item.find();
    const itemsWithPricesInKES = await Promise.all(items.map(async (item) => {
      const convertedPrice = await convertCurrency(item.price, 'USD', 'KES'); // Update to convert to KES
      return {
        ...item.toObject(),
        price: convertedPrice,
        currency: 'KES' // Update currency to KES
      };
    }));
    res.render('canteen', { items: itemsWithPricesInKES });
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
  const { name, category, imageUrl, currency } = req.body;
  const priceInKES = parseFloat(req.body.priceInKES);


  try {
    const convertedPrice = await convertCurrency(priceInKES, 'KES', 'USD');

    const newItem = new Item({
      name,
      price: convertedPrice,
      currency: 'USD',
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



router.get('/editProduct/:id', async (req, res) => {
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

router.post('/editProduct/:id', async (req, res) => {
  const { name, price, category, imageUrl } = req.body;

  try {
    const item = await Item.findByIdAndUpdate(req.params.id, {
      name,
      price,
      category,
      imageUrl
    }, { new: true });

    if (!item) {
      return res.status(404).send('Product not found');
    }

    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete Product Route
router.post('/deleteProduct/:id', async (req, res) => {
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
router.get('/admin', async (req, res) => {
  try {
    const items = await Item.find();
    res.render('admin', { items });
  } catch (err) {
    console.error('Error fetching items for admin page:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
