const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require('../models/Order');


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

// POST route to handle placing orders
router.post('/place-order', async (req, res) => {
  const { cart, customer } = req.body;

  try {
      // Create a new order instance
      const newOrder = new Order({
          items: cart.map(item => ({
              productId: item.productId,
              quantity: item.quantity
          })),
          totalPrice: calculateTotalPrice(cart), // Define your own function to calculate total price
          customer,
          status: 'pending' // You can set an initial status if needed
      });

      // Save the order to the database
      await newOrder.save();

      res.status(200).json({ message: 'Order placed successfully!', order: newOrder });
  } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Failed to place order. Please try again later.' });
  }
});



// GET route to render the editProduct form
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
