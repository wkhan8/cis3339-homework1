const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required.'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters.'],
      maxlength: [80, 'Student name cannot exceed 80 characters.'],
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required.'],
      trim: true,
      unique: true,
      match: [
        /^[A-Za-z0-9-]{2,20}$/,
        'Student ID must be 2–20 letters, numbers, or hyphens.',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      trim: true,
      match: [
        /^[0-9+()\-.\s]{7,20}$/,
        'Enter a valid phone number (7–20 digits and phone symbols).',
      ],
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required.'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits (or ZIP+4).'],
    },
  },
  { timestamps: true, versionKey: false }
);

studentSchema.index({ name: 1 });

module.exports = mongoose.model('Student', studentSchema);
