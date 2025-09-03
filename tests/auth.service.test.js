const AuthService = require('../services/authService');
const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock the entire repository layer and other dependencies
jest.mock('../repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {

    // Set up environment variables for the test suite
    process.env.JWT_SECRET = 'a_random_secret_for_testing';

    // Clear all mocks before each test to ensure test isolation
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //================================================================
    // Test Suite for: registerUser
    //================================================================
    describe('registerUser', () => {

        it('should create a new CUSTOMER user and return a token successfully', async () => {
            // Arrange
            const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            const hashedPassword = 'hashedPassword123';
            const createdUser = { _id: 'user_123', role: 'CUSTOMER', ...userData };
            const expectedToken = 'jwt_token_string';

            // Mock repository and library functions
            UserRepository.findByEmail.mockResolvedValue(null); // Simulate user does not exist
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue(hashedPassword);
            UserRepository.create.mockResolvedValue(createdUser);
            jwt.sign.mockReturnValue(expectedToken);

            // Act
            const token = await AuthService.registerUser(userData);

            // Assert
            expect(UserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(UserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                email: userData.email,
                password: hashedPassword,
                role: 'CUSTOMER'
            }));
            expect(jwt.sign).toHaveBeenCalledWith({ user: { id: createdUser._id, role: 'CUSTOMER' } }, expect.any(String), { expiresIn: '5h' });
            expect(token).toBe(expectedToken);
        });

        it('should create a new ADMIN user if the correct secret key is provided', async () => {
            // Arrange
            const userData = { name: 'Admin', email: 'admin@example.com', password: 'password123', adminSecretKey: 'MySuperSecretAdminKey123' };
            process.env.ADMIN_SECRET_KEY = 'MySuperSecretAdminKey123'; // Set up the env variable for the test
            const hashedPassword = 'hashedPassword123';
            const createdUser = { _id: 'admin_123', role: 'ADMIN', ...userData };

            UserRepository.findByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue(hashedPassword);
            UserRepository.create.mockResolvedValue(createdUser);

            // Act
            await AuthService.registerUser(userData);

            // Assert
            expect(UserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                role: 'ADMIN' // Crucial check: role must be ADMIN
            }));
        });

        it('should throw a 400 error if user with the same email already exists', async () => {
            // Arrange
            const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            const existingUser = { _id: 'user_123', email: 'test@example.com' };

            UserRepository.findByEmail.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(AuthService.registerUser(userData))
                .rejects.toThrow('User with this email already exists');
            await expect(AuthService.registerUser(userData))
                .rejects.toHaveProperty('statusCode', 400);
        });

        it('should throw a 401 error if an incorrect admin secret key is provided', async () => {
            // Arrange
            const userData = { name: 'Admin', email: 'admin@example.com', password: 'password123', adminSecretKey: 'WRONG_KEY' };
            process.env.ADMIN_SECRET_KEY = 'CORRECT_KEY';

            UserRepository.findByEmail.mockResolvedValue(null);

            // Act & Assert
            await expect(AuthService.registerUser(userData))
                .rejects.toThrow('Invalid Admin Secret Key');
            await expect(AuthService.registerUser(userData))
                .rejects.toHaveProperty('statusCode', 401);
        });
    });

    //================================================================
    // Test Suite for: loginUser
    //================================================================
    describe('loginUser', () => {
        const email = 'test@example.com';
        const password = 'password123';
        const hashedPassword = 'hashedPassword123';
        const userInDb = { _id: 'user_123', email, password: hashedPassword, role: 'CUSTOMER' };

        it('should log in a user and return a token successfully', async () => {
            // Arrange
            const expectedToken = 'jwt_token_string';
            UserRepository.findByEmail.mockResolvedValue(userInDb);
            bcrypt.compare.mockResolvedValue(true); // Simulate password is correct
            jwt.sign.mockReturnValue(expectedToken);

            // Act
            const token = await AuthService.loginUser(email, password);

            // Assert
            expect(UserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(jwt.sign).toHaveBeenCalledWith({ user: { id: userInDb._id, role: userInDb.role } }, expect.any(String), { expiresIn: '5h' });
            expect(token).toBe(expectedToken);
        });

        it('should throw a 400 error if the user email does not exist', async () => {
            // Arrange
            UserRepository.findByEmail.mockResolvedValue(null); // Simulate user not found

            // Act & Assert
            await expect(AuthService.loginUser(email, password))
                .rejects.toThrow('Invalid credentials');
            await expect(AuthService.loginUser(email, password))
                .rejects.toHaveProperty('statusCode', 400);
        });

        it('should throw a 400 error if the password is incorrect', async () => {
            // Arrange
            UserRepository.findByEmail.mockResolvedValue(userInDb);
            bcrypt.compare.mockResolvedValue(false); // Simulate password is NOT correct

            // Act & Assert
            await expect(AuthService.loginUser(email, password))
                .rejects.toThrow('Invalid credentials');
            await expect(AuthService.loginUser(email, password))
                .rejects.toHaveProperty('statusCode', 400);
        });
    });
});