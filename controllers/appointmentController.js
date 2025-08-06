// controllers/appointmentController.js
const Appointment = require('../models/appointmentModel'); // Import the Appointment model
const Doctor = require('../models/doctorModel'); // Import the Doctor model to update time slot availability
const mongoose = require('mongoose'); // Import mongoose for session management

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (e.g., authenticated users)
exports.bookAppointment = async (req, res, next) => {
  // Start a Mongoose session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get patient details from the request body
  const { doctorId, appointmentDate, appointmentTime, timeSlotId, patientName, patientEmail, patientPhone } = req.body;
  
  // NEW: Get the authenticated user's ID from the request object (set by auth middleware)
  const patientId = req.user.id;
    //  Basic validation (much is handled by Mongoose, but this is a good fail-fast)
    if (!doctorId || !appointmentDate || !appointmentTime || !timeSlotId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, and time slot are required.',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const slotIndex = doctor.timeSlots.findIndex(slot => slot.id === timeSlotId);
    if (slotIndex === -1 || !doctor.timeSlots[slotIndex].isAvailable) {
      return res.status(400).json({ success: false, message: 'Selected time slot is not available.' });
    }

    // NEW: Combine date and time into a single Date object for the new schema
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);

    // 3. Mark the time slot as unavailable
    doctor.timeSlots[slotIndex].isAvailable = false;
    await doctor.save();

    // 4. Create the new appointment with the updated schema fields
    const appointmentData = await Appointment.create({
      doctorId,
      patientId, // NEW: Add the authenticated user's ID
      patientName: patientName || req.user.name, // Use provided name or default to user's name
      patientEmail: patientEmail || req.user.email, // Use provided email or default to user's email
      patientPhone,
      appointmentDateTime, // MODIFIED: Use the combined Date object
      timeSlotId,
      status: 'confirmed',
    });

     const [appointment] = await Appointment.create([appointmentData], { session });

    // If all operations were successful, commit the transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment booked successfully!',
    });
  } catch (error) {
    // If any operation fails, abort the transaction
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message || 'Appointment booking failed.' });
  } finally {
    // End the session
    session.endSession();
  }
};

// @desc    Get all appointments (for admin/doctor panel)
// @route   GET /api/appointments
// @access  Private (e.g., admin/doctor only)
exports.getAllAppointments = async (req, res, next) => {
  try {
    let query;

    // --- Filtering ---
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit']; // Fields to exclude from filtering
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = Appointment.find(JSON.parse(queryStr));

    // --- Sorting ---
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-appointmentDateTime'); // Default sort by newest
    }

    // --- Pagination ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Appointment.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // --- Populating ---
    query = query.populate('doctorId', 'name specialization').populate('patientId', 'name');

    // Executing query
    const appointments = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId', 'name specialization').populate('patientId', 'name email');;

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with ID of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment details fetched successfully.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Appointment ID: ${req.params.id}`,
      });
    }
    next(error);
  }
};

// @desc    Update appointment status (e.g., confirmed, cancelled, completed)
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided. Must be pending, confirmed, cancelled, or completed.',
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with ID of ${req.params.id}`,
      });
    }

    // If an appointment is cancelled, make the time slot available again
    if (status === 'cancelled') {
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        const slot = doctor.timeSlots.find(s => s.id === appointment.timeSlotId);
        if (slot) {
          slot.isAvailable = true;
          await doctor.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment status updated to ${status}.`,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Appointment ID: ${req.params.id}`,
      });
    }
    next(error);
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment not found with ID of ${req.params.id}`,
      });
    }

    // Optionally, if an appointment is deleted, make the time slot available again
    // This depends on business logic (e.g., if deletion implies cancellation)
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      const slot = doctor.timeSlots.find(s => s.id === appointment.timeSlotId);
      if (slot) {
        slot.isAvailable = true;
        await doctor.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Appointment deleted successfully.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Appointment ID: ${req.params.id}`,
      });
    }
    next(error);
  }
};

// @desc    Get appointment history for the logged-in user
// @route   GET /api/appointments/myhistory
// @access  Private
exports.getMyHistory = async (req, res) => {
    try {
        // Find all appointments where the patientId matches the logged-in user's ID
        const userAppointments = await Appointment.find({ patientId: req.user.id })
            .populate('doctorId', 'name specialization') // Optional: get doctor details
            .sort({ appointmentDateTime: -1 }); // Show newest first

        res.status(200).json({
            success: true,
            count: userAppointments.length,
            data: userAppointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
