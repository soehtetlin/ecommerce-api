const request = require('supertest');
const app = require('../../index');
const Product = require('../../models/Product');
const Variant = require('../../models/Variant');
const User = require('../../models/User');

process.env.NODE_ENV = 'test';

describe('Product & Variant API Endpoints', () => {
    let adminToken;

    beforeEach(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Variant.deleteMany({});

        // Create and login an admin user for each test
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

    it('should create a new product and then add a variant to it', async () => {
        // Step 1: Create Product
        const productRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: "Test Keyboard", description: "A cool keyboard", category: "Electronics" });

        expect(productRes.statusCode).toEqual(201);
        const productId = productRes.body._id;

        // Step 2: Add Variant to that Product
        const variantRes = await request(app)
            .post(`/api/products/${productId}/variants`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ sku: "IT-KB-01", price: 120, stock: 50 });

        expect(variantRes.statusCode).toEqual(201);
        expect(variantRes.body).toHaveProperty('sku', 'IT-KB-01');

        // Step 3: Verify the result by fetching all products
        const getRes = await request(app).get('/api/products');
        expect(getRes.statusCode).toEqual(200);
        expect(getRes.body).toHaveLength(1);
        expect(getRes.body[0].variants).toHaveLength(1);
        expect(getRes.body[0].variants[0]).toHaveProperty('sku', 'IT-KB-01');
    });

    it('should fail to create a product if not authenticated as admin', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ name: "Failed Product", description: "Desc", category: "Test" });

        expect(res.statusCode).toEqual(401);
    });
});