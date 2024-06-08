// routes/index.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const canteenController = require('../controllers/canteenController');
const contactController = require('../controllers/contactController');
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
router.get('/canteen', canteenController.renderCanteenPage);

// Render contact page
router.get('/contact', contactController.renderContactPage);

// Handle placing orders
router.post('/place-order', orderController.placeOrder);

// Use the error handler
router.use(errorHandler);

module.exports = router;
