const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Display add product form
router.get('/addProducts', isAuthenticated, adminController.getAddProduct);

// Handle adding a new product
router.post('/addProducts', isAuthenticated, adminController.postAddProduct);

// Display orders
router.get('/orders', isAuthenticated, adminController.getOrders);

// Display today's order summary
router.get('/order-summary', isAuthenticated, adminController.getOrderSummary);

// Display edit product form
router.get('/editProduct/:id', isAuthenticated, adminController.getEditProduct);

// Handle editing a product
router.post('/editProduct/:id', isAuthenticated, adminController.postEditProduct);

// Handle  deleting a product
router.post('/deleteProduct/:id', isAuthenticated, adminController.deleteProduct);

// Assuming you have a router defined in your admin routes file
router.post('/orders/clear/:id', orderController.clearOrder);


module.exports = router;
