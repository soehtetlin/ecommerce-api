// tests/cart.service.test.js
const CartService = require('../services/cartService');
const CartRepository = require('../repositories/cartRepository');

// Mock the entire repository layer
jest.mock('../repositories/cartRepository');

describe('Cart Service', () => {

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    const userId = 'user_123';
    const variantId = 'var_456';

    //================================================================
    // Test Suite for: getCart
    //================================================================
    describe('getCart', () => {
        
        it('should return an existing cart with a calculated total price', async () => {
            // Arrange
            const mockCart = {
                user: userId,
                items: [
                    { variant: { _id: 'var_1', price: 10 }, quantity: 2 }, // Total: 20
                    { variant: { _id: 'var_2', price: 30 }, quantity: 1 }  // Total: 30
                ]
            };
            CartRepository.findByUserId.mockResolvedValue(mockCart);
            
            // Act
            const { cart, totalPrice } = await CartService.getCart(userId);

            // Assert
            expect(CartRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(CartRepository.create).not.toHaveBeenCalled();
            expect(cart).toEqual(mockCart);
            expect(totalPrice).toBe(50); // 20 + 30 = 50
        });

        it('should create and return a new empty cart if one does not exist for the user', async () => {
            // Arrange
            const newEmptyCart = { user: userId, items: [] };
            CartRepository.findByUserId.mockResolvedValue(null); // Simulate cart not found
            CartRepository.create.mockResolvedValue(newEmptyCart);

            // Act
            const { cart, totalPrice } = await CartService.getCart(userId);

            // Assert
            expect(CartRepository.findByUserId).toHaveBeenCalledWith(userId);
            expect(CartRepository.create).toHaveBeenCalledWith(userId);
            expect(cart).toEqual(newEmptyCart);
            expect(totalPrice).toBe(0);
        });
    });

    //================================================================
    // Test Suite for: addItemToCart
    //================================================================
    describe('addItemToCart', () => {

        it('should add a new item to an existing cart', async () => {
            // Arrange
            const initialCart = {
                user: userId,
                items: [],
                save: jest.fn().mockReturnThis() // Mock the save method for the update
            };
            const finalCart = { // Mock the cart state after adding the item for the final getCart call
                user: userId,
                items: [{ variant: { _id: variantId, price: 25 }, quantity: 2 }]
            };
            
            // First findByUserId call returns the initial cart
            CartRepository.findByUserId.mockResolvedValueOnce(initialCart);
            // The second findByUserId call (from within the final getCart) returns the final cart
            CartRepository.findByUserId.mockResolvedValueOnce(finalCart);
            CartRepository.save.mockResolvedValue({});
            
            // Act
            const { cart, totalPrice } = await CartService.addItemToCart(userId, variantId, 2);

            // Assert
            expect(initialCart.items.length).toBe(1);
            expect(initialCart.items[0]).toEqual({ variant: variantId, quantity: 2 });
            expect(CartRepository.save).toHaveBeenCalledWith(initialCart);
            expect(totalPrice).toBe(50); // 25 * 2 = 50
        });

        it('should update the quantity of an existing item in the cart', async () => {
            // Arrange
            const initialCart = {
                user: userId,
                items: [{ variant: { _id: variantId, toString: () => variantId }, quantity: 1 }], // Use toString to mimic Mongoose ObjectId behavior
                save: jest.fn().mockReturnThis()
            };
            const finalCart = {
                user: userId,
                items: [{ variant: { _id: variantId, price: 25 }, quantity: 3 }] // 1 + 2 = 3
            };

            CartRepository.findByUserId.mockResolvedValueOnce(initialCart);
            CartRepository.findByUserId.mockResolvedValueOnce(finalCart);
            CartRepository.save.mockResolvedValue({});

            // Act
            await CartService.addItemToCart(userId, variantId, 2);

            // Assert
            expect(initialCart.items.length).toBe(1);
            expect(initialCart.items[0].quantity).toBe(3); // Quantity should be updated
            expect(CartRepository.save).toHaveBeenCalledWith(initialCart);
        });

        it('should add an item to a new cart if the user does not have one', async () => {
            // Arrange
            const newCart = {
                user: userId,
                items: [],
                save: jest.fn().mockReturnThis()
            };
            const finalCart = {
                user: userId,
                items: [{ variant: { _id: variantId, price: 25 }, quantity: 1 }]
            };

            // First findByUserId returns null
            CartRepository.findByUserId.mockResolvedValueOnce(null);
            // Then create is called
            CartRepository.create.mockResolvedValue(newCart);
            // The final getCart call
            CartRepository.findByUserId.mockResolvedValueOnce(finalCart);
            CartRepository.save.mockResolvedValue({});

            // Act
            await CartService.addItemToCart(userId, variantId, 1);

            // Assert
            expect(CartRepository.create).toHaveBeenCalledWith(userId);
            expect(newCart.items.length).toBe(1);
            expect(CartRepository.save).toHaveBeenCalledWith(newCart);
        });
    });
});