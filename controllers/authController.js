const userSchema = require('../models/userModel');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing and comparison
const { generateTokenAndSetCookie } = require('../utils/generateTokenAndSetCookie'); // Import the token generation utility

// controllers/authController.js
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await userSchema.find({ email });
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }   

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving


    // Create new user
    const newUser = new userSchema({
      name,
      email,
      password : hashedPassword, // Use the hashed password
      role: role || 'patient', // Default to 'patient' if no role is provided
      phone,
    }); 
    console.log(newUser);
    await newUser.save(); // Save the user to the database
    //generate a jwt token
    generateTokenAndSetCookie(res,newUser._id); // Set token in cookie
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }       
    // Check password (Note: Password should be hashed and compared in production)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {   
        return res.status(401).json({ message: 'Invalid password' });
        }
    
    //generate a jwt token
    generateTokenAndSetCookie(res,user._id); // Set token in cookie
    
    // Respond with user data (excluding password)
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        },
        });
    } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    // Find user by ID
    const user = await userSchema.findById(userId).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


