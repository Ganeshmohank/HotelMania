// Fix for auth.js middleware - Remove circular dependency
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists (optional)
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User does not exist' });
    }
    
    // Add user data to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};

module.exports = auth;