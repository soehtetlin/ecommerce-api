const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define Product API routes
// GET all products
router.get('/', productController.getAllProducts);

// GET a single product by ID
router.get('/:id', productController.getProductById);

// POST a new product
router.post('/', productController.createProduct);

// PUT (update) a product by ID
router.put('/:id', productController.updateProduct);

// DELETE a product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;