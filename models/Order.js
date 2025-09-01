const mongoose = require('mongoose');

// This defines the schema for the items within an order.
// It is a sub-schema that will be embedded in the main Order schema.
const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // References the 'Product' model
    required: true
  },
  name: { // Stores the product name at the time of the order
    type: String,
    required: true
  },
  price_at_order: { // Stores the product price at the time of the order
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1 // Quantity must be at least 1
  }
}, { _id: false }); // We set _id to false because this is a sub-document

// This is the main schema for the Order document.
const orderSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: true,
    trim: true // Removes whitespace from both ends of the string
  },
  items: [orderItemSchema], // An array of order items, using the sub-schema defined above
  total_price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'], // The status must be one of these values
    default: 'pending' // The default status when an order is created
  }
}, {
  // Automatically adds createdAt and updatedAt fields to the document
  timestamps: true 
});

// A pre-save middleware (hook) to automatically calculate the total_price
// before the order document is saved to the database.
orderSchema.pre('save', function(next) {
  // 'this' refers to the document being saved
  this.total_price = this.items.reduce((accumulator, currentItem) => {
    return accumulator + (currentItem.price_at_order * currentItem.quantity);
  }, 0);
  next(); // Move on to the next middleware or save operation
});

// Create the Order model from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the model to be used in other parts of the application
module.exports = Order;