
import { useEffect, useState } from "react";
import axios from "axios";

const STUDENTS_API = "http://localhost:5000/api/students";
const COURSES_API = "http://localhost:5000/api/courses";
const ENROLLMENTS_API = "http://localhost:5000/api/enrollments";

function Enrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [student, setStudent] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load students, courses, and enrollments
  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes, enrollmentsRes] =
        await Promise.all([
          axios.get(STUDENTS_API),
          axios.get(COURSES_API),
          axios.get(ENROLLMENTS_API),
        ]);

      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
      setError("");
    } catch (err) {
      setError("Unable to load data. Check the backend server.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enroll a student
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!student || !course) {
      setError("Please select both a student and a course.");
      return;
    }

    try {
      await axios.post(ENROLLMENTS_API, { student, course });

      setSuccess("Student enrolled successfully!");
      setStudent("");
      setCourse("");

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create enrollment."
      );
    }
  };

  // Update enrollment status
  const updateEnrollmentStatus = async (id, status) => {
    setError("");
    setSuccess("");

    try {
      await axios.put(`${ENROLLMENTS_API}/${id}`, { status });

      setSuccess("Enrollment status updated successfully!");
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update enrollment status."
      );
    }
  };

  // Delete an enrollment
  const deleteEnrollment = async (id) => {
    if (!window.confirm("Are you sure you want to remove this enrollment?")) {
      return;
    }

    try {
      await axios.delete(`${ENROLLMENTS_API}/${id}`);
      setSuccess("Enrollment removed successfully!");
      setError("");
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to remove enrollment."
      );
      setSuccess("");
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4">Student Enrollment</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-dark">
          <h4 className="mb-0">Enroll Student in a Course</h4>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Select Student</label>
              <select
                className="form-select"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                required
              >
                <option value="">Choose a student</option>
                {students.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.studentId} - {item.name}
                  </option>
                ))}
              </select>

              {students.length === 0 && (
                <small className="text-muted">
                  No students found. Add a student first.
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Select Course</label>
              <select
                className="form-select"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                <option value="">Choose a course</option>
                {courses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.courseId} - {item.instrument} (₹{item.fee})
                  </option>
                ))}
              </select>

              {courses.length === 0 && (
                <small className="text-muted">
                  No courses found. Add a course first.
                </small>
              )}
            </div>

            <button
              className="btn btn-info"
              type="submit"
              disabled={students.length === 0 || courses.length === 0}
            >
              Enroll Student
            </button>
          </form>
        </div>
      </div>

      <h3 className="mb-3">Enrollment Records</h3>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course ID</th>
              <th>Instrument</th>
              <th>Enrollment Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {enrollments.map((item) => (
              <tr key={item._id}>
                <td>{item.student?.studentId || "Student deleted"}</td>
                <td>{item.student?.name || "—"}</td>
                <td>{item.course?.courseId || "Course deleted"}</td>
                <td>{item.course?.instrument || "—"}</td>

                <td>
                  {item.enrollmentDate
                    ? new Date(item.enrollmentDate).toLocaleDateString()
                    : "—"}
                </td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    value={item.status || "Active"}
                    onChange={(e) =>
                      updateEnrollmentStatus(item._id, e.target.value)
                    }
                    aria-label={`Status for enrollment ${item._id}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => deleteEnrollment(item._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enrollments.length === 0 && (
        <p className="text-center text-muted">
          No enrollment records found.
        </p>
      )}
    </div>
  );
}

export default Enrollments;
