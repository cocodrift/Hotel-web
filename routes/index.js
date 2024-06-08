// routes/index.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/isAuthenticated');
const { errorHandler } = require('../middleware/common');

// Render home page
router.get('/', homeController.renderHomePage);

// Admin page
router.get('/admin', isAuthenticated, adminController.renderAdminPage);

// Login routes
router.get('/login', authController.renderLoginPage);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);

// Render canteen page
router.get('/canteen', async (req, res, next) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    next(err);
  }
});

// Render contact page
router.get('/contact', (req, res) => {
  res.render('contact');
});

// Handle placing orders
router.post('/place-order', orderController.placeOrder);

// Use the error handler
router.use(errorHandler);

module.exports = router;
