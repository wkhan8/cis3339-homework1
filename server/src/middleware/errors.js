class ApiError extends Error {
  constructor(status, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function duplicateKeyMessage(error) {
  const keys = Object.keys(error.keyPattern || error.keyValue || {});

  if (keys.includes('studentId')) return 'That student ID is already in use.';
  if (keys.includes('courseId')) return 'That course ID already exists.';
  if (keys.includes('student') && keys.includes('course')) {
    return 'This student is already enrolled in that course.';
  }

  return 'A record with those details already exists.';
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details.length ? { details: error.details } : {}),
    });
  }

  if (error.name === 'ValidationError' && error.errors) {
    const details = Object.values(error.errors).map((item) => item.message);
    return res.status(400).json({
      error: details[0] || 'The submitted data is invalid.',
      details,
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: duplicateKeyMessage(error) });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'The supplied identifier is invalid.' });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body must be valid JSON.' });
  }

  console.error('Unhandled API error:', error);
  return res.status(500).json({
    error: 'Something went wrong on the server. Please try again.',
  });
}

module.exports = { ApiError, errorHandler };
