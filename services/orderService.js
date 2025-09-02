// services/orderService.js
const mongoose = require('mongoose');
const OrderRepository = require('../repositories/orderRepository');
const VariantRepository = require('../repositories/variantRepository');

class OrderService {
    /**
     * Handles the business logic for placing a new order.
     * This includes stock validation and using a transaction.
     * @param {string} customerName - The name of the customer.
     * @param {Array<object>} items - Array of items with variantId and quantity.
     * @returns {Promise<Document>} The newly created order.
     */
    async placeOrder(customerName, items) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const variantIds = items.map(item => item.variantId);
            const variantsInDB = await VariantRepository.findManyByIdsWithSession(variantIds, session);

            const variantMap = new Map(variantsInDB.map(v => [v._id.toString(), v]));
            let calculatedTotalPrice = 0;
            const orderItemsWithDetails = [];

            for (const item of items) {
                const variant = variantMap.get(item.variantId);
                if (!variant) {
                    throw new Error(`Variant with ID ${item.variantId} not found.`);
                }
                if (variant.stock < item.quantity) {
                    throw new Error(`Insufficient stock for variant SKU ${variant.sku}.`);
                }

                variant.stock -= item.quantity;
                calculatedTotalPrice += variant.price * item.quantity;
                orderItemsWithDetails.push({
                    variantId: variant._id,
                    name: variant.sku,
                    price_at_order: variant.price,
                    quantity: item.quantity,
                });
            }

            await Promise.all(variantsInDB.map(v => v.save({ session })));

            const newOrderData = {
                customer_name: customerName,
                items: orderItemsWithDetails,
                total_price: calculatedTotalPrice,
                status: 'pending'
            };
            const savedOrder = await OrderRepository.create(newOrderData, session);

            await session.commitTransaction();
            return savedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error; // Re-throw the error to be caught by the controller
        } finally {
            session.endSession();
        }
    }

    /**
     * Handles the business logic for updating an order's status.
     * @param {string} orderId - The ID of the order to update.
     * @param {string} status - The new status for the order.
     * @returns {Promise<Document>} The updated order.
     */
    async updateOrderStatus(orderId, status) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await OrderRepository.findByIdWithSession(orderId, session);
            if (!order) {
                throw new Error('Order not found');
            }

            // If cancelling, restore stock
            if (order.status !== 'cancelled' && status === 'cancelled') {
                const stockUpdates = order.items.map(item =>
                    VariantRepository.updateStock(item.variantId, item.quantity, session)
                );
                await Promise.all(stockUpdates);
            }

            order.status = status;
            const updatedOrder = await order.save({ session });

            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // You can add other simple pass-through methods here as well
    async getAllOrders() {
        return OrderRepository.findAll();
    }

    async getOrderById(orderId) {
        return OrderRepository.findById(orderId);
    }
}

module.exports = new OrderService();