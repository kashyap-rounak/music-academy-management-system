
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/students";

const emptyForm = {
  studentId: "",
  name: "",
  email: "",
  phone: "",
  course: ""
};

function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await axios.get(API);
      setStudents(res.data);
      setError("");
    } catch (err) {
      setError("Unable to load students. Check the backend.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
        alert("Student updated successfully!");
      } else {
        await axios.post(API, form);
        alert("Student added successfully!");
      }

      resetForm();
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save student.");
    }
  };

  const editStudent = (student) => {
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course
    });

    setEditingId(student._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);

      if (editingId === id) {
        resetForm();
      }

      alert("Student deleted successfully!");
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete student.");
    }
  };

  const filteredStudents = students.filter((student) =>
    [student.studentId, student.name, student.email, student.course]
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4">Student Management</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            {editingId ? "Edit Student" : "Add New Student"}
          </h5>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              {[
                ["studentId", "Student ID"],
                ["name", "Student Name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["course", "Course"]
              ].map(([name, label]) => (
                <div className="col-md-6 mb-3" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-control"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    type={name === "email" ? "email" : "text"}
                    required
                  />
                </div>
              ))}
            </div>

            <button className="btn btn-success me-2" type="submit">
              {editingId ? "Save Changes" : "Add Student"}
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
        placeholder="Search by student ID, name, email, or course"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.course}</td>
                <td className="text-nowrap">
                  <button
                    type="button"
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => editStudent(student)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteStudent(student._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <p className="text-center text-muted">No students found.</p>
      )}
    </div>
  );
}

export default Students;
