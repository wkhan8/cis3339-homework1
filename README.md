# CIS 3339 Homework 1 — Student Management System

A full-stack student management application built with **Vue 3 (Composition API)**, **Vue Router**, **Pinia**, **Express**, and **MongoDB**.

The application manages students, courses, and enrollments, validates input, prevents duplicate records, and removes related enrollments when a student or course is deleted.

## Tech stack

- **Frontend:** Vue 3, Vite, Vue Router, Pinia, hand-written responsive CSS
- **Backend:** Node.js, Express 5, Mongoose
- **Database:** MongoDB Community Edition (local)
- **Build:** npm workspaces with a root-level production build

## Features

- **Students:** add, search by name or student ID, display, and delete
- **Courses:** add, list, and delete
- **Enrollments:** enroll an existing student in an existing course, prevent duplicates, and view a course roster
- **Validation:** required fields, student ID / course ID formats, phone and ZIP formats, duplicate rejection
- **Data integrity:** enrollments reference real students and courses; deleting either side removes its enrollments
- **Feedback:** loading, success, error, validation, and empty states throughout
- **Production deployment:** Express serves the Vite build and supports Vue Router history-mode refreshes
- **Responsive UI:** usable at desktop and mobile widths, with labelled controls and keyboard-accessible dialogs

## Requirements

- **Node.js 18.18 or newer** (tested with Node 22.14)
- **npm 9 or newer**
- **MongoDB Community Edition** running locally (tested with MongoDB 8.0)
- A modern web browser

No cloud database, Atlas account, or authentication credentials are required.

## Configuration

The repository includes the real `.env` file used by the application:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

These are local, non-secret values. The database and its collections are created automatically on startup — no manual database creation, migration, seed, import, or rebuild step is needed.

## Production: install, build, and run

From the repository root:

```bash
npm install
npm run build
npm start
```

Open:

**http://localhost:3000**

`npm run build` compiles the Vue frontend into `client/dist`. `npm start` starts Express, connects to MongoDB, and serves both the API and the built frontend from port 3000.

### Start MongoDB first

If MongoDB is not already running as a service, start it with a data directory:

```bash
mongod --dbpath "C:\data\db"
```

On macOS with Homebrew:

```bash
brew services start mongodb-community
```

On Linux with systemd:

```bash
sudo systemctl start mongod
```

The app works against an empty or nonexistent `cis3339_homework1` database.

## Development

Run the Express API and the Vite dev server together:

```bash
npm install
npm run dev
```

- Frontend: **http://localhost:5173**
- API: **http://localhost:3000**

Vite proxies `/api` requests to the Express server. You can also run each side separately:

```bash
npm run dev:server
npm run dev:client
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm install` | Install root, server, and client dependencies using npm workspaces |
| `npm run build` | Build the Vue production bundle into `client/dist` |
| `npm start` | Start the Express production server on port 3000 |
| `npm run dev` | Run the API and Vite dev server together |
| `npm run dev:server` | Run only the Express API with Node's watch mode |
| `npm run dev:client` | Run only the Vite dev server |
| `npm run test:api` | Run the API smoke test (server and MongoDB must be running) |

## API

All API routes are prefixed with `/api`.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server and database health |
| GET | `/api/students?search=term` | List or search students |
| GET | `/api/students/:studentId` | Get one student |
| POST | `/api/students` | Add a student |
| DELETE | `/api/students/:studentId` | Delete a student and their enrollments |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:courseId` | Get one course |
| POST | `/api/courses` | Add a course |
| DELETE | `/api/courses/:courseId` | Delete a course and its enrollments |
| GET | `/api/enrollments` | List all enrollments |
| GET | `/api/enrollments?courseId=CIS%203339` | List a course roster |
| POST | `/api/enrollments` | Enroll a student in a course |
| DELETE | `/api/enrollments/:id` | Remove an enrollment |

Example request bodies:

```json
{
  "name": "John Smith",
  "studentId": "1001",
  "phone": "555-1234",
  "zip": "77001"
}
```

```json
{
  "courseId": "CIS 3339",
  "name": "Enterprise Applications Development"
}
```

```json
{
  "studentId": "1001",
  "courseId": "CIS 3339"
}
```

Errors use appropriate HTTP status codes (`400` validation, `404` not found, `409` duplicate, `500` unexpected) and return JSON in the form `{ "error": "message" }`.

## Project structure

```text
cis3339-homework1/
├── .env                     # Committed local MongoDB configuration
├── package.json             # Root npm workspace and production scripts
├── README.md
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js           # Express app, API mounting, SPA fallback
│       ├── server.js        # Startup and graceful shutdown
│       ├── config.js        # .env loading and paths
│       ├── db.js            # Mongoose connection and index initialization
│       ├── middleware/      # Async wrapper and centralized error handling
│       ├── models/          # Student, Course, Enrollment schemas
│       └── routes/          # Students, courses, enrollments REST routes
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── api/             # fetch wrapper
│       ├── assets/          # shared design system and responsive styles
│       ├── components/      # forms, tables, roster, dialog, states
│       ├── router/          # Vue Router history-mode routes
│       ├── stores/          # Pinia stores for students, courses, enrollments
│       └── views/           # Students, Courses, Enrollments, NotFound
└── scripts/
    └── api-smoke-test.js
```

## Data integrity

- `Student.studentId` and `Course.courseId` have unique indexes.
- Course IDs are normalized to uppercase before storage.
- `Enrollment` stores ObjectId references to a student and a course.
- A unique compound index on `{ student, course }` prevents duplicate enrollments.
- `DELETE /api/students/:studentId` removes that student's enrollments.
- `DELETE /api/courses/:courseId` removes that course's enrollments.
- Duplicate keys are also caught centrally and returned as `409` responses.

## Manual verification

1. Add students `John` (`1001`) and `Jane` (`1002`).
2. Search for `John` and confirm the correct record appears.
3. Try to add another student with ID `1001` and confirm it is rejected.
4. Add courses `CIS 3339` and `CIS 3368`.
5. Try to add `CIS 3339` again and confirm it is rejected.
6. Enroll John in `CIS 3339`, then try the same enrollment again and confirm it is rejected.
7. Enroll Jane in `CIS 3339` and confirm both students appear in the course roster.
8. Delete John and confirm his enrollment disappears from the roster.
9. Delete `CIS 3339` and confirm its remaining enrollment is removed.
10. Restart the server, refresh the browser, and confirm data persists in MongoDB.
11. Run `npm run build`, `npm start`, and open `http://localhost:3000` to verify the production build.
12. Refresh `/students`, `/courses`, and `/enrollments` directly and confirm no 404 is returned.

The API smoke test automates the duplicate, roster, and cascading-delete checks:

```bash
npm run test:api
```

## Troubleshooting

### The server cannot connect to MongoDB

- Confirm MongoDB Community Edition is running on `127.0.0.1:27017`.
- Confirm `.env` exists and contains the `MONGODB_URI` shown above.
- If MongoDB uses another port, update `MONGODB_URI` and restart the server.

### The production page is blank or returns 404

- Run `npm run build` before `npm start`.
- Confirm `client/dist/index.html` exists.
- Restart the server after rebuilding.

### Port 3000 is already in use

Change `PORT` in `.env`, restart the server, and use the new URL. If you change the API port for development, update the Vite proxy target in `client/vite.config.js`.

## Notes

- `node_modules/`, `client/dist/`, and local MongoDB data are intentionally ignored by Git.
- The `.env` file is intentionally committed because the assignment requires the real local configuration in the repository.
