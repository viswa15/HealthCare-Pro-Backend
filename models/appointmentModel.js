// models/appointmentModel.js
const mongoose = require('mongoose');

// Define the Appointment schema
const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Doctor model
    ref: 'Doctor', // Name of the referenced model
    required: [true, 'Doctor ID is required for the appointment'],
  },
  // NEW: Link to the authenticated user who is booking
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes your user model is named 'User'
    required: [true, 'Patient user ID is required'],
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required'],
    // Basic email validation using a regex
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    trim: true,
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone number is required'],
    trim: true,
  },
  appointmentDateTime: {
    type: Date,
    required: [true, 'Appointment date and time are required'],
  },
  timeSlotId: {
    type: String, // The ID of the specific time slot from the doctor's timeSlots array
    required: [true, 'Time slot ID is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], // Possible statuses for an appointment
    default: 'pending',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps automatically
});

// Create and export the Appointment model
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;