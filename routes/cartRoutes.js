const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes should be protected, as they belong to a specific user.
router.use(protect);

// @route   GET /api/cart
// @desc    Get the current user's shopping cart
// @access  Private
router.get('/', cartController.getCart);

// @route   POST /api/cart
// @desc    Add an item to the user's shopping cart
// @access  Private
router.post('/', cartController.addItemToCart);

// You can add PUT and DELETE routes here for updating/removing items

module.exports = router;