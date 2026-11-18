/**
 * End-to-end API smoke test.
 *
 * Usage: start MongoDB and the Express server, then run `npm run test:api`.
 * The test creates uniquely named records and removes them when it finishes.
 */
const assert = require('node:assert/strict');

const BASE_URL = process.env.API_URL || 'http://127.0.0.1:3000';
const runId = `${Date.now()}`;
const suffix = runId.slice(-6);
const studentA = `Smoke A ${suffix}`;
const studentB = `Smoke B ${suffix}`;
const studentIdA = `T${suffix}A`;
const studentIdB = `T${suffix}B`;
const courseIdA = `TST ${suffix}A`;
const courseIdB = `TST ${suffix}B`;

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: options.body
      ? { 'Content-Type': 'application/json', ...(options.headers || {}) }
      : options.headers,
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { status: response.status, body };
}

const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

async function main() {
  const health = await request('/api/health');
  assert.equal(health.status, 200, 'health endpoint should respond');
  assert.equal(health.body.database, 'connected', 'MongoDB should be connected');

  const createdStudents = [];
  const createdCourses = [];

  try {
    let response = await post('/api/students', {
      name: studentA,
      studentId: studentIdA,
      phone: '555-1234',
      zip: '77001',
    });
    assert.equal(response.status, 201, 'student A should be created');
    createdStudents.push(studentIdA);

    response = await post('/api/students', {
      name: studentB,
      studentId: studentIdB,
      phone: '555-5678',
      zip: '77002',
    });
    assert.equal(response.status, 201, 'student B should be created');
    createdStudents.push(studentIdB);

    response = await post('/api/students', {
      name: studentA,
      studentId: studentIdA,
      phone: '555-1234',
      zip: '77001',
    });
    assert.equal(response.status, 409, 'duplicate student ID must be rejected');

    response = await request(`/api/students?search=${encodeURIComponent(studentA)}`);
    assert.equal(response.status, 200);
    assert.ok(
      response.body.students.some((student) => student.studentId === studentIdA),
      'search should find the student'
    );

    response = await post('/api/courses', {
      courseId: courseIdA,
      name: 'Smoke Test Course A',
    });
    assert.equal(response.status, 201, 'course A should be created');
    createdCourses.push(courseIdA);

    response = await post('/api/courses', {
      courseId: courseIdB,
      name: 'Smoke Test Course B',
    });
    assert.equal(response.status, 201, 'course B should be created');
    createdCourses.push(courseIdB);

    response = await post('/api/courses', {
      courseId: courseIdA,
      name: 'Duplicate Course',
    });
    assert.equal(response.status, 409, 'duplicate course ID must be rejected');

    response = await post('/api/enrollments', {
      studentId: studentIdA,
      courseId: courseIdA,
    });
    assert.equal(response.status, 201, 'enrollment should be created');

    response = await post('/api/enrollments', {
      studentId: studentIdA,
      courseId: courseIdA,
    });
    assert.equal(response.status, 409, 'duplicate enrollment must be rejected');

    response = await post('/api/enrollments', {
      studentId: studentIdB,
      courseId: courseIdA,
    });
    assert.equal(response.status, 201, 'second enrollment should be created');

    response = await request(
      `/api/enrollments?courseId=${encodeURIComponent(courseIdA)}`
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.count, 2, 'roster should list both students');

    response = await del(`/api/students/${encodeURIComponent(studentIdA)}`);
    assert.equal(response.status, 200, 'student A should be deleted');
    assert.equal(response.body.removedEnrollments, 1, 'cascade should remove one enrollment');
    createdStudents.splice(createdStudents.indexOf(studentIdA), 1);

    response = await request(
      `/api/enrollments?courseId=${encodeURIComponent(courseIdA)}`
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.count, 1, 'roster should contain only student B');

    response = await del(`/api/courses/${encodeURIComponent(courseIdA)}`);
    assert.equal(response.status, 200, 'course A should be deleted');
    assert.equal(response.body.removedEnrollments, 1, 'cascade should remove one enrollment');
    createdCourses.splice(createdCourses.indexOf(courseIdA), 1);

    response = await request(
      `/api/enrollments?courseId=${encodeURIComponent(courseIdA)}`
    );
    assert.equal(response.status, 404, 'deleted course roster should return 404');

    console.log('API smoke test passed.');
  } finally {
    for (const studentId of createdStudents) {
      await del(`/api/students/${encodeURIComponent(studentId)}`).catch(() => {});
    }
    for (const courseId of createdCourses) {
      await del(`/api/courses/${encodeURIComponent(courseId)}`).catch(() => {});
    }
  }
}

main().catch((error) => {
  console.error('API smoke test failed:', error.message);
  process.exit(1);
});
