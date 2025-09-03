const ProductRepository = require('../repositories/productRepository');
const VariantRepository = require('../repositories/variantRepository');

class ProductService {

    /**
     * Handles the business logic for creating a new base product.
     * @param {object} productData - Contains name, description, category.
     * @returns {Promise<Document>} The newly created product.
     */
    async createProduct(productData) {
        // Business logic could be added here in the future,
        // e.g., checking if the category exists.
        return ProductRepository.create(productData);
    }

    /**
     * Handles the business logic for adding a new variant to an existing product.
     * @param {string} productId - The ID of the parent product.
     * @param {object} variantData - Contains size, color, price, stock, sku.
     * @returns {Promise<Document>} The newly created variant.
     */
    async addVariantToProduct(productId, variantData) {
        const product = await ProductRepository.findById(productId);
        if (!product) {
            throw new Error('Parent product not found');
        }

        const newVariantData = { ...variantData, product: productId };
        const savedVariant = await VariantRepository.create(newVariantData);

        await ProductRepository.addVariantToProduct(productId, savedVariant._id);
        
        return savedVariant;
    }

    /**
     * Retrieves a list of all products based on query parameters.
     * This service prepares the query options for the repository.
     * @param {object} queryParams - Raw query parameters from the request (e.g., req.query).
     * @returns {Promise<Array<Document>>} A list of products.
     */
    async getAllProducts(queryParams) {
        // 1. Prepare Filters for the query
        const filters = {};
        if (queryParams.category) {
            filters.category = queryParams.category;
        }
        // 2. Prepare Sorting options
        const sorting = {};
        if (queryParams.sortBy) {
            const parts = queryParams.sortBy.split(':');
            sorting.sortBy = parts[0]; // e.g., 'price'
            sorting.order = parts[1] === 'desc' ? 'desc' : 'asc';
        }

        // 3. Prepare Pagination options
        const pagination = {};
        const page = parseInt(queryParams.page, 10) || 1;
        const limit = parseInt(queryParams.limit, 10) || 10;
        pagination.limit = limit;
        pagination.skip = (page - 1) * limit;

        // 4. Call the repository with the prepared, structured options
        const products = await ProductRepository.findAll(filters, sorting, pagination);
        return products;
    }

    /**
     * Retrieves a single product by its ID.
     * @param {string} productId - The ID of the product.
     * @returns {Promise<Document|null>} The product document or null.
     */
    async getProductById(productId) {
        return ProductRepository.findById(productId);
    }
    
    /**
     * Updates a base product's details.
     * @param {string} productId - The ID of the product to update.
     * @param {object} updateData - The fields to update.
     * @returns {Promise<Document|null>} The updated product document.
     */
    async updateProduct(productId, updateData) {
        return ProductRepository.updateById(productId, updateData);
    }

    /**
     * Deletes a product and all its associated variants.
     * This is a complex business logic that involves multiple repositories.
     * @param {string} productId - The ID of the product to delete.
     * @returns {Promise<Document|null>} The deleted product document.
     */
    async deleteProduct(productId) {
        // First, delete all variants associated with this product.
        await VariantRepository.deleteByProductId(productId);
        
        // Then, delete the product itself.
        return ProductRepository.deleteById(productId);
    }
}

module.exports = new ProductService();