const Product = require('../models/Product'); // Import the Product Model

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    // Find all documents in the Product collection
    const products = await Product.find({});
    // Respond with a 200 OK status and the list of products
    res.status(200).json(products);
  } catch (error) {
    // If a server error occurs, respond with a 500 status
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by its ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    // Find a product by the ID provided in the URL parameters
    const product = await Product.findById(req.params.id);

    // If no product is found, respond with 404 Not Found
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Respond with the found product
    res.status(200).json(product);
  } catch (error) {
    // Handle potential server errors or invalid ID format (CastError)
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (should be restricted to admins in a real app)
exports.createProduct = async (req, res) => {
  // Destructure name, price, and stock from the request body
  const { name, description, category } = req.body;

  // Basic validation to ensure all fields are present
  // Checking for null allows price or stock to be 0, which is a valid value
  if (!name || !description || !category)  {
    return res.status(400).json({ message: 'Please provide all required fields: name, description, and category'  });
  }

  try {
    // Create a new instance of the Product model
    const newProduct = new Product({
      name,
      description,
      category
    });

    // Save the new product to the database
    const savedProduct = await newProduct.save();
    // Respond with 201 Created and the new product data
    res.status(201).json(savedProduct);
  } catch (error) {
    // Handle duplicate key error (if a product with the same name already exists)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A product with this name already exists.' });
    }
    // Handle other validation errors (e.g., price is negative)
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an existing product by its ID
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  const { name, description, category } = req.body;

  try {
    // Create an object with the fields to be updated
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product by its ID
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    // Find a product by its ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Respond with a success message and the data of the deleted product
    res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};