const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Counter = require('../models/Counter');
const User = require('../models/User');

router.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Centralized error handler
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send('Internal Server Error');
}

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, password: hashedPassword });

  try {
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect('/admin');
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/admin', isAuthenticated, async (req, res, next) => {
  try {
    const items = await Item.find();
    res.render('admin', { items, user: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get('/canteen', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    next(err);
  }
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/addProducts', isAuthenticated, (req, res) => {
  res.render('addProducts');
});

router.post('/addProducts', isAuthenticated, async (req, res, next) => {
  const { name, category, imageUrl, priceInKES } = req.body;
  try {
    const newItem = new Item({ name, price: priceInKES, currency: 'KES', category, imageUrl, user: req.session.user });
    await newItem.save();
    res.redirect('/canteen');
  } catch (error) {
    next(error);
  }
});

function calculateTotalPrice(cart) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

router.post('/place-order', async (req, res, next) => {
  const { cart, tableNumber, paymentMethod } = req.body;
  if (!cart || !Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }
  const totalPrice = calculateTotalPrice(cart);
  try {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight
    const counter = await Counter.findOne({ name: 'orderNumber' });
    
    let orderNumber;
    if (!counter) {
      // If no counter exists, create a new one
      const newCounter = new Counter({ name: 'orderNumber', value: 1, lastUpdated: today });
      await newCounter.save();
      orderNumber = newCounter.value;
    } else {
      const lastUpdated = new Date(counter.lastUpdated).setHours(0, 0, 0, 0);
      if (lastUpdated < today) {
        // If the counter was last updated on a different day, reset it
        counter.value = 1;
        counter.lastUpdated = today;
      } else {
        // Otherwise, increment the counter
        counter.value += 1;
      }
      await counter.save();
      orderNumber = counter.value;
    }

    const order = new Order({ orderNumber, items: cart, totalPrice, placedAt: new Date(), tableNumber, paymentMethod });
    const savedOrder = await order.save();
    res.status(201).json({ message: 'Order placed successfully!', orderId: savedOrder._id, orderNumber });
  } catch (err) {
    next(err);
  }
});

router.get('admin/order-summary', isAuthenticated, async (req, res, next) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$placedAt" }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.render('order-summary', { summary ,  user: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get('admin/orders', isAuthenticated, async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'active' }).sort({ placedAt: -1 });
    res.render('orders', { user: req.session.user, orders });
  } catch (err) {
    next(err);
  }
});

router.post('admin/orders/clear/:id', isAuthenticated, async (req, res, next) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'cleared' });
    res.redirect('/orders');
  } catch (err) {
    next(err);
  }
});

router.get('admin/editProduct/:id', isAuthenticated, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.render('editProduct', { user: req.session.user, item });
  } catch (err) {
    next(err);
  }
});

router.post('admin/editProduct/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const { name, price, category, imageUrl, description } = req.body;
  try {
    const updatedProduct = await Item.findByIdAndUpdate(id, { name, price, category, imageUrl, description }, { new: true });
    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

router.post('admin/deleteProduct/:id', isAuthenticated, async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});

// Use the error handler
router.use(errorHandler);

module.exports = router;
