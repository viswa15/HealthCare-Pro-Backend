// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors for handling Cross-Origin Resource Sharing

// Import database connection function
const connectDB = require('./config/db');

// Import route files
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');

// Create an Express application instance
const app = express();

// Connect to the database
connectDB();

// Middleware
// Enable CORS for all routes. This is important for frontend applications to communicate with this backend.
app.use(cors());
// Parse incoming JSON requests. This makes req.body available for JSON payloads.
app.use(express.json());

// Routes
// Define the base path for doctor-related routes
app.use('/api/doctors', doctorRoutes);
// Define the base path for appointment-related routes
app.use('/api/appointments', appointmentRoutes);
// Define the base path for authentication-related routes
app.use('/api/auth', authRoutes);

// Basic route for the landing page
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to HealthCare Pro Backend API!' });
});

// Global Error Handling Middleware
// This middleware catches any errors thrown by previous middleware or route handlers.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging purposes
  // Set a default status code and message for internal server errors
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong!',
    // In production, you might want to omit the stack trace for security reasons
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Define the port the server will listen on
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});