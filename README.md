# Music Academy Management System

A full-stack web application for managing music courses, students, and
course enrollments.

## Technology Stack

-   **Frontend:** React, Vite, Bootstrap, Axios
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **ODM:** Mongoose

## Features

-   Add, view, search, update, and delete courses
-   Search courses by instrument or instructor
-   Add, view, update, and delete student records
-   Enroll students in courses
-   View and remove enrollment records
-   Update enrollment status (`Active`, `Completed`, or `Cancelled`)
-   Remove related enrollment records when a course or student is
    deleted

## Prerequisites

Install these before running the project:

-   Node.js and npm
-   MongoDB Community Server running locally, or access to a MongoDB
    connection URI
-   A terminal such as Windows PowerShell

## Project Structure

The project should have a structure similar to this:

``` text
WEB TECH PROJECT 3RD INT/
├── backend/
│   ├── models/
│   │   ├── Course.js
│   │   ├── Student.js
│   │   └── Enrollment.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── Student.jsx
    │   ├── Enrollments.jsx
    │   └── main.jsx
    ├── package.json
    └── ...
```

File and folder names can vary slightly depending on your current
project.

## 1. Configure MongoDB

Start your local MongoDB service first.

The backend reads its database connection string from `backend/.env`.
Create or check that file and set `MONGO_URI` to match your MongoDB
setup.

Example for a local MongoDB server:

``` env
MONGO_URI=mongodb://127.0.0.1:27017/music_academy
PORT=5000
```

This URI is an example. Use the correct URI for your installation. Do
not commit credentials or secrets to a public repository.

Mongoose connects to the database, and MongoDB collections are created
as records are saved.

## 2. Install dependencies

Open a PowerShell terminal at the project root.

Install backend dependencies:

``` powershell
cd backend
npm.cmd install
```

Open a **second terminal** at the project root and install frontend
dependencies:

``` powershell
cd frontend
npm.cmd install
```

If dependencies have already been installed, you usually do not need to
install them again.

## 3. Run the backend

In the first terminal:

``` powershell
cd "E:\WEB TECH PROJECT 3RD INT\backend"
node server.js
```

Replace the example path with the actual path to your project.

Expected messages:

``` text
MongoDB Connected
Server running on port 5000
```

Keep this terminal open while using the application.

If you have a `dev` script configured in `backend/package.json`, you can
use `npm.cmd run dev` instead. If that script is not defined, use
`node server.js`.

The backend test route is:

``` text
http://localhost:5000/
```

It should display:

``` text
Music Academy Backend is Running!
```

## 4. Run the frontend

Open a **second terminal** and run:

``` powershell
cd "E:\WEB TECH PROJECT 3RD INT\frontend"
npm.cmd run dev
```

Replace the example path with the actual path to your project.

Vite will display a local URL, usually:

``` text
http://localhost:5173/
```

Open that URL in your browser. Keep both the backend and frontend
terminals running.

### Quick command summary

Run these commands in **two separate terminals**:

**Terminal 1 --- Backend**

``` powershell
cd "E:\WEB TECH PROJECT 3RD INT\backend"
node server.js
```

**Terminal 2 --- Frontend**

``` powershell
cd "E:\WEB TECH PROJECT 3RD INT\frontend"
npm.cmd run dev
```

Change `E:\WEB TECH PROJECT 3RD INT` to your actual project location. On
Windows PowerShell, `npm.cmd` can be used when the `npm` command does
not work as expected.

## API Overview

The backend runs on port `5000`.

  --------------------------------------------------------------------------------
  Method                  Endpoint                         Purpose
  ----------------------- -------------------------------- -----------------------
  `GET`                   `/`                              Check that the backend
                                                           is running

  `POST`                  `/api/courses`                   Add a course

  `GET`                   `/api/courses`                   Get all courses

  `GET`                   `/api/courses/search?q=Violin`   Search courses by
                                                           instrument or
                                                           instructor

  `PUT`                   `/api/courses/:id`               Update a course

  `DELETE`                `/api/courses/:id`               Delete a course and
                                                           related enrollments

  `POST`                  `/api/students`                  Add a student

  `GET`                   `/api/students`                  Get all students

  `PUT`                   `/api/students/:id`              Update a student

  `DELETE`                `/api/students/:id`              Delete a student and
                                                           related enrollments

  `POST`                  `/api/enrollments`               Enroll a student in a
                                                           course

  `GET`                   `/api/enrollments`               Get enrollment records

  `PUT`                   `/api/enrollments/:id`           Update enrollment
                                                           status

  `DELETE`                `/api/enrollments/:id`           Remove an enrollment
  --------------------------------------------------------------------------------

Allowed enrollment statuses are `Active`, `Completed`, and `Cancelled`.

## Troubleshooting

### `MongoDB Error` or the backend cannot connect

-   Confirm that MongoDB is installed and running.
-   Check `MONGO_URI` in `backend/.env`.
-   Confirm the database host and port in the URI are correct.

### `EADDRINUSE` or port 5000 is already in use

Another process may already be using port `5000`. Stop the other backend
process or configure a different backend port and update the frontend
API URLs to match.

### Frontend cannot load data

-   Confirm the backend is running at `http://localhost:5000`.
-   Check the browser console and backend terminal for errors.
-   Confirm the frontend API URLs use the correct backend address.

### `npm.cmd run dev` is not recognized as a backend script

The backend package may not define a `dev` script. Run:

``` powershell
node server.js
```

### Verify the frontend production build

From the frontend directory:

``` powershell
npm.cmd run build
```

Vite should create a production build in the `dist` directory if
compilation succeeds.

## Notes

-   The frontend and backend run separately during development.
-   MongoDB stores the application records; closing the browser does not
    normally delete saved data.
-   Use test records when verifying delete operations, because deleting
    a course or student also deletes its related enrollment records.