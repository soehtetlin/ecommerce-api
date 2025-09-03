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

    // This runs ONCE before all tests in this suite.
    // We increase the timeout for this hook because it involves multiple network requests.
    beforeAll(async () => {
        // Clear all data to ensure a clean slate for each test run
        const collections = [User, Product, Variant, Order, Cart];
        for (const collection of collections) {
            await collection.deleteMany({});
        }
        
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
        expect(adminToken).toBeDefined();

        // Create a Customer User and get their token
        const customerRegisterRes = await request(app).post('/api/auth/register').send({
            name: 'Order Test Customer',
            email: 'order.customer.test@example.com',
            password: 'password123'
        });
        customerToken = customerRegisterRes.body.token;
        expect(customerToken).toBeDefined();

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
    }, 30000); // <-- JEST TIMEOUT INCREASED TO 30 SECONDS FOR THIS HOOK

    // afterAll is handled by the globalTeardown script, but it's safe to keep
    // a cleanup here just in case the test suite is run individually.
    afterAll(async () => {
        // The global teardown will close the main connection.
        // No need to close it here.
    });

    let createdOrderId;
    
    // Test the customer's ability to create an order
    it('should allow a customer to create an order', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                customer_name: "Order Test Customer",
                items: [{ variantId: testVariantId, quantity: 2 }]
            });
        
        // You can remove this console.log now that the test should pass
        // console.log('Response Body:', res.body); 

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.total_price).toBe(100);
        createdOrderId = res.body._id;

        // Verify stock was correctly decremented in the database
        const variantInDb = await Variant.findById(testVariantId);
        expect(variantInDb.stock).toBe(8);
    });

    // Test the admin's ability to update the order status
    it('should allow an admin to update the order status to shipped', async () => {
        const res = await request(app)
            .put(`/api/orders/${createdOrderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: "shipped" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("shipped");
    });
});