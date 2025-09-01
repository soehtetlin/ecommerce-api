const express = require('express');
const router = express.Router();

// Import controller functions for handling product logic
const productController = require('../controllers/productController');

// Import middleware for authentication and authorization
const { protect, adminOnly } = require('../middleware/authMiddleware');

//================================================================
// Public Routes - No authentication required
//================================================================

// @route   GET /api/products
// @desc    Fetch all products
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Fetch a single product by its ID
// @access  Public
router.get('/:id', productController.getProductById);

//================================================================
// Admin-Only Routes - Requires user to be authenticated AND have an ADMIN role
//================================================================

// To access these routes, a valid JWT must be sent in the Authorization header.
// The `protect` middleware verifies the token and attaches the user to the request object.
// The `adminOnly` middleware then checks if `req.user.role` is 'ADMIN'.

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin Only)
router.post('/', protect, adminOnly, productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private (Admin Only)
router.put('/:id', protect, adminOnly, productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin Only)
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;