// routes/doctorRoutes.js
const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
  createDoctor, // Included for completeness, typically for admin
  updateDoctor, // Included for completeness, typically for admin
  deleteDoctor  // Included for completeness, typically for admin
} = require('../controllers/doctorController'); // Import controller functions

const router = express.Router(); // Create an Express router

// Define routes and link them to controller functions

// GET all doctors or search doctors by name/specialization
// Example: GET /api/doctors?search=Maria or GET /api/doctors?search=Gastroenterologist
router.route('/').get(getAllDoctors);

// GET a single doctor by ID
// Example: GET /api/doctors/60d5ec49f8c7e40015f8c7e4 (replace with actual doctor ID)
router.route('/:id').get(getDoctorById);

// GET available time slots for a specific doctor
// Example: GET /api/doctors/60d5ec49f8c7e40015f8c7e4/availability
router.route('/:id/availability').get(getDoctorAvailability);

// Admin routes (uncomment and add authentication middleware if needed for production)
router.route('/').post(createDoctor);
// router.route('/:id').put(updateDoctor);
// router.route('/:id').delete(deleteDoctor);

module.exports = router; // Export the router