const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const User = require('../models/User');

// Set the environment to 'test'
process.env.NODE_ENV = 'test';

describe('Product & Variant API Endpoints', () => {
    let adminToken;

    // Before all tests, connect to the test DB and get an admin token
    beforeAll(async () => {
        // Register and login an admin user to get a token for protected routes
        await request(app).post('/api/auth/register').send({
            name: 'Test Admin',
            email: 'admin.test@example.com',
            password: 'password123',
            adminSecretKey: process.env.ADMIN_SECRET_KEY
        });
        const res = await request(app).post('/api/auth/login').send({
            email: 'admin.test@example.com',
            password: 'password123'
        });
        adminToken = res.body.token;
    });

    // After all tests, clear all collections and close the connection
    afterAll(async () => {
        await Product.deleteMany({});
        await Variant.deleteMany({});
        await User.deleteMany({});
    });

    // Test the entire CRUD flow for a product and its variant
    let createdProductId;

    it('should create a new product when authenticated as an admin', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`) // Use the admin token
            .send({
                name: "Integration Test Keyboard",
                description: "A cool keyboard",
                category: "Electronics"
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe("Integration Test Keyboard");
        createdProductId = res.body._id; // Save the ID for the next test
    });

    it('should add a variant to the created product', async () => {
        const res = await request(app)
            .post(`/api/products/${createdProductId}/variants`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                sku: "IT-KB-01",
                price: 120,
                stock: 50,
                color: "Black"
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('sku', 'IT-KB-01');

        // Verify in the database that the product's variants array was updated
        const productInDb = await Product.findById(createdProductId);
        expect(productInDb.variants).toHaveLength(1);
        expect(productInDb.variants[0].toString()).toBe(res.body._id);
    });

    it('should get a list of all products (publicly accessible)', async () => {
        const res = await request(app).get('/api/products');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        // Check if variants are populated
        expect(res.body[0]).toHaveProperty('variants');
        expect(res.body[0].variants[0]).toHaveProperty('sku', 'IT-KB-01');
    });

    it('should fail to create a product if not authenticated as admin', async () => {
        const res = await request(app)
            .post('/api/products')
            // No token is sent
            .send({
                name: "Failed Product",
                description: "This should not be created",
                category: "Test"
            });

        expect(res.statusCode).toEqual(401);
    });
});