const ProductService = require('../services/productService');

// @desc    Create a new base product
// @route   POST /api/products
// @access  Private (Admin Only)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        if (!name || !description || !category) {
            return res.status(400).json({ message: 'Name, description, and category are required.' });
        }

        const savedProduct = await ProductService.createProduct({ name, description, category });
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        // Pass the entire req.query object to the service layer
        const products = await ProductService.getAllProducts(req.query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single product by its ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await ProductService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product's base details
// @route   PUT /api/products/:id
// @access  Private (Admin Only)
exports.updateProduct = async (req, res) => {
    try {
        // Only allow updating specific fields
        const { name, description, category } = req.body;
        const updateData = { name, description, category };

        const updatedProduct = await ProductService.updateProduct(req.params.id, updateData);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product and all its variants
// @route   DELETE /api/products/:id
// @access  Private (Admin Only)
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await ProductService.deleteProduct(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product and all its variants deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};