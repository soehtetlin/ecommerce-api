const Product = require('../models/Product');

class ProductRepository {
    async create(productData) { return new Product(productData).save(); }
    async findById(id) { return Product.findById(id); }
    async updateById(id, updateData) { return Product.findByIdAndUpdate(id, updateData, { new: true }); }
    async deleteById(id) { return Product.findByIdAndDelete(id); }

    /**
     * Finds all products with filtering, sorting, and pagination.
     * @param {object} filters - e.g., { category: 'Electronics' }
     * @param {object} sorting - e.g., { price: 1 } for ascending, { price: -1 } for descending
     * @param {object} pagination - e.g., { skip: 0, limit: 10 }
     * @returns {Promise<Array<Document>>} A list of products.
     */
    async findAll(filters = {}, sorting = {}, pagination = {}) {
        // Start with a basic query using the filters
        let query = Product.find(filters);

        // Apply sorting if provided
        if (sorting.sortBy) {
            const sortOrder = sorting.order === 'desc' ? -1 : 1;
            query = query.sort({ [sorting.sortBy]: sortOrder });
        }

        // Apply pagination if provided
        if (pagination.limit) {
            query = query.skip(pagination.skip || 0).limit(pagination.limit);
        }

        // Populate the 'variants' field for each product
        return query.populate('variants').exec();
    }
    
    /**
     * Adds a variant's ID to a product's variants array.
     * @param {string} productId - The ID of the parent product.
     * @param {string} variantId - The ID of the new variant to add.
     */
    async addVariantToProduct(productId, variantId) {
        return Product.findByIdAndUpdate(
            productId,
            { $push: { variants: variantId } }, // Use $push to add an item to an array
            { new: true }
        );
    }

    /**
     * Removes a variant's ID from a product's variants array.
     * @param {string} productId - The ID of the parent product.
     * @param {string} variantId - The ID of the variant to remove.
     */
    async removeVariantFromProduct(productId, variantId) {
        return Product.findByIdAndUpdate(
            productId,
            { $pull: { variants: variantId } }, // Use $pull to remove an item from an array
            { new: true }
        );
    }
}

module.exports = new ProductRepository();