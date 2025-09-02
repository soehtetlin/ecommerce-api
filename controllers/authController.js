const AuthService = require('../services/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        // Pass the entire request body to the service layer
        const token = await AuthService.registerUser(req.body);
        // The service returns a token on success
        res.status(201).json({ token });
    } catch (error) {
        // Catch errors thrown from the service and send the appropriate response
        console.error(error.message);
        // Use the status code from the custom error, or default to 500
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Call the service with email and password
        const token = await AuthService.loginUser(email, password);
        // The service returns a token on success
        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};