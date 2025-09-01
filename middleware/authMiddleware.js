const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes by verifying the JWT.
 * It checks for a valid token in the Authorization header, decodes it,
 * and attaches the user payload (containing id and role) to the request object.
 */
const protect = (req, res, next) => {
  // Get the token from the Authorization header, which is expected to be in the format 'Bearer <token>'
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // Extract the token from the header (e.g., "Bearer eyJhbGci..." -> "eyJhbGci...")
      const token = authHeader.split(' ')[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user payload from the token to the request object
      // This makes user information (like id and role) available to subsequent route handlers
      req.user = decoded.user; // req.user will now be { id: '...', role: '...' }

      // Proceed to the next middleware or the route's controller
      next();
    } catch (error) {
      // If the token is invalid or expired, send an unauthorized error
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If no token is provided in the header, send an unauthorized error
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware for authorization, restricting access to ADMIN users only.
 * This should be used AFTER the `protect` middleware, as it relies on `req.user` being set.
 */
const adminOnly = (req, res, next) => {
  // Check if the user object exists on the request and if the user's role is 'ADMIN'
  if (req.user && req.user.role === 'ADMIN') {
    // If the user is an admin, allow them to proceed to the route's controller
    next();
  } else {
    // If the user is not an admin, send a forbidden error
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

module.exports = { protect, adminOnly };