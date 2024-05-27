const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require('../models/Order');
const Counter = require('../models/Counter'); 


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

function calculateTotalPrice(cart) {
  let totalPrice = 0;
  for (const item of cart) {
      totalPrice += item.price * item.quantity;
  }
  return totalPrice;
}

router.post('/place-order', async (req, res) => {
  const { cart } = req.body;
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
          placedAt: new Date()
      });

      const savedOrder = await order.save();
      res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
      console.error('Error placing order:', err);
      res.status(500).json({ error: 'Failed to place order. Please try again later.' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ placedAt: -1 }); // Sort orders by the date they were placed
    res.render('orders', { orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Internal Server Error');
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
