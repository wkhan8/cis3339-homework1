const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { clientDistDir, isProduction } = require('./config');
const studentsRouter = require('./routes/students');
const coursesRouter = require('./routes/courses');
const enrollmentsRouter = require('./routes/enrollments');
const { errorHandler } = require('./middleware/errors');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/students', studentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/enrollments', enrollmentsRouter);

// Unknown API routes must stay JSON instead of falling through to the SPA.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

const clientIndex = path.join(clientDistDir, 'index.html');
const hasClientBuild = fs.existsSync(clientIndex);

if (hasClientBuild) {
  app.use(
    express.static(clientDistDir, {
      index: false,
      maxAge: isProduction ? '1h' : 0,
    })
  );

  // History-mode fallback: refreshing /students or /courses must not 404.
  app.get(/.*/, (req, res, next) => {
    if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(clientIndex);
  });
}

app.use((req, res) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }

  if (!hasClientBuild) {
    return res.status(503).json({
      error: 'Frontend build not found. Run "npm run build" and restart the server.',
    });
  }

  return res.status(404).json({ error: 'Not found.' });
});

app.use(errorHandler);

module.exports = app;
