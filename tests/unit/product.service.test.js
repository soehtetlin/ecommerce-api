const ProductService = require('../../services/productService');
const ProductRepository = require('../../repositories/productRepository');
const VariantRepository = require('../../repositories/variantRepository');

// Mock the entire repository layer
jest.mock('../../repositories/productRepository');
jest.mock('../../repositories/variantRepository');

describe('Product Service', () => {

    // Clear all mocks before each test to ensure test isolation
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //================================================================
    // Test Suite for: createProduct
    //================================================================
    describe('createProduct', () => {
        it('should call ProductRepository.create with correct data', async () => {
            const productData = { name: 'New Keyboard', description: 'Mechanical keyboard', category: 'Electronics' };

            // Arrange: Mock the repository's create function
            ProductRepository.create.mockResolvedValue({ _id: '123', ...productData });

            // Act: Call the service method
            await ProductService.createProduct(productData);

            // Assert: Check if the repository method was called correctly
            expect(ProductRepository.create).toHaveBeenCalledTimes(1);
            expect(ProductRepository.create).toHaveBeenCalledWith(productData);
        });
    });

    //================================================================
    // Test Suite for: addVariantToProduct
    //================================================================
    describe('addVariantToProduct', () => {
        it('should add a variant to a product successfully', async () => {
            const productId = 'prod_123';
            const variantData = { sku: 'KB-RED', price: 99, stock: 50 };
            const mockProduct = { _id: productId, name: 'Keyboard' };
            const savedVariant = { _id: 'var_456', ...variantData, product: productId };

            // Arrange
            ProductRepository.findById.mockResolvedValue(mockProduct);
            VariantRepository.create.mockResolvedValue(savedVariant);
            ProductRepository.addVariantToProduct.mockResolvedValue({}); // Mock this call as well

            // Act
            const result = await ProductService.addVariantToProduct(productId, variantData);

            // Assert
            expect(ProductRepository.findById).toHaveBeenCalledWith(productId);
            expect(VariantRepository.create).toHaveBeenCalledWith({ ...variantData, product: productId });
            expect(ProductRepository.addVariantToProduct).toHaveBeenCalledWith(productId, savedVariant._id);
            expect(result).toEqual(savedVariant);
        });

        it('should throw an error if the parent product is not found', async () => {
            const productId = 'non_existent_id';
            const variantData = { sku: 'KB-RED', price: 99, stock: 50 };

            // Arrange: Mock findById to return null
            ProductRepository.findById.mockResolvedValue(null);

            // Act & Assert: Expect the service to throw an error
            await expect(ProductService.addVariantToProduct(productId, variantData))
                .rejects.toThrow('Parent product not found');
        });
    });

    //================================================================
    // Test Suite for: getAllProducts
    //================================================================
    describe('getAllProducts', () => {
        it('should parse query params and call repository with correct options', async () => {
            const queryParams = {
                category: 'Electronics',
                sortBy: 'price:desc',
                page: '2',
                limit: '5'
            };

            const expectedFilters = { category: 'Electronics' };
            const expectedSorting = { sortBy: 'price', order: 'desc' };
            const expectedPagination = { limit: 5, skip: 5 }; // (page 2 - 1) * 5 = 5

            // Act
            await ProductService.getAllProducts(queryParams);

            // Assert
            expect(ProductRepository.findAll).toHaveBeenCalledTimes(1);
            expect(ProductRepository.findAll).toHaveBeenCalledWith(
                expectedFilters,
                expectedSorting,
                expectedPagination
            );
        });
    });

    //================================================================
    // Test Suite for: deleteProduct
    //================================================================
    describe('deleteProduct', () => {
        it('should delete variants first, then the product', async () => {
            const productId = 'prod_to_delete';

            // Arrange
            VariantRepository.deleteByProductId.mockResolvedValue({ deletedCount: 2 });
            ProductRepository.deleteById.mockResolvedValue({ _id: productId, name: 'Deleted Product' });

            // Act
            await ProductService.deleteProduct(productId);

            // Assert
            // Check the order of operations
            expect(VariantRepository.deleteByProductId).toHaveBeenCalledWith(productId);
            expect(ProductRepository.deleteById).toHaveBeenCalledWith(productId);
        });
    });
});