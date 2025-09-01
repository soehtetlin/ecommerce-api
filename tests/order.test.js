// tests/order.test.js
const mongoose = require('mongoose');
const { placeOrder, getAllOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const Order = require('../models/Order');
const Product = require('../models/Product');

// We are NOT mocking the entire mongoose library anymore.
// Instead, we will mock specific functions inside our tests.
jest.mock('../models/Order');
jest.mock('../models/Product');

describe('Order Controller', () => {

  let req, res;
  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('placeOrder', () => {

    it('should successfully place an order and decrease product stock', async () => {
      // Arrange
      req.body = { customer_name: 'Jane Doe', items: [{ product_id: 'prod_123', quantity: 2 }] };
      const mockProduct = { _id: 'prod_123', name: 'Test Product', price: 100, stock: 10, save: jest.fn().mockResolvedValue(this) };
      const mockOrder = { ...req.body, _id: 'order_123', total_price: 200, status: 'pending' };
      
      Product.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockProduct) });
      Order.prototype.save = jest.fn().mockResolvedValue(mockOrder);

      // --- START: CORRECT WAY TO MOCK SESSION ---
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      // Manually mock the startSession function to return a promise that resolves with our mock session
      mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
      // --- END: CORRECT WAY TO MOCK SESSION ---

      // Act
      await placeOrder(req, res);

      // Assert
      expect(mongoose.startSession).toHaveBeenCalledTimes(1);
      expect(mockProduct.stock).toBe(8);
      expect(mockProduct.save).toHaveBeenCalledTimes(1);
      expect(Order.prototype.save).toHaveBeenCalledTimes(1);
      expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 400 if stock is insufficient', async () => {
      // Arrange
      req.body = { customer_name: 'Jane Doe', items: [{ product_id: 'prod_123', quantity: 15 }] };
      const mockProduct = { stock: 10, name: 'Test Product' };
      Product.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockProduct) });
      
      // --- START: CORRECT WAY TO MOCK SESSION ---
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
      // --- END: CORRECT WAY TO MOCK SESSION ---

      // Act
      await placeOrder(req, res);

      // Assert
      expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Insufficient stock') });
    });
  });

  // ... (getAllOrders and getOrderById tests remain the same)
  describe('getAllOrders', () => { /* ... no changes needed here ... */ });
  describe('getOrderById', () => { /* ... no changes needed here ... */ });

  describe('updateOrderStatus', () => {
    
    it('should update the status and return the updated order', async () => {
      // Arrange
      req.params.id = 'order_123';
      req.body.status = 'completed';
      const mockOrder = { _id: 'order_123', status: 'pending', save: jest.fn().mockResolvedValue({ _id: 'order_123', status: 'completed' }) };
      Order.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });

      // --- START: CORRECT WAY TO MOCK SESSION ---
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
      // --- END: CORRECT WAY TO MOCK SESSION ---

      // Act
      await updateOrderStatus(req, res);

      // Assert
      expect(mockOrder.status).toBe('completed');
      expect(mockOrder.save).toHaveBeenCalledTimes(1);
      expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    });

    it('should restore product stock when an order is cancelled', async () => {
      // Arrange
      req.params.id = 'order_123';
      req.body.status = 'cancelled';
      const mockOrder = { _id: 'order_123', status: 'pending', items: [{ product_id: 'prod_123', quantity: 2 }], save: jest.fn().mockResolvedValue(this) };
      Order.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(mockOrder) });
      Product.findByIdAndUpdate.mockResolvedValue({});

      // --- START: CORRECT WAY TO MOCK SESSION ---
      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mongoose.startSession = jest.fn().mockResolvedValue(mockSession);
      // --- END: CORRECT WAY TO MOCK SESSION ---
      
      // Act
      await updateOrderStatus(req, res);

      // Assert
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('prod_123', { $inc: { stock: 2 } }, { session: mockSession });
      expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    });
  });
});