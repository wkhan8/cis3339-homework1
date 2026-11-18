const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: [true, 'Course ID is required.'],
      trim: true,
      uppercase: true,
      unique: true,
      match: [
        /^[A-Z0-9][A-Z0-9 -]{1,19}$/,
        'Course ID must be 2–20 letters, numbers, spaces, or hyphens.',
      ],
    },
    name: {
      type: String,
      required: [true, 'Course name is required.'],
      trim: true,
      minlength: [2, 'Course name must be at least 2 characters.'],
      maxlength: [120, 'Course name cannot exceed 120 characters.'],
    },
  },
  { timestamps: true, versionKey: false }
);

courseSchema.statics.normalizeCourseId = (value) =>
  String(value ?? '').trim().toUpperCase();

module.exports = mongoose.model('Course', courseSchema);
