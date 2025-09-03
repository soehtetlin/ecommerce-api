const CartService = require('../services/cartService');

exports.getCart = async (req, res) => {
    try {
        // Get the user ID from the token that the `protect` middleware provides
        const userId = req.user.id;
        const { cart, totalPrice } = await CartService.getCart(userId);
        res.status(200).json({ cart, totalPrice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { variantId, quantity } = req.body;

        if (!variantId || !quantity) {
            return res.status(400).json({ message: 'Variant ID and quantity are required.' });
        }

        const { cart, totalPrice } = await CartService.addItemToCart(userId, variantId, quantity);
        res.status(200).json({ cart, totalPrice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};