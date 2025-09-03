const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_URI_TEST 
      : process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('Database URI is not defined for the current environment.');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1); // Exit process with failure only if not in test env
    } else {
        throw error; // In test env, just throw the error for Jest to catch
    }
  }
};
module.exports = connectDB;