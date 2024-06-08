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

console.log(homeController.renderHomePage); // Should log [Function: renderHomePage] if correctly defined

router.get('/', homeController.renderHomePage);
router.get('/admin', isAuthenticated, adminController.renderAdminPage);
router.get('/login', authController.renderLoginPage);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);
router.get('/canteen', canteenController.renderCanteenPage);
router.get('/contact', contactController.renderContactPage);
router.post('/place-order', orderController.placeOrder);

router.use(errorHandler);

module.exports = router;
