const mongoose = require('mongoose');
    const variantSchema = new mongoose.Schema({
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        size: { type: String }, // e.g., S, M, L
        color: { type: String }, // e.g., Red, Blue
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },
        sku: { type: String, required: true, unique: true } // Stock Keeping Unit, e.g., TSHIRT-RED-S
    }, { timestamps: true });
    module.exports = mongoose.model('Variant', variantSchema);