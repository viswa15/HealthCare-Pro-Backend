const jwt = require('jsonwebtoken');

exports.generateTokenAndSetCookie = (res,user) => {
  try {
    // 1. Minimized payload: Only include the user ID.
    const payload = { id: user._id };

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiration time
    });

    // Set cookie with the token
    res.cookie('token', token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000, // 1 hour in milliseconds (matches token expiration)
      sameSite: 'strict', // 2. Added SameSite attribute for CSRF protection
    });

    return token; // Return the generated token if needed
  }catch (error) {
    console.error('Error generating token and setting cookie:', error);
    throw new Error('Token generation failed');
  }
}