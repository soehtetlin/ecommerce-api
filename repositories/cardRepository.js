const Cart = require('../models/Cart');

class CartRepository {
    async findByUserId(userId) {
        // Find a cart and populate the variant details for each item
        return Cart.findOne({ user: userId }).populate('items.variant');
    }

    async create(userId) {
        const cart = new Cart({ user: userId, items: [] });
        return cart.save();
    }

    async update(cart) {
        return cart.save();
    }
}

module.exports = new CartRepository();