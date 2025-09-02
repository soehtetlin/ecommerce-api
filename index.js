require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const connectDB = require('./config/db'); // Import DB connection function
const productRoutes = require('./routes/productRoutes'); // Import product routes
const orderRoutes = require('./routes/orderRoutes');   // Import order routes
const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const variantRoutes = require('./routes/variantRoutes'); // Import variant routes
const cartRoutes = require('./routes/cartRoutes'); // Import cart routes

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// Basic Route
app.get('/', (req, res) => {
  res.send('Inventory & Order Management API is running!');
});

// Use API Routes
app.use('/api/products', productRoutes); // All /api/products requests go to productRoutes
app.use('/api/orders', orderRoutes); // All /api/orders requests go to orderRoutes
app.use('/api/auth', authRoutes); // All /api/auth requests go to authRoutes
app.use('/api', variantRoutes); // All /api requests go to variantRoutes
app.use('/api/cart', cartRoutes); // All /api/cart requests go to cartRoutes

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access API at http://localhost:${PORT}`);
});