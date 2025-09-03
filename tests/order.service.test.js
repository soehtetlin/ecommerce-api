const mongoose = require('mongoose');
const OrderService = require('../services/orderService');
const OrderRepository = require('../repositories/orderRepository');
const VariantRepository = require('../repositories/variantRepository');

// Mock the entire repository layer and mongoose
jest.mock('../repositories/orderRepository');
jest.mock('../repositories/variantRepository');
jest.mock('mongoose');

describe('Order Service', () => {
    let mockSession;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create a reusable mock session object for transaction tests
        mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        };
        // Mock the mongoose.startSession to return our mock session
        mongoose.startSession.mockResolvedValue(mockSession);
    });

    //================================================================
    // Test Suite for: placeOrder
    //================================================================
    describe('placeOrder', () => {
        // Define all necessary test data
        const userId = 'user_123';
        const customerName = 'John Doe';
        const items = [{ variantId: 'var_123', quantity: 2 }];

        it('should place an order successfully if stock is sufficient', async () => {
            // Arrange
            const mockVariant = {
                _id: 'var_123',
                sku: 'TSHIRT-RED-M',
                price: 20,
                stock: 5,
                save: jest.fn()
            };
            VariantRepository.findManyByIdsWithSession.mockResolvedValue([mockVariant]);
            OrderRepository.create.mockResolvedValue({ _id: 'order_123' });

            // Act: Call the service with the correct THREE arguments
            const result = await OrderService.placeOrder(userId, customerName, items);

            // Assert
            expect(VariantRepository.findManyByIdsWithSession).toHaveBeenCalledWith(['var_123'], mockSession);
            expect(mockVariant.stock).toBe(3);
            expect(mockVariant.save).toHaveBeenCalledWith({ session: mockSession });
            expect(OrderRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: userId, // Check that the userId is passed correctly
                    customer_name: customerName,
                    total_price: 40
                }),
                mockSession
            );
            expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });

        it('should throw an error and abort transaction if a variant is not found', async () => {
            // Arrange
            VariantRepository.findManyByIdsWithSession.mockResolvedValue([]);

            // Act & Assert: Call with the correct THREE arguments
            await expect(OrderService.placeOrder(userId, customerName, items))
                .rejects.toThrow('Variant with ID var_123 not found.');

            expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
        });

        it('should throw an error and abort transaction if stock is insufficient', async () => {
            // Arrange
            const mockVariant = {
                _id: 'var_123',
                sku: 'TSHIRT-RED-M',
                price: 20,
                stock: 1, // Stock is only 1
                save: jest.fn()
            };
            VariantRepository.findManyByIdsWithSession.mockResolvedValue([mockVariant]);

            // Act & Assert: Call with the correct THREE arguments
            await expect(OrderService.placeOrder(userId, customerName, items)) // Requesting 2
                .rejects.toThrow('Insufficient stock for variant SKU TSHIRT-RED-M.');

            expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
        });
    });

    //================================================================
    // Test Suite for: updateOrderStatus
    //================================================================
    describe('updateOrderStatus', () => {
        const orderId = 'order_123';

        it('should update status to "completed" successfully', async () => {
            // Arrange
            const mockOrder = {
                _id: orderId,
                status: 'pending',
                save: jest.fn().mockResolvedValue({ _id: orderId, status: 'completed' })
            };
            OrderRepository.findByIdWithSession.mockResolvedValue(mockOrder);

            // Act
            const updatedOrder = await OrderService.updateOrderStatus(orderId, 'completed');

            // Assert
            expect(OrderRepository.findByIdWithSession).toHaveBeenCalledWith(orderId, mockSession);
            expect(mockOrder.status).toBe('completed');
            expect(mockOrder.save).toHaveBeenCalledTimes(1);
            expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
            expect(updatedOrder.status).toBe('completed');
        });

        it('should update status to "cancelled" and restore stock', async () => {
            // Arrange
            const mockOrder = {
                _id: orderId,
                status: 'pending',
                items: [
                    { variantId: 'var_123', quantity: 2 },
                    { variantId: 'var_456', quantity: 1 }
                ],
                save: jest.fn().mockResolvedValue(this)
            };
            OrderRepository.findByIdWithSession.mockResolvedValue(mockOrder);
            VariantRepository.updateStock.mockResolvedValue({}); // Mock the stock update

            // Act
            await OrderService.updateOrderStatus(orderId, 'cancelled');

            // Assert
            expect(mockOrder.status).toBe('cancelled');

            // Check that stock was restored for BOTH items
            expect(VariantRepository.updateStock).toHaveBeenCalledTimes(2);
            expect(VariantRepository.updateStock).toHaveBeenCalledWith('var_123', 2, mockSession);
            expect(VariantRepository.updateStock).toHaveBeenCalledWith('var_456', 1, mockSession);

            expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if order is not found', async () => {
            // Arrange
            OrderRepository.findByIdWithSession.mockResolvedValue(null);

            // Act & Assert
            await expect(OrderService.updateOrderStatus(orderId, 'completed'))
                .rejects.toThrow('Order not found');

            expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
        });
    });
});