// API Configuration
const API_URL = "https://script.google.com/macros/s/AKfycbwohS-KoptupMvspNZNHY54QQ4sTavAERSUPrhF_DrAagivphhoNHDD267Tli8si4wf/exec";

// Navigation
document.querySelectorAll(".sidebar li").forEach(item => {
  item.addEventListener("click", () => {
    const sectionId = item.getAttribute("data-section");
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
    document.getElementById("section-title").textContent = item.textContent;
  });
});

// Example API Functions
async function getStudents() {
  try {
    const res = await fetch(`${API_URL}?action=students`);
    const data = await res.json();
    renderStudents(data);
  } catch (err) {
    console.error("Error fetching students:", err);
  }
}

function renderStudents(students) {
  const tbody = document.getElementById("students-table");
  tbody.innerHTML = "";
  students.forEach(stu => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${stu.student_id}</td>
      <td>${stu.student_name}</td>
      <td>${stu.gender}</td>
      <td>${stu.major}</td>
      <td>${stu.year}</td>
      <td>${stu.class}</td>
      <td>${stu.phone}</td>
      <td>${stu.email}</td>
      <td>${stu.status}</td>
      <td><button onclick="deleteStudent('${stu.student_id}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteStudent(id) {
  try {
    await fetch(`${API_URL}?action=deleteStudent&id=${id}`, { method: "DELETE" });
    getStudents();
  } catch (err) {
    console.error("Error deleting student:", err);
  }
}

// Initialize
getStudents();
