const express = require('express');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errors');

const router = express.Router();

const clean = (value) =>
  value === undefined || value === null ? '' : String(value).trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/students?search=term
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = clean(req.query.search);
    const filter = search
      ? {
          $or: [
            { name: { $regex: escapeRegex(search), $options: 'i' } },
            { studentId: { $regex: escapeRegex(search), $options: 'i' } },
          ],
        }
      : {};

    const students = await Student.find(filter)
      .sort({ name: 1, studentId: 1 })
      .limit(500)
      .lean();

    res.json({ students, count: students.length });
  })
);

// GET /api/students/:studentId
router.get(
  '/:studentId',
  asyncHandler(async (req, res) => {
    const student = await Student.findOne({
      studentId: clean(req.params.studentId),
    }).lean();

    if (!student) {
      throw new ApiError(404, 'Student not found.');
    }

    res.json({ student });
  })
);

// POST /api/students
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = clean(req.body?.name);
    const studentId = clean(req.body?.studentId ?? req.body?.id);
    const phone = clean(req.body?.phone);
    const zip = clean(req.body?.zip);

    if (!name || !studentId || !phone || !zip) {
      throw new ApiError(
        400,
        'Name, student ID, phone number, and ZIP code are all required.'
      );
    }

    const existing = await Student.exists({ studentId });
    if (existing) {
      throw new ApiError(409, `Student ID ${studentId} is already in use.`);
    }

    const student = await Student.create({ name, studentId, phone, zip });

    res.status(201).json({
      message: 'Student added successfully.',
      student,
    });
  })
);

// DELETE /api/students/:studentId — also removes the student's enrollments.
router.delete(
  '/:studentId',
  asyncHandler(async (req, res) => {
    const student = await Student.findOne({
      studentId: clean(req.params.studentId),
    });

    if (!student) {
      throw new ApiError(404, 'Student not found.');
    }

    const removed = await Enrollment.deleteMany({ student: student._id });
    await student.deleteOne();

    res.json({
      message: 'Student deleted successfully.',
      student,
      removedEnrollments: removed.deletedCount,
    });
  })
);

module.exports = router;
