const {registerUser,loginUser,getUserProfile} = require('../controllers/authController'); // Import the auth controller functions
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import the authentication middleware

// Define routes for user registration and login
router.post('/register', registerUser); // Route for user registration  

router.post('/login', loginUser); // Route for user login

router.get('/user-profile', authMiddleware, getUserProfile); // Route to get user profile

// @desc    Get appointments for the logged-in user
// @route   GET /api/appointments/myappointments
router.get('/myappointments', authMiddleware, async (req, res) => {
    const appointments = await Appointment.find({ patientId: req.user.id })
        .populate('doctorId', 'name specialization');
    res.status(200).json({ success: true, data: appointments });
});

// Export the router to be used in app.js
module.exports = router;