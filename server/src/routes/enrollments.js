const express = require('express');
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errors');

const router = express.Router();

const clean = (value) =>
  value === undefined || value === null ? '' : String(value).trim();

const populateEnrollment = (query) =>
  query
    .populate('student', 'name studentId phone zip')
    .populate('course', 'courseId name');

// GET /api/enrollments
// GET /api/enrollments?courseId=CIS%203339  → roster for one course
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const courseId = clean(req.query.courseId);

    if (!courseId) {
      const enrollments = await populateEnrollment(Enrollment.find())
        .sort({ createdAt: -1 })
        .lean();

      return res.json({ enrollments, count: enrollments.length });
    }

    const course = await Course.findOne({
      courseId: Course.normalizeCourseId(courseId),
    }).lean();

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    const enrollments = await populateEnrollment(
      Enrollment.find({ course: course._id })
    )
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      course,
      enrollments,
      students: enrollments.map((item) => item.student).filter(Boolean),
      count: enrollments.length,
    });
  })
);

// POST /api/enrollments
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const studentId = clean(req.body?.studentId);
    const courseId = Course.normalizeCourseId(req.body?.courseId);

    if (!studentId || !courseId) {
      throw new ApiError(400, 'A student and a course must both be selected.');
    }

    const [student, course] = await Promise.all([
      Student.findOne({ studentId }),
      Course.findOne({ courseId }),
    ]);

    if (!student) {
      throw new ApiError(404, 'Student not found.');
    }
    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    const existing = await Enrollment.exists({
      student: student._id,
      course: course._id,
    });

    if (existing) {
      throw new ApiError(
        409,
        'This student is already enrolled in that course.'
      );
    }

    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id,
    });

    await enrollment.populate([
      { path: 'student', select: 'name studentId phone zip' },
      { path: 'course', select: 'courseId name' },
    ]);

    res.status(201).json({
      message: 'Student enrolled successfully.',
      enrollment,
    });
  })
);

// DELETE /api/enrollments/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new ApiError(400, 'Enrollment ID is invalid.');
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found.');
    }

    await enrollment.deleteOne();
    res.json({ message: 'Enrollment removed successfully.' });
  })
);

module.exports = router;
