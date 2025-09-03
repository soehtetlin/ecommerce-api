const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: { type: String, required: true },
  category: { type: String, required: true },
  variants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant'
  }]
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;