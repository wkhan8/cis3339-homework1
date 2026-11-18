const express = require('express');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errors');

const router = express.Router();

const clean = (value) =>
  value === undefined || value === null ? '' : String(value).trim();

// GET /api/courses
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const courses = await Course.find()
      .sort({ courseId: 1 })
      .limit(500)
      .lean();

    res.json({ courses, count: courses.length });
  })
);

// GET /api/courses/:courseId
router.get(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({
      courseId: Course.normalizeCourseId(req.params.courseId),
    }).lean();

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    res.json({ course });
  })
);

// POST /api/courses
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const courseId = Course.normalizeCourseId(req.body?.courseId);
    const name = clean(req.body?.name);

    if (!courseId || !name) {
      throw new ApiError(400, 'Course ID and course name are required.');
    }

    const existing = await Course.exists({ courseId });
    if (existing) {
      throw new ApiError(409, `Course ID ${courseId} already exists.`);
    }

    const course = await Course.create({ courseId, name });

    res.status(201).json({
      message: 'Course added successfully.',
      course,
    });
  })
);

// DELETE /api/courses/:courseId — also removes the course's enrollments.
router.delete(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({
      courseId: Course.normalizeCourseId(req.params.courseId),
    });

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    const removed = await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({
      message: 'Course deleted successfully.',
      course,
      removedEnrollments: removed.deletedCount,
    });
  })
);

module.exports = router;
