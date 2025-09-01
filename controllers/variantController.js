const Variant = require('../models/Variant');
const Product = require('../models/Product');

// Add a new variant to a product
exports.addVariant = async (req, res) => {
  const { productId } = req.params;
  const { size, color, price, stock, sku } = req.body;

  try {
    // 1. Find the parent product to ensure it exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Parent product not found' });
    }

    // 2. Create the new variant instance
    const newVariant = new Variant({
      product: productId,
      size,
      color,
      price,
      stock,
      sku
    });

    // 3. Save the new variant to the database
    const savedVariant = await newVariant.save();

    // 4. Add the new variant's ID to the parent product's 'variants' array
    product.variants.push(savedVariant._id);
    await product.save();

    res.status(201).json(savedVariant);
  } catch (error) {
    // Handle potential duplicate SKU error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A variant with this SKU already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update an existing variant
exports.updateVariant = async (req, res) => {
  const { variantId } = req.params;
  
  try {
    const updatedVariant = await Variant.findByIdAndUpdate(
      variantId,
      req.body, // The request body will contain fields to update, e.g., { "price": 99.99 }
      { new: true, runValidators: true }
    );

    if (!updatedVariant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    res.status(200).json(updatedVariant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a variant
exports.deleteVariant = async (req, res) => {
    const { variantId } = req.params;

    try {
        // 1. Find and delete the variant
        const deletedVariant = await Variant.findByIdAndDelete(variantId);
        
        if (!deletedVariant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        // 2. Remove the variant's ID from the parent product's 'variants' array
        await Product.findByIdAndUpdate(
            deletedVariant.product,
            { $pull: { variants: variantId } } // $pull removes an item from an array
        );

        res.status(200).json({ message: 'Variant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};