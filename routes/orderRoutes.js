const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Define Order API routes
// POST to place a new order
router.post('/', orderController.placeOrder);

// GET all orders
router.get('/', orderController.getAllOrders);

// GET a single order by ID
router.get('/:id', orderController.getOrderById);

// GET orders by customer name
router.get('/customer/:customerName', orderController.getOrdersByCustomer);

// PUT (update) order status by ID
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;