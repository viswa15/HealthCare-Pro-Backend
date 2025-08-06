// controllers/doctorController.js
const Doctor = require('../models/doctorModel'); // Import the Doctor model

// @desc    Get all doctors or search by name/specialization
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
  try {
    const { search } = req.query; // Get search query parameter from the request
    let doctors;

    if (search) {
      // If a search query is provided, perform a case-insensitive search
      // on 'name' or 'specialization' fields.
      doctors = await Doctor.find({
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Case-insensitive regex search for name
          { specialization: { $regex: search, $options: 'i' } }, // Case-insensitive regex search for specialization
        ],
      }).select('-timeSlots.isAvailable'); // Exclude isAvailable from timeSlots for this general list
    } else {
      // If no search query, return all doctors
      doctors = await Doctor.find({}).select('-timeSlots.isAvailable'); // Exclude isAvailable from timeSlots for this general list
    }

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No doctors found matching your criteria.',
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
      message: 'Doctors fetched successfully.',
    });
  } catch (error) {
    // Pass the error to the global error handling middleware
    next(error);
  }
};

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id); // Find a doctor by ID from request parameters

    if (!doctor) {
      // If no doctor is found with the given ID
      return res.status(404).json({
        success: false,
        message: `Doctor not found with ID of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor details fetched successfully.',
    });
  } catch (error) {
    // If the ID format is invalid (e.g., not a valid MongoDB ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Doctor ID: ${req.params.id}`,
      });
    }
    next(error); // Pass other errors to the global error handling middleware
  }
};

// @desc    Get available time slots for a specific doctor
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with ID of ${req.params.id}`,
      });
    }

    // Filter out only the available time slots
    const availableSlots = doctor.timeSlots.filter(slot => slot.isAvailable);

    res.status(200).json({
      success: true,
      data: availableSlots,
      message: 'Doctor availability fetched successfully.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Doctor ID: ${req.params.id}`,
      });
    }
    next(error);
  }
};

// @desc    Add a new doctor (for admin purposes, not part of user-facing features)
// @route   POST /api/doctors
// @access  Private (e.g., admin only)
exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body); // Create a new doctor document from request body

    res.status(201).json({
      success: true,
      data: doctor,
      message: 'Doctor created successfully.',
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

// @desc    Update doctor details (for admin purposes)
// @route   PUT /api/doctors/:id
// @access  Private (e.g., admin only)
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the modified document rather than the original
      runValidators: true, // Run Mongoose validation on update
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with ID of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
      message: 'Doctor updated successfully.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Doctor ID: ${req.params.id}`,
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

// @desc    Delete a doctor (for admin purposes)
// @route   DELETE /api/doctors/:id
// @access  Private (e.g., admin only)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor not found with ID of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: {}, // Return empty data for successful deletion
      message: 'Doctor deleted successfully.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Doctor ID: ${req.params.id}`,
      });
    }
    next(error);
  }
};