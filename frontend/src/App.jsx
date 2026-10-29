
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Students from "./Student";
import Enrollments from "./Enrollments";

// Backend API URL for Course Management
const API = "http://localhost:5000/api/courses";

// Initial values of the course form
const emptyForm = {
  courseId: "",
  instrument: "",
  instructor: "",
  duration: "",
  fee: ""
};

function App() {
  // Stores all courses retrieved from the backend
  const [courses, setCourses] = useState([]);

  // Stores the text entered in the search box
  const [search, setSearch] = useState("");

  // Stores the current course form values
  const [form, setForm] = useState(emptyForm);

  // Stores the ID of the course being edited
  // null means that we are adding a new course
  const [editingId, setEditingId] = useState(null);

  // Stores error messages
  const [error, setError] = useState("");

  // Controls which module is displayed
  const [activeTab, setActiveTab] = useState("courses");

  // GET: Fetch all courses from the backend
  const fetchCourses = async () => {
    try {
      // Sends a GET request to the Course API
      const res = await axios.get(API);

      // Stores the received course data in React state
      setCourses(res.data);

      // Clears any previous error message
      setError("");
    } catch (err) {
      // Displays an error if fetching courses fails
      setError("Unable to load courses. Check the backend server.");
    }
  };

  // Runs once when the component first loads
  // Fetches the course list from the backend
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handles changes in course form inputs
  const handleChange = (e) => {
    // Keeps existing form values and updates the changed field
    // e.target.name identifies the input field
    // e.target.value contains the value entered by the user
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Clears the form and exits edit mode
  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
  };

  // Handles adding a new course or updating an existing course
  const handleSubmit = async (e) => {
    // Prevents the browser from reloading the page
    e.preventDefault();

    setError("");

    // Prepares and cleans the form data before sending it
    const courseData = {
      ...form,
      courseId: form.courseId.trim(),
      instrument: form.instrument.trim(),
      instructor: form.instructor.trim(),
      duration: form.duration.trim(),

      // Converts the fee from a string to a number
      fee: Number(form.fee)
    };

    // Validates that all fields contain valid values
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
        // PUT: Updates an existing course using its ID
        await axios.put(`${API}/${editingId}`, courseData);

        alert("Course updated successfully!");
      } else {
        // POST: Adds a new course to the database
        await axios.post(API, courseData);

        alert("Course added successfully!");
      }

      // Clears the form after a successful operation
      resetForm();

      // Fetches the latest course records to refresh the table
      await fetchCourses();
    } catch (err) {
      // Displays the error message returned by the backend,
      // or a default message if the request fails
      setError(
        err.response?.data?.message ||
        (editingId
          ? "Failed to update course."
          : "Failed to add course.")
      );
    }
  };

  // Loads the selected course into the form for editing
  const updateCourse = (course) => {
    setForm({
      courseId: course.courseId,
      instrument: course.instrument,
      instructor: course.instructor,
      duration: course.duration,

      // Input fields use strings, so convert the fee to a string
      fee: String(course.fee)
    });

    // Stores the MongoDB ID of the selected course
    // This allows handleSubmit to identify an update operation
    setEditingId(course._id);

    setError("");

    // Scrolls to the top so the user can see the edit form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE: Deletes a course using its MongoDB ID
  const deleteCourse = async (id) => {
    // Asks for confirmation before deleting the course
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      // Sends a DELETE request to the backend
      await axios.delete(`${API}/${id}`);

      // Clears the form if the deleted course was being edited
      if (editingId === id) {
        resetForm();
      }

      alert("Course deleted successfully!");

      // Refreshes the course list after deletion
      await fetchCourses();
    } catch (err) {
      // Displays an error if deletion fails
      setError(
        err.response?.data?.message || "Failed to delete course."
      );
    }
  };

  // Filters courses based on the search text
  // Searches by instrument, instructor, or course ID
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

      {/* Navigation buttons for the three modules */}
      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button
          type="button"
          className={`btn ${
            activeTab === "courses"
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          // Displays Course Management
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
          // Displays Student Management
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
          // Displays Enrollment Management
          onClick={() => setActiveTab("enrollments")}
        >
          Enrollment Management
        </button>
      </div>

      {/* Course Management module */}
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
              {/* Changes the heading depending on the operation */}
              <h4 className="mb-0">
                {editingId ? "Edit Course" : "Add New Course"}
              </h4>
            </div>

            <div className="card-body">
              {/* Displays an error message when one exists */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Calls handleSubmit when the form is submitted */}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Creates the course form fields */}
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

                        // Displays the value stored in React state
                        value={form[name]}

                        // Updates state whenever the user types
                        onChange={handleChange}

                        // Fee accepts numbers; other fields accept text
                        type={name === "fee" ? "number" : "text"}

                        // Prevents a negative fee
                        min={name === "fee" ? "0" : undefined}

                        // Allows decimal values for the fee
                        step={name === "fee" ? "0.01" : undefined}

                        // Makes every field mandatory
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Submits the form to add or update a course */}
                <button
                  className="btn btn-primary me-2"
                  type="submit"
                >
                  {editingId ? "Save Changes" : "Add Course"}
                </button>

                {/* Shows Cancel only while editing a course */}
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

          {/* Search input for courses */}
          <input
            className="form-control mb-3"
            placeholder="Search by course ID, instrument, or instructor"
            value={search}

            // Updates search state as the user types
            onChange={(e) => setSearch(e.target.value)}
          />

          <h3>Available Courses</h3>

          {/* Makes the table horizontally scrollable on small screens */}
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
                {/* Displays each course that matches the search */}
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.courseId}</td>
                    <td>{course.instrument}</td>
                    <td>{course.instructor}</td>
                    <td>{course.duration}</td>
                    <td>₹{course.fee}</td>

                    <td className="text-nowrap">
                      {/* Loads this course into the form for editing */}
                      <button
                        type="button"
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => updateCourse(course)}
                      >
                        Edit
                      </button>

                      {/* Deletes this course after confirmation */}
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

          {/* Message shown when no courses match the search */}
          {filteredCourses.length === 0 && (
            <p className="text-center text-muted">
              No courses found.
            </p>
          )}
        </>
      )}

      {/* Displays Student Management when its tab is selected */}
      {activeTab === "students" && <Students />}

      {/* Displays Enrollment Management when its tab is selected */}
      {activeTab === "enrollments" && <Enrollments />}
    </div>
  );
}

// Makes App available for use in main.jsx
export default App;
