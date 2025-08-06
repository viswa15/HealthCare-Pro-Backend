// routes/appointmentRoutes.js
const express = require('express');
const {
  bookAppointment,
  getMyHistory,
  getAllAppointments, // Included for completeness, typically for admin/doctor
  getAppointmentById, // Included for completeness, typically for admin/doctor
  updateAppointmentStatus, // Included for completeness, typically for admin/doctor
  deleteAppointment // Included for completeness, typically for admin/doctor
} = require('../controllers/appointmentController'); // Import controller functions
const authMiddleware = require('../middleware/authMiddleware'); // Import authentication middleware

const router = express.Router(); // Create an Express router

// Define routes and link them to controller functions

// POST to book a new appointment
// Example: POST /api/appointments
router.route('/').post(authMiddleware,bookAppointment);

router.route('/my-history').get(authMiddleware, getMyHistory); // Get appointments for the logged-in user

// Admin/Doctor routes (uncomment and add authentication middleware if needed for production)
// router.route('/').get(authMiddleware,getAllAppointments);
// router.route('/:id').get(authMiddleware,getAppointmentById);
// router.route('/:id').put(updateAppointmentStatus);
// router.route('/:id').delete(deleteAppointment);

module.exports = router; // Export the router
