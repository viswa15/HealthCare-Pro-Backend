const jwt = require('jsonwebtoken');
const userSchema = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to the request object
    req.user = await userSchema.findById(decoded.id).select('-password');
    
    // If user doesn't exist after decoding token
    if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied'});
    }

    next(); // Proceed to the next middleware/controller
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;