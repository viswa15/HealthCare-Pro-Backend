// models/doctorModel.js
const mongoose = require('mongoose');

// Define the schema for time slots within a doctor's availability
const timeSlotSchema = new mongoose.Schema({
  date: {
    type: String, // Storing date as string (YYYY-MM-DD) for simplicity, can be Date type
    required: true,
  },
  time: {
    type: String, // Storing time as string (HH:MM)
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true, // Default to true, meaning the slot is available
  },
});

// Define the main Doctor schema
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'], // Name is a required field
    trim: true, // Remove whitespace from both ends of a string
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
  },
  image: {
    type: String, // URL or path to the doctor's image
    default: 'https://placehold.co/150x150/cccccc/ffffff?text=Doctor', // Placeholder image
  },
  availability: {
    type: String,
    enum: ['available', 'busy',"on-leave"], // Enforce specific values for availability status
    default: 'available',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  experience: {
    type: Number,
    min: 0,
    default: 0,
  },
  education: {
    type: String,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
  },
  timeSlots: [timeSlotSchema], // Array of timeSlotSchema objects
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps automatically
});

// Create and export the Doctor model
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
