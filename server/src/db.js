const mongoose = require('mongoose');
const { mongoUri } = require('./config');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  // Build the unique indexes and collections up front so the application
  // works against an empty or not-yet-created local database.
  await Promise.all([Student.init(), Course.init(), Enrollment.init()]);

  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
