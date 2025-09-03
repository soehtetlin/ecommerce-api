// tests/order.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import your Express app
const User = require('../models/User');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Set the environment to 'test'
process.env.NODE_ENV = 'test';

describe('Order API Endpoints', () => {
    let adminToken, customerToken, testVariantId;

    // This runs once before all tests in this suite.
    beforeAll(async () => {
        // Clear all data to ensure a clean slate
        await User.deleteMany({});
        await Product.deleteMany({});
        await Variant.deleteMany({});
        await Order.deleteMany({});
        await Cart.deleteMany({});
        
        // Create an Admin User and get their token
        await request(app).post('/api/auth/register').send({
            name: 'Order Test Admin',
            email: 'order.admin.test@example.com',
            password: 'password123',
            adminSecretKey: process.env.ADMIN_SECRET_KEY || 'your_admin_secret_for_assessment'
        });
        const adminLoginRes = await request(app).post('/api/auth/login').send({
            email: 'order.admin.test@example.com',
            password: 'password123'
        });
        adminToken = adminLoginRes.body.token;
        expect(adminToken).toBeDefined(); // Ensure we got a token

        // Create a Customer User and get their token
        const customerRegisterRes = await request(app).post('/api/auth/register').send({
            name: 'Order Test Customer',
            email: 'order.customer.test@example.com',
            password: 'password123'
        });
        customerToken = customerRegisterRes.body.token;
        expect(customerToken).toBeDefined(); // Ensure we got a token

        // Create a Product and a Variant for testing using the admin token
        const productRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: "Product for Order Test", description: "Desc", category: "Test" });
        
        const variantRes = await request(app)
            .post(`/api/products/${productRes.body._id}/variants`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ sku: "ORDER-TEST-SKU", price: 50, stock: 10 });
        testVariantId = variantRes.body._id;
    });

    // afterAll is not strictly necessary with global teardown, but good practice
    afterAll(async () => {
        await mongoose.connection.close();
    });

    let createdOrderId;
    
    // Test the customer's ability to create an order
    it('should allow a customer to create an order', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`) // Use the customer token
            .send({
                customer_name: "Order Test Customer",
                items: [{ variantId: testVariantId, quantity: 2 }]
            });
        
        // The console.log that helped us debug. You can remove it now.
        console.log('Error Response Body:', res.body); 

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.total_price).toBe(100);
        createdOrderId = res.body._id; // Save the ID for the next test

        // Verify stock was decremented
        const variantInDb = await Variant.findById(testVariantId);
        expect(variantInDb.stock).toBe(8);
    });

    // Test the admin's ability to update the order status
    it('should allow an admin to update the order status to shipped', async () => {
        const res = await request(app)
            .put(`/api/orders/${createdOrderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`) // Use the admin token
            .send({ status: "shipped" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("shipped");
    });
});