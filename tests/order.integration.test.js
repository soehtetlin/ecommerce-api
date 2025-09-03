// tests/order.integration.test.js
const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

process.env.NODE_ENV = 'test';

describe('Order API Endpoints', () => {
    let adminToken, customerToken, testVariantId;

    // This runs before each test, creating fresh data every time.
    beforeEach(async () => {
        // Clear all data to ensure a clean slate
        const collections = [User, Product, Variant, Order, Cart];
        for (const collection of collections) {
            await collection.deleteMany({});
        }

        // Create Admin User and get token
        await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@test.com', password: 'password123', adminSecretKey: process.env.ADMIN_SECRET_KEY });
        const adminLoginRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
        adminToken = adminLoginRes.body.token;

        // Create Customer User and get token
        const customerRegisterRes = await request(app).post('/api/auth/register').send({ name: 'Customer', email: 'customer@test.com', password: 'password123' });
        customerToken = customerRegisterRes.body.token;

        // Create a Product and a Variant
        const productRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: "Test Product", description: "Desc", category: "Test" });
        
        const variantRes = await request(app)
            .post(`/api/products/${productRes.body._id}/variants`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ sku: "TEST-SKU", price: 50, stock: 10 });
        testVariantId = variantRes.body._id;
    }, 30000); // Timeout for the setup hook

    it('should allow a customer to create an order', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                customer_name: "Test Customer",
                items: [{ variantId: testVariantId, quantity: 2 }]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.total_price).toBe(100);

        // Verify stock was correctly decremented in the database
        const variantInDb = await Variant.findById(testVariantId);
        expect(variantInDb.stock).toBe(8);
    });

    it('should allow an admin to update the order status to shipped', async () => {
        // Step 1: Create an order first, so we have something to update.
        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                customer_name: "Test Customer",
                items: [{ variantId: testVariantId, quantity: 1 }]
            });
        
        expect(orderRes.statusCode).toEqual(201);
        const createdOrderId = orderRes.body._id;

        // Step 2: Now, update the status of the order we just created.
        const updateRes = await request(app)
            .put(`/api/orders/${createdOrderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: "shipped" });

        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body.status).toBe("shipped");
    });
});