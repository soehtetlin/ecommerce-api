const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Import the middleware
const { protect, adminOnly } = require('../middleware/authMiddleware');

//================================================================
// CUSTOMER & ADMIN Routes (Authenticated Users)
//================================================================

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private (Requires login)
router.post('/', protect, orderController.placeOrder);

// @route   GET /api/orders/my-orders
// @desc    Get all orders for the logged-in user
// @access  Private (Requires login)
// NOTE: This route must be placed BEFORE '/:id' to work correctly.
router.get('/my-orders', protect, orderController.getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get a single order by its ID
// @access  Private (Owner or Admin)
router.get('/:id', protect, orderController.getOrderById);


//================================================================
// ADMIN-ONLY Routes
//================================================================

// @route   GET /api/orders
// @desc    Get all orders from all users
// @access  Private (Admin Only)
router.get('/', protect, adminOnly, orderController.getAllOrders);

// @route   GET /api/orders/customer/:customerName
// @desc    Get orders by a specific customer name
// @access  Private (Admin Only)
router.get('/customer/:customerName', protect, adminOnly, orderController.getOrdersByCustomer);

// @route   PUT /api/orders/:id/status
// @desc    Update an order's status
// @access  Private (Admin Only)
router.put('/:id/status', protect, adminOnly, orderController.updateOrderStatus);

module.exports = router;