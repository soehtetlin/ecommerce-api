const CartRepository = require('../repositories/cartRepository');

class CartService {
    async getCart(userId) {
        let cart = await CartRepository.findByUserId(userId);
        if (!cart) {
            // If a user has no cart, create an empty one for them
            cart = await CartRepository.create(userId);
        }

        // Calculate total price dynamically
        let totalPrice = 0;
        if (cart.items && cart.items.length > 0) {
            totalPrice = cart.items.reduce((acc, item) => {
                // item.variant is populated, so we can access its price
                return acc + (item.quantity * item.variant.price);
            }, 0);
        }
        
        // Return cart data along with the calculated total price
        return { cart, totalPrice };
    }

    async addItemToCart(userId, variantId, quantity) {
        let cart = await CartRepository.findByUserId(userId);
        if (!cart) {
            cart = await CartRepository.create(userId);
        }

        // Check if the item already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.variant._id.toString() === variantId);

        if (itemIndex > -1) {
            // If item exists, update the quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // If item does not exist, add it as a new item
            cart.items.push({ variant: variantId, quantity });
        }

        const updatedCart = await CartRepository.update(cart);
        return this.getCart(userId); // Return the full cart with total price
    }
}

module.exports = new CartService();