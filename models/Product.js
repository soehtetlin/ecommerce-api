const mongoose = require('mongoose');

// This defines the schema for the Product document.
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // This field is mandatory
    unique: true,   // Each product must have a unique name
    trim: true      // Removes whitespace from both ends of the string
  },
  price: {
    type: Number,
    required: true,
    min: 0          // The price cannot be a negative number
  },
  stock: {
    type: Number,
    required: true,
    min: 0,         // The stock count cannot be a negative number
    default: 0      // Sets a default value of 0 if stock is not provided
  }
}, {
  // Automatically adds createdAt and updatedAt fields to the document,
  // which helps in tracking when the document was created and last modified.
  timestamps: true 
});

// Create the Product model from the schema defined above.
// Mongoose will create a collection named 'products' (plural, lowercase) in MongoDB.
const Product = mongoose.model('Product', productSchema);

// Export the model so it can be used in other parts of the application (e.g., controllers).
module.exports = Product;