const OrderService = require('../services/orderService');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Authenticated users)
exports.placeOrder = async (req, res) => {
    try {
        const { customer_name, items } = req.body;
        if (!customer_name || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Customer name and items are required.' });
        }
        const savedOrder = await OrderService.placeOrder(customer_name, items);
        res.status(201).json(savedOrder);
    } catch (error) {
        // Errors from the service layer will be caught here
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single order by its ID
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
exports.getOrderById = async (req, res) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
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
// @access  Private (Admin)
exports.getOrdersByCustomer = async (req, res) => {
    try {
        // Get the customer name from the URL parameters
        const customerName = req.params.customerName;
        
        // Call the service to fetch the orders
        const orders = await OrderService.getOrdersByCustomerName(customerName);
        
        // Return the orders (will be an empty array if none are found)
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update the status of an order
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'completed', 'shipped', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status.` });
        }

        const updatedOrder = await OrderService.updateOrderStatus(req.params.id, status);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};