const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  // Destructure required fields and the optional adminSecretKey from the request body
  const { name, email, password, adminSecretKey } = req.body;

  try {
    // Step 1: Check if a user with the provided email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Step 2: Determine the user's role
    // Default role is 'CUSTOMER'. It can be elevated to 'ADMIN' if a valid secret key is provided.
    let userRole = 'CUSTOMER';
    if (adminSecretKey) { // Check if an admin secret key was provided
      if (adminSecretKey === process.env.ADMIN_SECRET_KEY) {
        // If the key is correct, assign the ADMIN role
        userRole = 'ADMIN';
      } else {
        // If a key is provided but it's incorrect, deny the registration
        return res.status(401).json({ message: 'Invalid Admin Secret Key' });
      }
    }

    // Step 3: Create a new user instance with the determined role
    user = new User({
      name,
      email,
      password,
      role: userRole,
    });

    // Step 4: Hash the password before saving it to the database for security
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Step 5: Save the new user document to the database
    await user.save();

    // Step 6: Create the payload for the JSON Web Token (JWT)
    // The payload includes essential, non-sensitive user info
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Include the role in the token payload
      },
    };

    // Step 7: Sign the JWT, creating the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // The secret key stored in environment variables
      { expiresIn: '5h' },   // Set the token to expire in 5 hours
      (err, token) => {
        if (err) throw err;
        // Step 8: Send the token back to the client upon successful registration
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. User is valid, create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};