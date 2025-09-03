const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
}, { _id: false }); // It's a sub-document, so no separate ID needed

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each user has only one cart
    },
    items: [CartItemSchema],
    // total_price will be calculated dynamically, not stored in the DB.
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);