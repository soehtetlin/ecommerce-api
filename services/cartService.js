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
    // MODIFIED LOGIC: Handles both populated documents and ObjectIDs
    const itemIndex = cart.items.findIndex(item => {
        // item.variant could be a fully populated object (from findByUserId)
        // or just an ObjectId if it was just pushed.
        const existingVariantId = item.variant._id ? item.variant._id.toString() : item.variant.toString();
        return existingVariantId === variantId;
    });

    if (itemIndex > -1) {
        // If item exists, update the quantity
        cart.items[itemIndex].quantity += quantity;
    } else {
        // If item does not exist, add it as a new item
        cart.items.push({ variant: variantId, quantity });
    }

    await CartRepository.save(cart); 
    
    // We already have the updated cart in memory, but getCart recalculates total price.
    // It's better to return the result from getCart to ensure consistency.
    return this.getCart(userId);
}
}

module.exports = new CartService();