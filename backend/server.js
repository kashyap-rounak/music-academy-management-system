
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Course = require("./models/Course");
const Student = require("./models/Student");
const Enrollment = require("./models/Enrollment");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Check whether a MongoDB ID is valid
const isValidId = (id) => mongoose.isValidObjectId(id);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err.message));

// Test route
app.get("/", (req, res) => {
  res.send("Music Academy Backend is Running!");
});

// ==============================
// COURSE ROUTES
// ==============================

// CREATE: Add a course
app.post("/api/courses", async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ: Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEARCH: By instrument or instructor
app.get("/api/courses/search", async (req, res) => {
  try {
    const q = String(req.query.q || "");

    const courses = await Course.find({
      $or: [
        { instrument: { $regex: q, $options: "i" } },
        { instructor: { $regex: q, $options: "i" } },
      ],
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Update a course
app.put("/api/courses/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Delete a course and its related enrollments
app.delete("/api/courses/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid course ID." });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Remove enrollments linked to this course first
    await Enrollment.deleteMany({ course: course._id });

    await Course.findByIdAndDelete(course._id);

    res.json({
      message: "Course and related enrollments deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==============================
// STUDENT ROUTES
// ==============================

// CREATE: Add a student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ: Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Delete a student and their related enrollments
app.delete("/api/students/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID." });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Remove enrollments linked to this student first
    await Enrollment.deleteMany({ student: student._id });

    await Student.findByIdAndDelete(student._id);

    res.json({
      message: "Student and related enrollments deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==============================
// ENROLLMENT ROUTES
// ==============================

// CREATE: Enroll a student in a course
app.post("/api/enrollments", async (req, res) => {
  try {
    const { student, course } = req.body;

    if (!student || !course) {
      return res.status(400).json({
        message: "Student and course are required.",
      });
    }

    if (!isValidId(student) || !isValidId(course)) {
      return res.status(400).json({
        message: "Invalid student ID or course ID.",
      });
    }

    const existingStudent = await Student.findById(student);

    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found." });
    }

    const enrollment = await Enrollment.create({ student, course });

    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This student is already enrolled in this course.",
      });
    }

    res.status(400).json({ message: err.message });
  }
});

// READ: Get enrollments with student and course details
app.get("/api/enrollments", async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "studentId name email")
      .populate("course", "courseId instrument instructor fee")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE: Change enrollment status
app.put("/api/enrollments/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid enrollment ID." });
    }

    const { status } = req.body;
    const allowedStatuses = ["Active", "Completed", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be Active, Completed, or Cancelled.",
      });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    res.json(enrollment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Remove an enrollment
app.delete("/api/enrollments/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid enrollment ID." });
    }

    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    res.json({ message: "Enrollment deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
