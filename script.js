// ==========================================
// Class_NW_B
// Frontend JavaScript
// ==========================================


// ==========================================
// CONFIGURATION
// ==========================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbzZtc8aOlO-TZarWgCYXhheagbPPrQ48qtKRoAOq6jUZ611_AjzakGOiiMZH98c8EM/exec";


// ==========================================
// DOM ELEMENTS
// ==========================================

const tableBody =
  document.getElementById(
    "students-table"
  );


const searchInput =
  document.getElementById(
    "search-student"
  );


const modal =
  document.getElementById(
    "student-modal"
  );


const studentForm =
  document.getElementById(
    "student-form"
  );


const modalTitle =
  document.getElementById(
    "modal-title"
  );


const studentIdInput =
  document.getElementById(
    "student-id"
  );


const addStudentBtn =
  document.getElementById(
    "add-student-btn"
  );


const closeModalBtn =
  document.getElementById(
    "close-modal"
  );


const cancelBtn =
  document.getElementById(
    "cancel-btn"
  );


// ==========================================
// STUDENTS DATA
// ==========================================

let studentsData =
  [];


// ==========================================
// API CHECK
// ==========================================

function checkApiUrl() {

  if (
    API_URL.includes(
      "PASTE_YOUR"
    )
  ) {

    alert(
      "Please add your Google Apps Script URL in script.js"
    );

    return false;

  }

  return true;

}


// ==========================================
// GET STUDENTS
// ==========================================

async function getStudents() {

  if (!checkApiUrl()) {

    return;

  }


  try {

    const response =
      await fetch(
        `${API_URL}?action=students`
      );


    if (!response.ok) {

      throw new Error(
        "HTTP Error: " +
        response.status
      );

    }


    const result =
      await response.json();


    if (
      !result.success
    ) {

      throw new Error(
        result.message
      );

    }


    studentsData =
      result.data || [];


    renderStudents(
      studentsData
    );


    loadDashboard();


  } catch (error) {

    console.error(
      "Error loading students:",
      error
    );


    tableBody.innerHTML = `

      <tr>

        <td
          colspan="10"
          style="
            text-align:center;
            color:red;
          "
        >

          Failed to load students.

        </td>

      </tr>

    `;

  }

}


// ==========================================
// RENDER STUDENTS
// ==========================================

function renderStudents(
  students
) {

  if (!tableBody) {

    return;

  }


  tableBody.innerHTML =
    "";


  if (
    students.length === 0
  ) {

    tableBody.innerHTML = `

      <tr>

        <td
          colspan="10"
          style="
            text-align:center;
          "
        >

          No students found.

        </td>

      </tr>

    `;

    return;

  }


  students.forEach(
    (
      student,
      index
    ) => {


      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `

        <td>
          ${index + 1}
        </td>

        <td>
          ${escapeHtml(
            student.student_name
          )}
        </td>

        <td>
          ${escapeHtml(
            student.gender
          )}
        </td>

        <td>
          ${escapeHtml(
            student.major
          )}
        </td>

        <td>
          ${escapeHtml(
            student.year
          )}
        </td>

        <td>
          ${escapeHtml(
            student.class
          )}
        </td>

        <td>
          ${escapeHtml(
            student.phone
          )}
        </td>

        <td>
          ${escapeHtml(
            student.email
          )}
        </td>

        <td>
          ${escapeHtml(
            student.status
          )}
        </td>

        <td>

          <button
            class="btn-edit"
            data-id="${student.id}"
          >

            ✏️ Edit

          </button>


          <button
            class="btn-delete"
            data-id="${student.id}"
          >

            🗑️ Delete

          </button>

        </td>

      `;


      tableBody.appendChild(
        row
      );

    }
  );


  // EDIT BUTTON

  document
    .querySelectorAll(
      ".btn-edit"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            editStudent(
              button.dataset.id
            );

          }
        );

      }
    );


  // DELETE BUTTON

  document
    .querySelectorAll(
      ".btn-delete"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            deleteStudent(
              button.dataset.id
            );

          }
        );

      }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {

    return "-";

  }


  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value;


  return div.innerHTML;

}


// ==========================================
// OPEN ADD MODAL
// ==========================================

function openAddModal() {

  studentForm.reset();


  studentIdInput.value =
    "";


  document.getElementById(
    "student-class"
  ).value =
    "NW_B";


  document.getElementById(
    "student-status"
  ).value =
    "Active";


  modalTitle.textContent =
    "Add Student";


  modal.classList.add(
    "show"
  );

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

  modal.classList.remove(
    "show"
  );

}


// ==========================================
// ADD STUDENT
// ==========================================

async function addStudent(
  student
) {

  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(
              {

                action:
                  "students",

                method:
                  "add",

                data:
                  student

              }
            )

        }
      );


    const result =
      await response.json();


    if (
      result.success
    ) {

      alert(
        "Student added successfully!"
      );


      closeModal();


      getStudents();

    } else {

      alert(
        result.message ||
        "Failed to add student."
      );

    }

  } catch (error) {

    console.error(
      "Add Error:",
      error
    );


    alert(
      "Error adding student."
    );

  }

}


// ==========================================
// EDIT STUDENT
// ==========================================

function editStudent(id) {

  const student =
    studentsData.find(
      s =>
        String(s.id) ===
        String(id)
    );


  if (!student) {

    alert(
      "Student not found."
    );

    return;

  }


  studentIdInput.value =
    student.id;


  document.getElementById(
    "student-name"
  ).value =
    student.student_name || "";


  document.getElementById(
    "student-gender"
  ).value =
    student.gender || "";


  document.getElementById(
    "student-dob"
  ).value =
    formatDateForInput(
      student.date_of_birth
    );


  document.getElementById(
    "student-phone"
  ).value =
    student.phone || "";


  document.getElementById(
    "student-email"
  ).value =
    student.email || "";


  document.getElementById(
    "student-major"
  ).value =
    student.major || "";


  document.getElementById(
    "student-year"
  ).value =
    student.year || "";


  document.getElementById(
    "student-class"
  ).value =
    student.class || "";


  document.getElementById(
    "student-status"
  ).value =
    student.status || "Active";


  modalTitle.textContent =
    "Edit Student";


  modal.classList.add(
    "show"
  );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDateForInput(
  dateValue
) {

  if (!dateValue) {

    return "";

  }


  if (
    typeof dateValue ===
    "string"
  ) {

    return dateValue
      .split(" ")[0];

  }


  return "";

}


// ==========================================
// UPDATE STUDENT
// ==========================================

async function updateStudent(
  id,
  student
) {

  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(
              {

                action:
                  "students",

                method:
                  "update",

                id:
                  id,

                data:
                  student

              }
            )

        }
      );


    const result =
      await response.json();


    if (
      result.success
    ) {

      alert(
        "Student updated successfully!"
      );


      closeModal();


      getStudents();

    } else {

      alert(
        result.message ||
        "Update failed."
      );

    }

  } catch (error) {

    console.error(
      "Update Error:",
      error
    );


    alert(
      "Error updating student."
    );

  }

}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(
  id
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this student?"
    );


  if (!confirmed) {

    return;

  }


  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(
              {

                action:
                  "students",

                method:
                  "delete",

                id:
                  id

              }
            )

        }
      );


    const result =
      await response.json();


    if (
      result.success
    ) {

      alert(
        "Student deleted successfully!"
      );


      getStudents();

    } else {

      alert(
        result.message ||
        "Delete failed."
      );

    }

  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );


    alert(
      "Error deleting student."
    );

  }

}


// ==========================================
// STUDENT FORM SUBMIT
// ==========================================

studentForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();


    const student =
      {

        student_name:
          document
            .getElementById(
              "student-name"
            )
            .value
            .trim(),


        gender:
          document
            .getElementById(
              "student-gender"
            )
            .value,


        date_of_birth:
          document
            .getElementById(
              "student-dob"
            )
            .value,


        phone:
          document
            .getElementById(
              "student-phone"
            )
            .value
            .trim(),


        email:
          document
            .getElementById(
              "student-email"
            )
            .value
            .trim(),


        major:
          document
            .getElementById(
              "student-major"
            )
            .value
            .trim(),


        year:
          document
            .getElementById(
              "student-year"
            )
            .value,


        class:
          document
            .getElementById(
              "student-class"
            )
            .value
            .trim(),


        status:
          document
            .getElementById(
              "student-status"
            )
            .value

      };


    const id =
      studentIdInput.value;


    if (id) {

      updateStudent(
        id,
        student
      );

    } else {

      addStudent(
        student
      );

    }

  }
);


// ==========================================
// SEARCH STUDENT
// ==========================================

searchInput.addEventListener(
  "input",
  function () {

    const keyword =
      this.value
        .toLowerCase()
        .trim();


    const filtered =
      studentsData.filter(
        student => {


          return (

            String(
              student.student_name ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              )

            ||

            String(
              student.email ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              )

            ||

            String(
              student.phone ||
              ""
            )
              .toLowerCase()
              .includes(
                keyword
              )

          );

        }
      );


    renderStudents(
      filtered
    );

  }
);


// ==========================================
// DASHBOARD
// ==========================================

function loadDashboard() {

  const total =
    studentsData.length;


  const active =
    studentsData.filter(
      student =>
        String(
          student.status
        )
        .toLowerCase()
        ===
        "active"
    ).length;


  const male =
    studentsData.filter(
      student =>
        String(
          student.gender
        )
        .toLowerCase()
        ===
        "male"
    ).length;


  const female =
    studentsData.filter(
      student =>
        String(
          student.gender
        )
        .toLowerCase()
        ===
        "female"
    ).length;


  document.getElementById(
    "total-students"
  ).textContent =
    total;


  document.getElementById(
    "active-students"
  ).textContent =
    active;


  document.getElementById(
    "male-students"
  ).textContent =
    male;


  document.getElementById(
    "female-students"
  ).textContent =
    female;

}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const navItems =
  document.querySelectorAll(
    ".nav-item"
  );


const sections =
  document.querySelectorAll(
    ".section"
  );


navItems.forEach(
  item => {

    item.addEventListener(
      "click",
      function () {


        const target =
          this.dataset.section;


        // Remove active nav

        navItems.forEach(
          nav => {

            nav.classList.remove(
              "active"
            );

          }
        );


        // Add active nav

        this.classList.add(
          "active"
        );


        // Hide sections

        sections.forEach(
          section => {

            section.classList.remove(
              "active"
            );

          }
        );


        // Show target section

        const targetSection =
          document.getElementById(
            target
          );


        if (
          targetSection
        ) {

          targetSection.classList.add(
            "active"
          );

        }


        // Update title

        document.getElementById(
          "section-title"
        ).textContent =
          this.textContent.trim();

      }
    );

  }
);


// ==========================================
// MODAL EVENTS
// ==========================================

addStudentBtn.addEventListener(
  "click",
  openAddModal
);


closeModalBtn.addEventListener(
  "click",
  closeModal
);


cancelBtn.addEventListener(
  "click",
  closeModal
);


window.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      modal
    ) {

      closeModal();

    }

  }
);


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    getStudents();

  }
);
