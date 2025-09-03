const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');

class AuthService {
    /**
     * Handles the business logic for user registration.
     * @param {object} userData - Contains name, email, password, and optional adminSecretKey.
     * @returns {Promise<string>} The generated JWT token.
     */
    async registerUser(userData) {
        const { name, email, password, adminSecretKey } = userData;

        // 1. Check if user already exists
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            // Throw a custom error that the controller can catch
            const error = new Error('User with this email already exists');
            error.statusCode = 400;
            throw error;
        }

        // 2. Determine user role
        let userRole = 'CUSTOMER';
        if (adminSecretKey) {
            if (adminSecretKey === process.env.ADMIN_SECRET_KEY) {
                userRole = 'ADMIN';
            } else {
                const error = new Error('Invalid Admin Secret Key');
                error.statusCode = 401;
                throw error;
            }
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user via repository
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: userRole,
        };
        const createdUser = await UserRepository.create(newUser);

        // 5. Generate and return JWT token
        return this.generateToken(createdUser._id, createdUser.role);
    }

    /**
     * Handles the business logic for user login.
     * @param {string} email - The user's email.
     * @param {string} password - The user's plain text password.
     * @returns {Promise<string>} The generated JWT token.
     */
    async loginUser(email, password) {
        // 1. Find user by email
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 400;
            throw error;
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 400;
            throw error;
        }

        // 3. Generate and return JWT token
        return this.generateToken(user._id, user.role);
    }

    /**
     * A helper function to generate a JWT token.
     * @param {string} userId - The user's ID.
     * @param {string} userRole - The user's role.
     * @returns {string} The JWT token.
     */
    generateToken(userId, userRole) {
        const payload = {
            user: {
                id: userId,
                role: userRole,
            },
        };

        return jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );
    }
}

module.exports = new AuthService();