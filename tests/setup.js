const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

module.exports = async () => {
    process.env.NODE_ENV = 'test';
    const uri = process.env.MONGO_URI_TEST;

    if (!uri) {
        throw new Error('MONGO_URI_TEST is not defined in your .env file');
    }

    await mongoose.connect(uri);
};