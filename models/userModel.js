const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {   
    type: String,
    required: [true, 'Name is required'],   
    trim: true,
  },    
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensure email is unique
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        trim: true,
    },
    password: { 
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'patient'], // Define roles
        default: 'patient', // Default role is patient
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },  
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User; // Export the User model for use in other files