// Import all functions to be tested from the controller
const { 
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const Product = require('../models/Product');

// Mock the Mongoose Model to prevent actual database calls
jest.mock('../models/Product');

describe('Product Controller', () => {

  // A reusable mock response object and clear mocks before each test
  let req, res;
  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  //================================================================
  // Test Suite for: createProduct
  //================================================================
  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      req.body = { name: 'Test Product', price: 100, stock: 10 };
      const savedProduct = { _id: 'some_id', ...req.body };
      // Mock the save method on a new Product instance
      Product.prototype.save = jest.fn().mockResolvedValue(savedProduct);

      // Act
      await createProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedProduct);
    });

    it('should return a 400 error if required fields are missing', async () => {
      // Arrange
      req.body = { name: 'Incomplete Product' };

      // Act
      await createProduct(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please enter all fields: name, price, and stock' });
    });
  });

  //================================================================
  // Test Suite for: getAllProducts
  //================================================================
  describe('getAllProducts', () => {
    it('should return all products with a 200 status', async () => {
      // Arrange
      const mockProducts = [
        { name: 'Product A', price: 10, stock: 5 },
        { name: 'Product B', price: 20, stock: 15 },
      ];
      Product.find.mockResolvedValue(mockProducts);

      // Act
      await getAllProducts(req, res);
      
      // Assert
      expect(Product.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  });

  //================================================================
  // Test Suite for: getProductById
  //================================================================
  describe('getProductById', () => {
    it('should return a single product if found', async () => {
      // Arrange
      req.params.id = 'prod_123';
      const mockProduct = { _id: 'prod_123', name: 'Found Product' };
      Product.findById.mockResolvedValue(mockProduct);

      // Act
      await getProductById(req, res);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('prod_123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return a 404 error if product is not found', async () => {
      // Arrange
      req.params.id = 'non_existent_id';
      Product.findById.mockResolvedValue(null); // Simulate not finding the product

      // Act
      await getProductById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });
  
  //================================================================
  // Test Suite for: updateProduct
  //================================================================
  describe('updateProduct', () => {
    it('should update a product and return the updated document', async () => {
      // Arrange
      req.params.id = 'prod_123';
      req.body = { price: 150 };
      const updatedProduct = { _id: 'prod_123', name: 'Original Name', price: 150 };
      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      // Act
      await updateProduct(req, res);
      
      // Assert
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        'prod_123',
        { price: 150 },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedProduct);
    });

    it('should return a 404 error if product to update is not found', async () => {
        // Arrange
        req.params.id = 'non_existent_id';
        req.body = { price: 150 };
        Product.findByIdAndUpdate.mockResolvedValue(null);

        // Act
        await updateProduct(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });

  //================================================================
  // Test Suite for: deleteProduct
  //================================================================
  describe('deleteProduct', () => {
    it('should delete a product and return a success message', async () => {
      // Arrange
      req.params.id = 'prod_123';
      const deletedProduct = { _id: 'prod_123', name: 'Deleted Product' };
      Product.findByIdAndDelete.mockResolvedValue(deletedProduct);

      // Act
      await deleteProduct(req, res);

      // Assert
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('prod_123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product deleted successfully',
        deletedProduct: deletedProduct
      });
    });

    it('should return a 404 error if product to delete is not found', async () => {
        // Arrange
        req.params.id = 'non_existent_id';
        Product.findByIdAndDelete.mockResolvedValue(null);

        // Act
        await deleteProduct(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });
  });
});