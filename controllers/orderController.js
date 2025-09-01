const Order = require('../models/Order');     // Import the Order Model
const Product = require('../models/Product'); // Import the Product Model
const mongoose = require('mongoose');         // Import mongoose for using Transactions

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Authentication should be implemented in a real-world app)
exports.placeOrder = async (req, res) => {
  // Start a new session for the transaction
  const session = await mongoose.startSession();
  // Start the transaction
  session.startTransaction();

  try {
    const { customer_name, items } = req.body;

    // Validate request body
    if (!customer_name || !items || items.length === 0) {
      throw new Error('Please provide customer name and at least one item.');
    }

    const orderItemsWithDetails = [];
    let calculatedTotalPrice = 0;

    // Loop through each item in the order to validate stock and get details
    for (const item of items) {
      // Find the product within the transaction session
      const product = await Product.findById(item.product_id).session(session); 

      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      // Reduce product stock within the transaction
      product.stock -= item.quantity;
      await product.save({ session }); // Save the product changes within the session

      // Prepare item details to be saved in the Order document
      orderItemsWithDetails.push({
        product_id: product._id,
        name: product.name,
        price_at_order: product.price,
        quantity: item.quantity,
      });
      calculatedTotalPrice += product.price * item.quantity;
    }

    // Create the new order document within the transaction
    const newOrder = new Order({
      customer_name,
      items: orderItemsWithDetails,
      total_price: calculatedTotalPrice,
      status: 'pending'
    });

  const savedOrder = await newOrder.save({ session }); // Save the new order within the session

    // If all operations were successful, commit the transaction
    await session.commitTransaction();
    // End the session
    session.endSession();

    res.status(201).json(savedOrder);

  } catch (error) {
    // If any error occurred, abort the entire transaction
    await session.abortTransaction();
    // End the session
    session.endSession();
    // Send back the error message to the client
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getAllOrders = async (req, res) => {
  try {
    // Find all orders and sort them by creation date in descending order (newest first)
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single order by its ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for a specific customer
// @route   GET /api/orders/customer/:customerName
// @access  Private
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const customerName = req.params.customerName;
    // Find all orders that match the customer name
    const orders = await Order.find({ customer_name: customerName }).sort({ createdAt: -1 });

    // Returning an empty array is better than a 404 for a search query
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update the status of an order
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'completed', 'cancelled'];

  // Validate the incoming status
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    // Critical Logic: If an order is being cancelled, restore the stock for each product.
    if (order.status !== 'cancelled' && status === 'cancelled') {
      for (const item of order.items) {
        // Use $inc to atomically increase the product stock
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: item.quantity } }, // Restore the stock
          { session }
        );
      }
    }
    
    // Note: A business logic might prevent changing status from 'cancelled' back to something else.
    // For this assessment, we don't handle that case.

    // Update the order's status
    order.status = status;
    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};