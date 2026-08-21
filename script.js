// =========================================================
// CLASS G1-NW-B
// Network Engineering Class Management
// GitHub + Vercel + Google Sheets + Apps Script
// =========================================================


// =========================================================
// 1. GOOGLE SHEETS API
// =========================================================

const GOOGLE_SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbwzKJ8fwImxRdKwSz8QJAgnD5ek-CgeV2is10aZY2l7KeI2ChydmwXA4NkupSQrj0mj/exec";


// =========================================================
// 2. ADMIN CONFIGURATION
// =========================================================
// NOTE:
// This is frontend authentication.
// It is OK for a school/class project,
// but NOT secure for a real production system.

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";


// =========================================================
// 3. GLOBAL VARIABLES
// =========================================================

let currentRole = localStorage.getItem("userRole") || "user";

let studentList = [];

let scheduleList = [];


// Materials currently stored in browser localStorage
let materialsList = loadMaterials();


// =========================================================
// 4. DEFAULT MATERIALS
// =========================================================

function loadMaterials() {

  try {

    const savedMaterials =
      localStorage.getItem("materialsData");

    if (savedMaterials) {

      const parsed = JSON.parse(savedMaterials);

      if (Array.isArray(parsed)) {
        return parsed;
      }

    }

  } catch (error) {

    console.error(
      "Error loading materials:",
      error
    );

  }


  return [

    {
      id: 1,
      title: "Lab 01: OSPF Multi-Area Setup",
      subject: "CS IV",
      type: "LAB",
      url: "https://drive.google.com"
    },

    {
      id: 2,
      title: "Database Administration II Slide",
      subject: "DA II",
      type: "SLIDE",
      url: "https://drive.google.com"
    }

  ];

}


// =========================================================
// 5. PAGE INITIALIZATION
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "CLASS G1-NW-B Application Started"
    );


    // Navigation
    setupNavigation();


    // Authentication
    setupAuthEvents();


    // Update User/Admin UI
    updateRoleUI();


    // Load Schedule
    fetchSchedule();


    // Load Students
    fetchStudents();


    // Student Search
    setupStudentSearch();


    // Materials
    renderMaterials(materialsList);

    setupMaterialsForm();

    setupMaterialsSearch();


    // Global Search
    setupGlobalSearch();


    // Update Dashboard
    updateDashboardStats();

  }
);


// =========================================================
// 6. NAVIGATION
// =========================================================

function setupNavigation() {

  const links =
    document.querySelectorAll(
      ".nav-link"
    );

  const pages =
    document.querySelectorAll(
      ".page-content"
    );


  if (!links.length) {
    return;
  }


  links.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        event.preventDefault();


        // Remove active
        links.forEach(item => {

          item.classList.remove(
            "active"
          );

        });


        pages.forEach(page => {

          page.classList.remove(
            "active"
          );

        });


        // Add active
        link.classList.add(
          "active"
        );


        // Find target section
        const targetId =
          link.id.replace(
            "menu-",
            "section-"
          );


        const target =
          document.getElementById(
            targetId
          );


        if (target) {

          target.classList.add(
            "active"
          );

        }

      }
    );

  });

}


// =========================================================
// 7. AUTHENTICATION
// =========================================================

function setupAuthEvents() {

  const authBtn =
    document.getElementById(
      "auth-btn"
    );


  const loginModal =
    document.getElementById(
      "login-modal"
    );


  const closeModalBtn =
    document.getElementById(
      "close-modal-btn"
    );


  const loginForm =
    document.getElementById(
      "login-form"
    );


  const loginError =
    document.getElementById(
      "login-error"
    );


  // -----------------------------------------
  // LOGIN / LOGOUT BUTTON
  // -----------------------------------------

  if (authBtn) {

    authBtn.addEventListener(
      "click",
      () => {

        if (
          currentRole ===
          "admin"
        ) {

          // Logout

          currentRole =
            "user";


          localStorage.setItem(
            "userRole",
            "user"
          );


          updateRoleUI();

          renderMaterials(
            materialsList
          );


        } else {

          // Login

          if (loginModal) {

            loginModal.style.display =
              "flex";

          }


          if (loginError) {

            loginError.style.display =
              "none";

          }

        }

      }
    );

  }


  // -----------------------------------------
  // CLOSE LOGIN MODAL
  // -----------------------------------------

  if (
    closeModalBtn &&
    loginModal
  ) {

    closeModalBtn.addEventListener(
      "click",
      () => {

        loginModal.style.display =
          "none";

      }
    );

  }


  // -----------------------------------------
  // CLICK OUTSIDE MODAL
  // -----------------------------------------

  if (loginModal) {

    loginModal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          loginModal
        ) {

          loginModal.style.display =
            "none";

        }

      }
    );

  }


  // -----------------------------------------
  // LOGIN FORM
  // -----------------------------------------

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const username =
          document.getElementById(
            "login-user"
          )?.value.trim();


        const password =
          document.getElementById(
            "login-pass"
          )?.value;


        if (
          username ===
            ADMIN_USER &&
          password ===
            ADMIN_PASS
        ) {

          // Login success

          currentRole =
            "admin";


          localStorage.setItem(
            "userRole",
            "admin"
          );


          if (loginModal) {

            loginModal.style.display =
              "none";

          }


          loginForm.reset();


          if (loginError) {

            loginError.style.display =
              "none";

          }


          updateRoleUI();


          renderMaterials(
            materialsList
          );


          showMessage(
            "Login Admin បានជោគជ័យ ✅",
            "success"
          );


        } else {

          if (loginError) {

            loginError.style.display =
              "block";

          }

        }

      }
    );

  }

}


// =========================================================
// 8. UPDATE ROLE UI
// =========================================================

function updateRoleUI() {

  const roleBadge =
    document.getElementById(
      "role-badge"
    );


  const authBtn =
    document.getElementById(
      "auth-btn"
    );


  const uploadPanel =
    document.getElementById(
      "upload-panel"
    );


  // IMPORTANT:
  // Support different IDs/classes
  // from your new index.html

  const addMaterialBtn =
    document.getElementById(
      "add-material-btn"
    );


  const adminOnlyElements =
    document.querySelectorAll(
      ".admin-only"
    );


  const isAdmin =
    currentRole ===
    "admin";


  // -----------------------------------------
  // ROLE BADGE
  // -----------------------------------------

  if (roleBadge) {

    roleBadge.textContent =
      isAdmin
        ? "ADMIN"
        : "USER";


    if (isAdmin) {

      roleBadge.style.background =
        "rgba(16, 185, 129, 0.20)";

      roleBadge.style.color =
        "#10b981";

    } else {

      roleBadge.style.background =
        "rgba(148, 163, 184, 0.20)";

      roleBadge.style.color =
        "#94a3b8";

    }

  }


  // -----------------------------------------
  // AUTH BUTTON
  // -----------------------------------------

  if (authBtn) {

    authBtn.textContent =
      isAdmin
        ? "🚪 Logout"
        : "🔑 Login Admin";

  }


  // -----------------------------------------
  // ADD MATERIAL BUTTON
  // -----------------------------------------

  if (addMaterialBtn) {

    addMaterialBtn.style.display =
      isAdmin
        ? ""
        : "none";

  }


  // -----------------------------------------
  // UPLOAD PANEL
  // -----------------------------------------

  if (uploadPanel) {

    uploadPanel.style.display =
      isAdmin
        ? "block"
        : "none";

  }


  // -----------------------------------------
  // ALL ADMIN ONLY ELEMENTS
  // -----------------------------------------

  adminOnlyElements.forEach(
    element => {

      element.style.display =
        isAdmin
          ? ""
          : "none";

    }
  );

}


// =========================================================
// 9. GOOGLE SHEETS REQUEST HELPER
// =========================================================

async function googleSheetRequest(
  action
) {

  const url =
    `${GOOGLE_SHEET_API_URL}?action=${encodeURIComponent(action)}`;


  const response =
    await fetch(
      url,
      {
        method: "GET",
        redirect: "follow",
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `HTTP Error ${response.status}`
    );

  }


  const data =
    await response.json();


  if (
    data &&
    data.error
  ) {

    throw new Error(
      data.error
    );

  }


  return data;

}


// =========================================================
// 10. FETCH SCHEDULE
// =========================================================

async function fetchSchedule() {

  const tbody =
    document.getElementById(
      "schedule-body"
    );


  const totalSubj =
    document.getElementById(
      "total-subjects"
    );


  const daysMap = {

    0: "អាទិត្យ",

    1: "ច័ន្ទ",

    2: "អង្គារ",

    3: "ពុធ",

    4: "ព្រហស្បតិ៍",

    5: "សុក្រ",

    6: "សៅរ៍"

  };


  const todayKhmer =
    daysMap[
      new Date().getDay()
    ];


  if (tbody) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="5"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:25px;
          "
        >

          កំពុងភ្ជាប់ទៅ Google Sheets...

        </td>

      </tr>

    `;

  }


  try {

    const data =
      await googleSheetRequest(
        "getSchedule"
      );


    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {

      scheduleList = [];


      if (tbody) {

        tbody.innerHTML = `

          <tr>

            <td
              colspan="5"
              style="
                text-align:center;
                padding:25px;
              "
            >

              ពុំមានទិន្នន័យកាលវិភាគឡើយ

            </td>

          </tr>

        `;

      }


      if (totalSubj) {

        totalSubj.textContent =
          "0";

      }


      return;

    }


    scheduleList =
      data;


    renderSchedule(
      scheduleList,
      todayKhmer
    );


  } catch (error) {

    console.error(
      "Schedule Error:",
      error
    );


    if (tbody) {

      tbody.innerHTML = `

        <tr>

          <td
            colspan="5"
            style="
              text-align:center;
              color:#f87171;
              padding:25px;
            "
          >

            ⚠️ មិនអាចភ្ជាប់ Google Sheets បាន

          </td>

        </tr>

      `;

    }


    if (totalSubj) {

      totalSubj.textContent =
        "0";

    }

  }

}


// =========================================================
// 11. RENDER SCHEDULE
// =========================================================

function renderSchedule(
  data,
  todayKhmer
) {

  const tbody =
    document.getElementById(
      "schedule-body"
    );


  const totalSubj =
    document.getElementById(
      "total-subjects"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  data.forEach(
    item => {

      const tr =
        document.createElement(
          "tr"
        );


      const day =
        safeText(item.day);


      const time =
        safeText(item.time);


      const subject =
        safeText(item.subject);


      const room =
        safeText(item.room);


      const instructor =
        safeText(item.instructor);


      if (
        day.trim() ===
        todayKhmer
      ) {

        tr.classList.add(
          "today-highlight"
        );

      }


      tr.innerHTML = `

        <td>
          <strong>
            ${day}
          </strong>
        </td>

        <td>
          ${time}
        </td>

        <td>
          ${subject}
        </td>

        <td>

          <span class="room-badge">
            ${room}
          </span>

        </td>

        <td>
          ${instructor}
        </td>

      `;


      tbody.appendChild(
        tr
      );

    }
  );


  if (totalSubj) {

    totalSubj.textContent =
      data.length;

  }

}


// =========================================================
// 12. FETCH STUDENTS
// =========================================================

async function fetchStudents() {

  const tbody =
    document.getElementById(
      "student-body"
    );


  if (tbody) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:25px;
          "
        >

          កំពុងទាញយកទិន្នន័យសិស្ស...

        </td>

      </tr>

    `;

  }


  try {

    const data =
      await googleSheetRequest(
        "getStudents"
      );


    if (
      !Array.isArray(data)
    ) {

      throw new Error(
        "Students data is not an array"
      );

    }


    studentList =
      data;


    renderStudents(
      studentList
    );


    updateStudentCount();


  } catch (error) {

    console.error(
      "Students Error:",
      error
    );


    if (tbody) {

      tbody.innerHTML = `

        <tr>

          <td
            colspan="6"
            style="
              text-align:center;
              color:#f87171;
              padding:25px;
            "
          >

            ⚠️ មិនអាចទាញយកទិន្នន័យសិស្សពី Google Sheets បាន

          </td>

        </tr>

      `;

    }

  }

}


// =========================================================
// 13. RENDER STUDENTS
// =========================================================

function renderStudents(
  data
) {

  const tbody =
    document.getElementById(
      "student-body"
    );


  if (!tbody) {
    return;
  }


  tbody.innerHTML = "";


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:25px;
          "
        >

          🔍 រកមិនឃើញទិន្នន័យសិស្ស

        </td>

      </tr>

    `;


    return;

  }


  data.forEach(
    (student, index) => {

      const tr =
        document.createElement(
          "tr"
        );


      const gender =
        safeText(
          student.gender
        );


      const genderClass =
        gender === "ស្រី"
          ? "female"
          : "male";


      tr.innerHTML = `

        <td>
          ${
            safeText(
              student.id ||
              index + 1
            )
          }
        </td>

        <td>

          <strong
            style="
              color:var(--accent-cyan);
            "
          >

            ${
              safeText(
                student.student_id
              )
            }

          </strong>

        </td>

        <td>
          ${safeText(student.name_kh)}
        </td>

        <td>
          ${safeText(student.name_en)}
        </td>

        <td>

          <span
            class="gender-badge ${genderClass}"
          >

            ${gender}

          </span>

        </td>

        <td>
          ${safeText(student.dob)}
        </td>

      `;


      tbody.appendChild(
        tr
      );

    }
  );

}


// =========================================================
// 14. UPDATE STUDENT COUNT
// =========================================================

function updateStudentCount() {

  const totalStudents =
    document.getElementById(
      "total-students"
    );


  if (totalStudents) {

    totalStudents.textContent =
      studentList.length;

  }

}


// =========================================================
// 15. STUDENT SEARCH
// =========================================================

function setupStudentSearch() {

  const input =
    document.getElementById(
      "student-search"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    event => {

      const query =
        event.target.value
          .toLowerCase()
          .trim();


      if (!query) {

        renderStudents(
          studentList
        );

        return;

      }


      const filtered =
        studentList.filter(
          student => {

            return (

              String(
                student.name_kh || ""
              )
                .toLowerCase()
                .includes(query)

              ||

              String(
                student.name_en || ""
              )
                .toLowerCase()
                .includes(query)

              ||

              String(
                student.student_id || ""
              )
                .toLowerCase()
                .includes(query)

            );

          }
        );


      renderStudents(
        filtered
      );

    }
  );

}


// =========================================================
// 16. MATERIALS RENDER
// =========================================================

function renderMaterials(
  data
) {

  const container =
    document.getElementById(
      "materials-list"
    );


  if (!container) {
    return;
  }


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    container.innerHTML = `

      <p
        style="
          color:var(--text-muted);
          grid-column:1/-1;
          text-align:center;
          padding:30px;
        "
      >

        📚 មិនទាន់មានឯកសារមេរៀនឡើយ

      </p>

    `;


    updateMaterialsCount();

    return;

  }


  container.innerHTML =
    data.map(
      material => {

        const id =
          Number(
            material.id
          );


        const title =
          safeText(
            material.title
          );


        const subject =
          safeText(
            material.subject
          );


        const type =
          safeText(
            material.type
          );


        const url =
          safeAttribute(
            material.url
          );


        return `

          <div
            class="material-card"
          >

            <div
              class="material-meta"
            >

              <span
                class="badge-subject"
              >
                ${subject}
              </span>

              <span
                class="badge-type"
              >
                ${type}
              </span>

            </div>


            <div
              class="material-title"
            >
              ${title}
            </div>


            <div
              style="
                display:flex;
                gap:8px;
                margin-top:12px;
              "
            >

              <a
                href="${url}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-download"
                style="flex:1;"
              >

                📥 ទាញយកឯកសារ

              </a>


              ${
                currentRole === "admin"

                  ? `

                    <button
                      type="button"
                      onclick="deleteMaterial(${id})"
                      class="btn-delete-mat"
                      title="លុបមេរៀន"
                    >

                      🗑️

                    </button>

                  `

                  : ""
              }

            </div>

          </div>

        `;

      }
    ).join("");


  updateMaterialsCount();

}


// =========================================================
// 17. MATERIAL COUNT
// =========================================================

function updateMaterialsCount() {

  const elements =
    document.querySelectorAll(
      "#total-materials, #material-count, [data-stat='materials']"
    );


  elements.forEach(
    element => {

      element.textContent =
        materialsList.length;

    }
  );

}


// =========================================================
// 18. DELETE MATERIAL
// =========================================================

function deleteMaterial(
  id
) {

  if (
    currentRole !==
    "admin"
  ) {

    showMessage(
      "មានតែ Admin ប៉ុណ្ណោះអាចលុបមេរៀនបាន!",
      "error"
    );

    return;

  }


  const confirmed =
    confirm(
      "តើអ្នកពិតជាចង់លុបឯកសារមេរៀននេះមែនទេ?"
    );


  if (!confirmed) {
    return;
  }


  materialsList =
    materialsList.filter(
      material =>
        Number(material.id) !==
        Number(id)
    );


  saveMaterials();


  renderMaterials(
    materialsList
  );


  showMessage(
    "បានលុបមេរៀនរួចរាល់ 🗑️",
    "success"
  );

}


// =========================================================
// 19. ADD MATERIAL
// =========================================================

function setupMaterialsForm() {

  const form =
    document.getElementById(
      "upload-form"
    );


  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      if (
        currentRole !==
        "admin"
      ) {

        alert(
          "មានតែ Admin ប៉ុណ្ណោះដែលអាចបន្ថែមមេរៀនបាន!"
        );

        return;

      }


      const title =
        document.getElementById(
          "doc-title"
        )?.value.trim();


      const subject =
        document.getElementById(
          "doc-subject"
        )?.value.trim();


      const type =
        document.getElementById(
          "doc-type"
        )?.value.trim();


      const url =
        document.getElementById(
          "doc-url"
        )?.value.trim();


      if (
        !title ||
        !subject ||
        !type ||
        !url
      ) {

        alert(
          "សូមបំពេញព័ត៌មានទាំងអស់!"
        );

        return;

      }


      const newMaterial = {

        id: Date.now(),

        title,

        subject,

        type,

        url

      };


      materialsList.unshift(
        newMaterial
      );


      saveMaterials();


      renderMaterials(
        materialsList
      );


      form.reset();


      showMessage(
        "បានបន្ថែមមេរៀនថ្មី ✅",
        "success"
      );

    }
  );

}


// =========================================================
// 20. SAVE MATERIALS
// =========================================================

function saveMaterials() {

  localStorage.setItem(
    "materialsData",
    JSON.stringify(
      materialsList
    )
  );

}


// =========================================================
// 21. MATERIAL SEARCH
// =========================================================

function setupMaterialsSearch() {

  const input =
    document.getElementById(
      "material-search"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    event => {

      const query =
        event.target.value
          .toLowerCase()
          .trim();


      if (!query) {

        renderMaterials(
          materialsList
        );

        return;

      }


      const filtered =
        materialsList.filter(
          material => {

            return (

              String(
                material.title || ""
              )
                .toLowerCase()
                .includes(query)

              ||

              String(
                material.subject || ""
              )
                .toLowerCase()
                .includes(query)

              ||

              String(
                material.type || ""
              )
                .toLowerCase()
                .includes(query)

            );

          }
        );


      renderMaterials(
        filtered
      );

    }
  );

}


// =========================================================
// 22. GLOBAL SEARCH
// =========================================================

function setupGlobalSearch() {

  const searchInput =
    document.querySelector(
      'input[placeholder*="Search"]'
    );


  if (!searchInput) {
    return;
  }


  searchInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Enter"
      ) {

        return;

      }


      const query =
        searchInput.value
          .toLowerCase()
          .trim();


      if (!query) {
        return;
      }


      // Search Students

      const studentResults =
        studentList.filter(
          student =>

            String(
              student.name_kh || ""
            )
              .toLowerCase()
              .includes(query)

            ||

            String(
              student.name_en || ""
            )
              .toLowerCase()
              .includes(query)

            ||

            String(
              student.student_id || ""
            )
              .toLowerCase()
              .includes(query)

        );


      // Search Materials

      const materialResults =
        materialsList.filter(
          material =>

            String(
              material.title || ""
            )
              .toLowerCase()
              .includes(query)

            ||

            String(
              material.subject || ""
            )
              .toLowerCase()
              .includes(query)

        );


      if (
        studentResults.length >
        0
      ) {

        const studentSearch =
          document.getElementById(
            "student-search"
          );


        if (studentSearch) {

          studentSearch.value =
            query;


          renderStudents(
            studentResults
          );

        }


        activateSection(
          "section-students"
        );


        return;

      }


      if (
        materialResults.length >
        0
      ) {

        const materialSearch =
          document.getElementById(
            "material-search"
          );


        if (materialSearch) {

          materialSearch.value =
            query;

          renderMaterials(
            materialResults
          );

        }


        activateSection(
          "section-materials"
        );


        return;

      }


      showMessage(
        `រកមិនឃើញ "${query}" ឡើយ`,
        "error"
      );

    }
  );

}


// =========================================================
// 23. ACTIVATE SECTION
// =========================================================

function activateSection(
  sectionId
) {

  const section =
    document.getElementById(
      sectionId
    );


  if (!section) {
    return;
  }


  document
    .querySelectorAll(
      ".page-content"
    )
    .forEach(
      page =>
        page.classList.remove(
          "active"
        )
    );


  section.classList.add(
    "active"
  );


  const menuId =
    sectionId.replace(
      "section-",
      "menu-"
    );


  document
    .querySelectorAll(
      ".nav-link"
    )
    .forEach(
      link => {

        link.classList.toggle(
          "active",
          link.id === menuId
        );

      }
    );

}


// =========================================================
// 24. DASHBOARD STATISTICS
// =========================================================

function updateDashboardStats() {

  updateMaterialsCount();

  updateStudentCount();


  const scheduleCount =
    document.getElementById(
      "total-subjects"
    );


  if (
    scheduleCount &&
    scheduleList.length
  ) {

    scheduleCount.textContent =
      scheduleList.length;

  }

}


// =========================================================
// 25. SAFE TEXT
// =========================================================

function safeText(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// =========================================================
// 26. SAFE URL
// =========================================================

function safeAttribute(
  value
) {

  if (
    !value
  ) {

    return "#";

  }


  const url =
    String(value).trim();


  // Allow common web links

  if (
    url.startsWith(
      "https://"
    ) ||
    url.startsWith(
      "http://"
    )
  ) {

    return safeText(
      url
    );

  }


  return "#";

}


// =========================================================
// 27. MESSAGE
// =========================================================

function showMessage(
  message,
  type = "success"
) {

  let messageBox =
    document.getElementById(
      "app-message"
    );


  if (!messageBox) {

    messageBox =
      document.createElement(
        "div"
      );


    messageBox.id =
      "app-message";


    messageBox.style.position =
      "fixed";

    messageBox.style.top =
      "20px";

    messageBox.style.right =
      "20px";

    messageBox.style.zIndex =
      "99999";

    messageBox.style.padding =
      "14px 20px";

    messageBox.style.borderRadius =
      "12px";

    messageBox.style.fontWeight =
      "600";

    messageBox.style.boxShadow =
      "0 10px 30px rgba(0,0,0,.35)";


    document.body.appendChild(
      messageBox
    );

  }


  messageBox.textContent =
    message;


  if (
    type ===
    "error"
  ) {

    messageBox.style.background =
      "#7f1d1d";

    messageBox.style.color =
      "#fecaca";

  } else {

    messageBox.style.background =
      "#064e3b";

    messageBox.style.color =
      "#a7f3d0";

  }


  messageBox.style.display =
    "block";


  clearTimeout(
    messageBox._timer
  );


  messageBox._timer =
    setTimeout(
      () => {

        messageBox.style.display =
          "none";

      },
      3000
    );

}


// =========================================================
// 28. MAKE FUNCTIONS AVAILABLE TO HTML
// =========================================================

window.deleteMaterial =
  deleteMaterial;


window.fetchSchedule =
  fetchSchedule;


window.fetchStudents =
  fetchStudents;


window.renderMaterials =
  renderMaterials;


window.renderStudents =
  renderStudents;
