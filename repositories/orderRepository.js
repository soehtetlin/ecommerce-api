const Order = require('../models/Order');

class OrderRepository {
  /**
   * Creates a new order within a transaction session.
   * @param {object} orderData - The data for the new order.
   * @param {object} session - The mongoose transaction session.
   * @returns {Promise<Document>} The saved order document.
   */
  async create(orderData, session) {
    const order = new Order(orderData);
    return order.save({ session });
  }

  /**
   * Finds all orders, sorted by the newest first.
   * @returns {Promise<Array<Document>>} A list of all orders.
   */
  async findAll() {
    return Order.find({}).sort({ createdAt: -1 });
  }

  /**
   * Finds a single order by its ID.
   * @param {string} id - The ID of the order.
   * @returns {Promise<Document|null>} The found order or null.
   */
  async findById(id) {
    return Order.findById(id);
  }

  /**
   * Finds an order by its ID within a transaction session.
   * @param {string} id - The ID of the order.
   * @param {object} session - The mongoose transaction session.
   * @returns {Promise<Document|null>} The found order or null.
   */
  async findByIdWithSession(id, session) {
    return Order.findById(id).session(session);
  }

  /**
   * Finds all orders for a specific customer.
   * @param {string} customerName - The name of the customer.
   * @returns {Promise<Array<Document>>} A list of orders for the customer.
   */
  async findByCustomerName(customerName) {
    return Order.find({ customer_name: customerName }).sort({ createdAt: -1 });
  }
}

module.exports = new OrderRepository();