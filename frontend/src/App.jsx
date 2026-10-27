
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Students from "./Student";
import Enrollments from "./Enrollments";

const API = "http://localhost:5000/api/courses";

const emptyForm = {
  courseId: "",
  instrument: "",
  instructor: "",
  duration: "",
  fee: ""
};

function App() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("courses");

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get(API);
      setCourses(res.data);
      setError("");
    } catch (err) {
      setError("Unable to load courses. Check the backend server.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Clear the form and exit edit mode
  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
  };

  // Add or update a course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const courseData = {
      ...form,
      courseId: form.courseId.trim(),
      instrument: form.instrument.trim(),
      instructor: form.instructor.trim(),
      duration: form.duration.trim(),
      fee: Number(form.fee)
    };

    if (
      !courseData.courseId ||
      !courseData.instrument ||
      !courseData.instructor ||
      !courseData.duration ||
      form.fee.trim() === "" ||
      !Number.isFinite(courseData.fee) ||
      courseData.fee < 0
    ) {
      setError("Please enter valid details in all fields.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, courseData);
        alert("Course updated successfully!");
      } else {
        await axios.post(API, courseData);
        alert("Course added successfully!");
      }

      resetForm();
      await fetchCourses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingId
            ? "Failed to update course."
            : "Failed to add course.")
      );
    }
  };

  // Load a course into the form for editing
  const updateCourse = (course) => {
    setForm({
      courseId: course.courseId,
      instrument: course.instrument,
      instructor: course.instructor,
      duration: course.duration,
      fee: String(course.fee)
    });

    setEditingId(course._id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a course
  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);

      if (editingId === id) {
        resetForm();
      }

      alert("Course deleted successfully!");
      await fetchCourses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete course."
      );
    }
  };

  // Search courses
  const filteredCourses = courses.filter((course) =>
    course.instrument.toLowerCase().includes(search.toLowerCase()) ||
    course.instructor.toLowerCase().includes(search.toLowerCase()) ||
    course.courseId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        Music Academy Management System
      </h1>

      {/* Navigation */}
      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button
          type="button"
          className={`btn ${
            activeTab === "courses"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          Course Management
        </button>

        <button
          type="button"
          className={`btn ${
            activeTab === "students"
              ? "btn-success"
              : "btn-outline-success"
          }`}
          onClick={() => setActiveTab("students")}
        >
          Student Management
        </button>

        <button
          type="button"
          className={`btn ${
            activeTab === "enrollments"
              ? "btn-info"
              : "btn-outline-info"
          }`}
          onClick={() => setActiveTab("enrollments")}
        >
          Enrollment Management
        </button>
      </div>

      {/* Course Management */}
      {activeTab === "courses" && (
        <>
          <div className="card shadow-sm mb-4">
            <div
              className={`card-header ${
                editingId
                  ? "bg-warning text-dark"
                  : "bg-primary text-white"
              }`}
            >
              <h4 className="mb-0">
                {editingId ? "Edit Course" : "Add New Course"}
              </h4>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {[
                    ["courseId", "Course ID"],
                    ["instrument", "Instrument"],
                    ["instructor", "Instructor"],
                    ["duration", "Duration"],
                    ["fee", "Fee (₹)"]
                  ].map(([name, label]) => (
                    <div className="col-md-6 mb-3" key={name}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-control"
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        type={name === "fee" ? "number" : "text"}
                        min={name === "fee" ? "0" : undefined}
                        step={name === "fee" ? "0.01" : undefined}
                        required
                      />
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary me-2"
                  type="submit"
                >
                  {editingId ? "Save Changes" : "Add Course"}
                </button>

                {editingId && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>

          <input
            className="form-control mb-3"
            placeholder="Search by course ID, instrument, or instructor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <h3>Available Courses</h3>

          <div className="table-responsive">
            <table className="table table-bordered table-striped mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Course ID</th>
                  <th>Instrument</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Fee (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseId}</td>
                    <td>{course.instrument}</td>
                    <td>{course.instructor}</td>
                    <td>{course.duration}</td>
                    <td>₹{course.fee}</td>
                    <td className="text-nowrap">
                      <button
                        type="button"
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => updateCourse(course)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteCourse(course._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCourses.length === 0 && (
            <p className="text-center text-muted">
              No courses found.
            </p>
          )}
        </>
      )}

      {/* Student Management */}
      {activeTab === "students" && <Students />}

      {/* Enrollment Management */}
      {activeTab === "enrollments" && <Enrollments />}
    </div>
  );
}

export default App;
