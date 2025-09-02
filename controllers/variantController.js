const VariantRepository = require('../repositories/variantRepository');
const ProductRepository = require('../repositories/productRepository');

// Add a new variant to a product
exports.addVariant = async (req, res) => {
  const { productId } = req.params;
  const { size, color, price, stock, sku } = req.body;

  try {
    // 1. Find the parent product using the ProductRepository
    const product = await ProductRepository.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Parent product not found' });
    }

    // 2. Create the new variant instance data
    const newVariantData = {
      product: productId,
      size,
      color,
      price,
      stock,
      sku
    };

    // 3. Save the new variant using the VariantRepository
    const savedVariant = await VariantRepository.create(newVariantData);

    // 4. Add the new variant's ID to the parent product using the ProductRepository
    // This logic is now handled by a dedicated repository method for clarity.
    await ProductRepository.addVariantToProduct(productId, savedVariant._id);

    res.status(201).json(savedVariant);
  } catch (error) {
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
    // Use the VariantRepository to update the document
    const updatedVariant = await VariantRepository.updateById(variantId, req.body);

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
        // 1. Find and delete the variant using the VariantRepository
        const deletedVariant = await VariantRepository.deleteById(variantId);
        
        if (!deletedVariant) {
            return res.status(404).json({ message: 'Variant not found' });
        }

        // 2. Remove the variant's ID from the parent product's 'variants' array
        // We need a new method in ProductRepository for this. Let's call it removeVariantFromProduct.
        await ProductRepository.removeVariantFromProduct(deletedVariant.product, variantId);

        res.status(200).json({ message: 'Variant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};