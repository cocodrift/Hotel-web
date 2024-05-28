const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
require('../config/passport-config')
const flash = require('connect-flash');
const passport = require('passport'); 

router.use(express.urlencoded({ extended: true }));
router.use(passport.initialize()); 


// Initialize flash middleware
router.use(flash());

router.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Login Page Route
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') }); 
});

// Login Action Route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin', 
  failureRedirect: '/login', 
  failureFlash: true 
}));

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
    res.redirect('/canteen'); 
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
  const { cart, tableNumber, paymentMethod } = req.body;

  if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ error: 'Invalid cart data' });
  }

  const totalPrice = calculateTotalPrice(cart);

  try {
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
          placedAt: new Date(),
          tableNumber,
          paymentMethod,
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
    const orders = await Order.find({ status: 'active' }).sort({ placedAt: -1 });
    res.render('orders', { orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/orders/clear/:id', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'cleared' });
    res.redirect('/orders');
  } catch (err) {
    console.error('Error updating order status:', err);
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

    res.redirect('/admin');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/deleteProduct/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).send('Product not found');
    }

    res.redirect('/admin');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/admin', async (req, res) => {
  try {
    const items = await Item.find();
    res.render('admin', { items, user: req.user });
  } catch (err) {
    console.error('Error fetching items for admin page:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
