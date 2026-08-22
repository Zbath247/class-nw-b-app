// ===============================
// Configuration
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbxq0WCESMqtfQcEv2g5Hv4L_pxD2UdUL8atOtfEFMvEjkluX9TkDWWpb7cIOjNW2QVM/exec"; // 👉 Replace with your deployed Apps Script URL

// ===============================
// DOM Elements
// ===============================
const tableBody = document.querySelector("#students-table tbody");
const searchInput = document.querySelector("#search-input");

// ===============================
// Fetch Students
// ===============================
async function getStudents() {
  // ✅ Only run if table exists
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_URL}?action=students`);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    renderStudents(data);
  } catch (err) {
    console.error("Error fetching students:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;color:red;">
          ⚠️ Failed to load data. Please check API connection.
        </td>
      </tr>`;
  }
}

// ===============================
// Render Students
// ===============================
function renderStudents(students) {
  if (!tableBody) return;
  tableBody.innerHTML = "";
  students.forEach((s, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${s.student_name || "-"}</td>
      <td>${s.gender || "-"}</td>
      <td>${s.major || "-"}</td>
      <td>${s.year || "-"}</td>
      <td>${s.class || "-"}</td>
      <td>${s.phone || "-"}</td>
      <td>${s.email || "-"}</td>
      <td>${s.status || "-"}</td>
      <td>
        <button class="btn-edit" onclick="editStudent('${s.student_id}')">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteStudent('${s.student_id}')">🗑️ Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ===============================
// Search Students
// ===============================
if (searchInput && tableBody) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const name = row.children[1].textContent.toLowerCase();
      row.style.display = name.includes(query) ? "" : "none";
    });
  });
}

// ===============================
// Add Student
// ===============================
async function addStudent(student) {
  try {
    const res = await fetch(`${API_URL}?action=students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });
    const result = await res.json();
    alert(result.success ? "✅ Student added successfully!" : "❌ Failed to add student.");
    getStudents();
  } catch (err) {
    console.error("Error adding student:", err);
  }
}

// ===============================
// Update Student
// ===============================
async function updateStudent(id, student) {
  try {
    const res = await fetch(`${API_URL}?action=students`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...student })
    });
    const result = await res.json();
    alert(result.success ? "✅ Student updated successfully!" : "❌ Student not found.");
    getStudents();
  } catch (err) {
    console.error("Error updating student:", err);
  }
}

// ===============================
// Delete Student
// ===============================
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  try {
    const res = await fetch(`${API_URL}?action=students&id=${id}`, { method: "DELETE" });
    const result = await res.json();
    alert(result.success ? "🗑️ Student deleted successfully!" : "❌ Student not found.");
    getStudents();
  } catch (err) {
    console.error("Error deleting student:", err);
  }
}

// ===============================
// Dashboard Summary
// ===============================
async function loadDashboard() {
  const totalStudentsEl = document.getElementById("total-students");
  if (!totalStudentsEl) return; // ✅ Only run on Dashboard page

  try {
    const res = await fetch(`${API_URL}?action=students`);
    const students = await res.json();
    totalStudentsEl.textContent = students.length;
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

// ===============================
// Initialize
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  getStudents();
  loadDashboard();
});
