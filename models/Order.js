const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    variantId: { // Ensure this is variantId
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant', // Ensure this refers to 'Variant'
        required: true
    },
    name: { // Stores a snapshot of the name (e.g., SKU)
        type: String,
        required: true
    },
    price_at_order: { // Stores a snapshot of the price
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { // Add the user who placed the order
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer_name: { // You can keep this for display purposes
        type: String,
        required: true,
        trim: true
    },
    items: [orderItemSchema],
    total_price: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'shipped', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true 
});

// We removed the pre-save hook for total_price because it's calculated in the service layer now.

module.exports = mongoose.model('Order', orderSchema);