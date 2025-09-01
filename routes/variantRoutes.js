const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Note: These routes are protected and can only be accessed by an ADMIN.

// @route   POST /api/products/:productId/variants
// @desc    Add a new variant to a specific product
// @access  Private (Admin Only)
router.post('/products/:productId/variants', protect, adminOnly, variantController.addVariant);

// @route   PUT /api/variants/:variantId
// @desc    Update a specific variant's details (e.g., price, stock)
// @access  Private (Admin Only)
router.put('/variants/:variantId', protect, adminOnly, variantController.updateVariant);

// @route   DELETE /api/variants/:variantId
// @desc    Delete a specific variant
// @access  Private (Admin Only)
router.delete('/variants/:variantId', protect, adminOnly, variantController.deleteVariant);

module.exports = router;