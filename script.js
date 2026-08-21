// =========================================================
// CLASS NW-B APP
// Google Sheets + Google Apps Script
// GitHub + Vercel
// =========================================================


// =========================================================
// 1. GOOGLE APPS SCRIPT API
// =========================================================

const GOOGLE_SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbwzKJ8fwImxRdKwSz8QJAgnD5ek-CgeV2is10aZY2l7KeI2ChydmwXA4NkupSQrj0mj/exec";


// =========================================================
// 2. ADMIN CONFIGURATION
// =========================================================
// NOTE:
// This is okay for learning/demo.
// Do NOT use client-side password for a real production system.

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";


// =========================================================
// 3. GLOBAL VARIABLES
// =========================================================

let currentRole = localStorage.getItem("userRole") || "user";

let studentList = [];

let scheduleList = [];


// Materials
// Currently stored in LocalStorage.
// If your Apps Script has Materials API, this can later
// be changed to Google Sheets.

let materialsList = [];


// =========================================================
// 4. DEFAULT MATERIALS
// =========================================================

const DEFAULT_MATERIALS = [
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


// =========================================================
// 5. LOAD MATERIALS
// =========================================================

function loadMaterials() {

  try {

    const savedMaterials =
      localStorage.getItem("materialsData");

    if (savedMaterials) {

      const parsed =
        JSON.parse(savedMaterials);

      if (Array.isArray(parsed)) {

        materialsList = parsed;

      } else {

        materialsList = DEFAULT_MATERIALS;

      }

    } else {

      materialsList = DEFAULT_MATERIALS;

      localStorage.setItem(
        "materialsData",
        JSON.stringify(materialsList)
      );

    }

  } catch (error) {

    console.error(
      "Error loading materials:",
      error
    );

    materialsList = DEFAULT_MATERIALS;

  }

}


// =========================================================
// 6. DOM READY
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "CLASS NW-B APP started"
    );


    // Load Local Data
    loadMaterials();


    // Navigation
    setupNavigation();


    // Authentication
    setupAuthEvents();
    updateRoleUI();


    // Schedule
    fetchSchedule();


    // Students
    fetchStudents();
    setupSearch();


    // Materials
    renderMaterials(materialsList);
    setupMaterialsForm();
    setupMaterialsSearch();


    // Close modal by clicking outside
    setupModalOutsideClick();

  }
);


// =========================================================
// 7. NAVIGATION
// =========================================================

function setupNavigation() {

  const links =
    document.querySelectorAll(".nav-link");

  const pages =
    document.querySelectorAll(".page-content");


  if (!links.length) {

    console.warn(
      "Navigation links not found."
    );

    return;

  }


  links.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        event.preventDefault();


        // Remove active
        links.forEach(item => {

          item.classList.remove("active");

        });


        pages.forEach(page => {

          page.classList.remove("active");

        });


        // Add active
        link.classList.add("active");


        const target =
          link.id.replace(
            "menu-",
            "section-"
          );


        const targetPage =
          document.getElementById(target);


        if (targetPage) {

          targetPage.classList.add(
            "active"
          );

        } else {

          console.warn(
            "Page not found:",
            target
          );

        }

      }
    );

  });

}


// =========================================================
// 8. AUTHENTICATION
// =========================================================

function setupAuthEvents() {

  const authBtn =
    document.getElementById("auth-btn");

  const loginModal =
    document.getElementById("login-modal");

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

        // ADMIN -> LOGOUT
        if (currentRole === "admin") {

          logoutAdmin();

        }

        // USER -> OPEN LOGIN
        else {

          openLoginModal();

        }

      }
    );

  }


  // -----------------------------------------
  // CLOSE MODAL
  // -----------------------------------------

  if (
    closeModalBtn &&
    loginModal
  ) {

    closeModalBtn.addEventListener(
      "click",
      () => {

        closeLoginModal();

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


        // Check login
        if (
          username === ADMIN_USER &&
          password === ADMIN_PASS
        ) {

          currentRole = "admin";


          localStorage.setItem(
            "userRole",
            "admin"
          );


          // Close modal
          closeLoginModal();


          // Reset form
          loginForm.reset();


          // Hide error
          if (loginError) {

            loginError.style.display =
              "none";

          }


          // Update UI
          updateRoleUI();


          // Render materials
          renderMaterials(
            materialsList
          );


          showMessage(
            "ចូល Admin បានជោគជ័យ!",
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
// 9. OPEN LOGIN MODAL
// =========================================================

function openLoginModal() {

  const modal =
    document.getElementById(
      "login-modal"
    );

  const error =
    document.getElementById(
      "login-error"
    );


  if (modal) {

    modal.style.display = "flex";

  }


  if (error) {

    error.style.display = "none";

  }

}


// =========================================================
// 10. CLOSE LOGIN MODAL
// =========================================================

function closeLoginModal() {

  const modal =
    document.getElementById(
      "login-modal"
    );


  if (modal) {

    modal.style.display = "none";

  }

}


// =========================================================
// 11. MODAL OUTSIDE CLICK
// =========================================================

function setupModalOutsideClick() {

  const modal =
    document.getElementById(
      "login-modal"
    );


  if (!modal) return;


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeLoginModal();

      }

    }
  );

}


// =========================================================
// 12. LOGOUT ADMIN
// =========================================================

function logoutAdmin() {

  currentRole = "user";


  localStorage.setItem(
    "userRole",
    "user"
  );


  updateRoleUI();


  renderMaterials(
    materialsList
  );


  showMessage(
    "បាន Logout រួចរាល់!",
    "success"
  );

}


// =========================================================
// 13. UPDATE ROLE UI
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


  const adminOnlyElements =
    document.querySelectorAll(
      ".admin-only"
    );


  // -----------------------------------------
  // ADMIN
  // -----------------------------------------

  if (currentRole === "admin") {

    if (roleBadge) {

      roleBadge.textContent =
        "ADMIN";

      roleBadge.style.background =
        "rgba(16, 185, 129, 0.2)";

      roleBadge.style.color =
        "#10b981";

    }


    if (authBtn) {

      authBtn.textContent =
        "🚪 Logout";

    }


    if (uploadPanel) {

      uploadPanel.style.display =
        "block";

    }


    adminOnlyElements.forEach(
      element => {

        element.style.display =
          "";

      }
    );

  }


  // -----------------------------------------
  // USER
  // -----------------------------------------

  else {

    if (roleBadge) {

      roleBadge.textContent =
        "USER";

      roleBadge.style.background =
        "rgba(148, 163, 184, 0.2)";

      roleBadge.style.color =
        "#94a3b8";

    }


    if (authBtn) {

      authBtn.textContent =
        "🔑 Login Admin";

    }


    if (uploadPanel) {

      uploadPanel.style.display =
        "none";

    }


    adminOnlyElements.forEach(
      element => {

        element.style.display =
          "none";

      }
    );

  }

}


// =========================================================
// 14. FETCH SCHEDULE
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


  // Loading
  if (tbody) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5"
          style="text-align:center;">
          កំពុងភ្ជាប់ទៅកាន់ Google Sheets...
        </td>
      </tr>
    `;

  }


  try {

    const response =
      await fetch(
        `${GOOGLE_SHEET_API_URL}?action=getSchedule`
      );


    if (!response.ok) {

      throw new Error(
        `HTTP Error: ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "Schedule:",
      data
    );


    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      data.error
    ) {

      if (tbody) {

        tbody.innerHTML = `
          <tr>
            <td colspan="5"
              style="text-align:center;">
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


    scheduleList = data;


    if (tbody) {

      tbody.innerHTML = "";

    }


    data.forEach(
      item => {

        const tr =
          document.createElement(
            "tr"
          );


        // Highlight today
        if (
          item.day &&
          String(item.day)
            .trim() ===
            todayKhmer
        ) {

          tr.classList.add(
            "today-highlight"
          );

        }


        tr.innerHTML = `

          <td>
            <strong>
              ${escapeHTML(
                item.day || ""
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              item.time || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              item.subject || ""
            )}
          </td>

          <td>
            <span class="room-badge">
              ${escapeHTML(
                item.room || ""
              )}
            </span>
          </td>

          <td>
            ${escapeHTML(
              item.instructor || ""
            )}
          </td>

        `;


        tbody.appendChild(tr);

      }
    );


    if (totalSubj) {

      totalSubj.textContent =
        data.length;

    }


  } catch (error) {

    console.error(
      "Schedule error:",
      error
    );


    if (tbody) {

      tbody.innerHTML = `
        <tr>
          <td colspan="5"
            style="text-align:center;color:#f87171;">
            មិនអាចភ្ជាប់ទៅ Google Sheets បានទេ!
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
// 15. FETCH STUDENTS
// =========================================================

async function fetchStudents() {

  const tbody =
    document.getElementById(
      "student-body"
    );


  const totalStudentsEl =
    document.getElementById(
      "total-students"
    );


  // Loading
  if (tbody) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6"
          style="text-align:center;">
          កំពុងទាញយកទិន្នន័យសិស្សពី Google Sheets...
        </td>
      </tr>
    `;

  }


  try {

    const response =
      await fetch(
        `${GOOGLE_SHEET_API_URL}?action=getStudents`
      );


    if (!response.ok) {

      throw new Error(
        `HTTP Error: ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "Students:",
      data
    );


    if (
      data?.error ||
      !Array.isArray(data)
    ) {

      if (tbody) {

        tbody.innerHTML = `
          <tr>
            <td colspan="6"
              style="text-align:center;color:#f87171;">
              មិនអាចទាញយកទិន្នន័យសិស្សបាន!
            </td>
          </tr>
        `;

      }


      return;

    }


    studentList =
      data;


    renderStudents(
      studentList
    );


    if (totalStudentsEl) {

      totalStudentsEl.textContent =
        studentList.length;

    }


  } catch (error) {

    console.error(
      "Students error:",
      error
    );


    if (tbody) {

      tbody.innerHTML = `
        <tr>
          <td colspan="6"
            style="text-align:center;color:#f87171;">
            មិនអាចទាញយកទិន្នន័យសិស្សបានឡើយ!
          </td>
        </tr>
      `;

    }


    if (totalStudentsEl) {

      totalStudentsEl.textContent =
        "0";

    }

  }

}


// =========================================================
// 16. RENDER STUDENTS
// =========================================================

function renderStudents(data) {

  const tbody =
    document.getElementById(
      "student-body"
    );


  if (!tbody) return;


  tbody.innerHTML = "";


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6"
          style="text-align:center;color:var(--text-muted);">
          រកមិនឃើញទិន្នន័យដែលស្វែងរកឡើយ
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
        String(
          student.gender || ""
        ).trim();


      const genderClass =
        gender === "ស្រី"
          ? "female"
          : "male";


      tr.innerHTML = `

        <td>
          ${escapeHTML(
            student.id ||
            index + 1
          )}
        </td>

        <td>
          <strong
            style="color:var(--accent-cyan);">
            ${escapeHTML(
              student.student_id || ""
            )}
          </strong>
        </td>

        <td>
          ${escapeHTML(
            student.name_kh || ""
          )}
        </td>

        <td>
          ${escapeHTML(
            student.name_en || ""
          )}
        </td>

        <td>
          <span
            class="gender-badge ${genderClass}">
            ${escapeHTML(
              gender
            )}
          </span>
        </td>

        <td>
          ${escapeHTML(
            student.dob || ""
          )}
        </td>

      `;


      tbody.appendChild(tr);

    }
  );

}


// =========================================================
// 17. STUDENT SEARCH
// =========================================================

function setupSearch() {

  const input =
    document.getElementById(
      "student-search"
    );


  if (!input) return;


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

            const nameKh =
              String(
                student.name_kh || ""
              ).toLowerCase();


            const nameEn =
              String(
                student.name_en || ""
              ).toLowerCase();


            const studentId =
              String(
                student.student_id || ""
              ).toLowerCase();


            return (
              nameKh.includes(query) ||
              nameEn.includes(query) ||
              studentId.includes(query)
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
// 18. RENDER MATERIALS
// =========================================================

function renderMaterials(data) {

  const container =
    document.getElementById(
      "materials-list"
    );


  if (!container) return;


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
          padding:20px;
        ">
        មិនទាន់មានឯកសារមេរៀនឡើយ...
      </p>
    `;


    return;

  }


  container.innerHTML =
    data.map(
      material => {

        const deleteButton =
          currentRole === "admin"
            ? `
              <button
                onclick="deleteMaterial(${material.id})"
                class="btn-delete-mat"
                title="លុបមេរៀន">
                🗑️
              </button>
            `
            : "";


        return `

          <div class="material-card">

            <div class="material-meta">

              <span class="badge-subject">
                ${escapeHTML(
                  material.subject || ""
                )}
              </span>

              <span class="badge-type">
                ${escapeHTML(
                  material.type || ""
                )}
              </span>

            </div>


            <div class="material-title">

              ${escapeHTML(
                material.title || ""
              )}

            </div>


            <div
              style="
                display:flex;
                gap:8px;
                margin-top:12px;
              ">

              <a
                href="${safeURL(material.url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-download"
                style="flex:1;">

                📥 ទាញយកឯកសារ

              </a>

              ${deleteButton}

            </div>

          </div>

        `;

      }
    ).join("");

}


// =========================================================
// 19. ADD MATERIAL
// =========================================================

function setupMaterialsForm() {

  const form =
    document.getElementById(
      "upload-form"
    );


  if (!form) return;


  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      // Check admin
      if (
        currentRole !== "admin"
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


      // Validation
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


      // Validate URL
      if (
        !isValidURL(url)
      ) {

        alert(
          "សូមបញ្ចូល URL ត្រឹមត្រូវ!"
        );


        return;

      }


      const newMaterial = {

        id: Date.now(),

        title: title,

        subject: subject,

        type: type,

        url: url

      };


      materialsList.unshift(
        newMaterial
      );


      // Save LocalStorage
      localStorage.setItem(
        "materialsData",
        JSON.stringify(
          materialsList
        )
      );


      // Render
      renderMaterials(
        materialsList
      );


      // Reset form
      form.reset();


      showMessage(
        "បានបន្ថែមមេរៀនដោយជោគជ័យ!",
        "success"
      );

    }
  );

}


// =========================================================
// 20. DELETE MATERIAL
// =========================================================

function deleteMaterial(id) {

  if (
    currentRole !== "admin"
  ) {

    alert(
      "មានតែ Admin ប៉ុណ្ណោះដែលអាចលុបមេរៀនបាន!"
    );


    return;

  }


  const confirmed =
    confirm(
      "តើអ្នកពិតជាចង់លុបឯកសារមេរៀននេះមែនទេ?"
    );


  if (!confirmed) return;


  materialsList =
    materialsList.filter(
      material =>
        material.id !== id
    );


  localStorage.setItem(
    "materialsData",
    JSON.stringify(
      materialsList
    )
  );


  renderMaterials(
    materialsList
  );


  showMessage(
    "បានលុបមេរៀនរួចរាល់!",
    "success"
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


  if (!input) return;


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

            const title =
              String(
                material.title || ""
              ).toLowerCase();


            const subject =
              String(
                material.subject || ""
              ).toLowerCase();


            const type =
              String(
                material.type || ""
              ).toLowerCase();


            return (
              title.includes(query) ||
              subject.includes(query) ||
              type.includes(query)
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
// 22. REFRESH DATA
// =========================================================
// You can call these from browser console if needed:
//
// refreshAllData();

function refreshAllData() {

  fetchSchedule();

  fetchStudents();

}


// =========================================================
// 23. ESCAPE HTML
// =========================================================
// Prevent HTML injection from Google Sheets data.

function escapeHTML(value) {

  return String(value ?? "")
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
// 24. SAFE URL
// =========================================================

function safeURL(url) {

  try {

    const parsed =
      new URL(url);


    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {

      return parsed.href;

    }


    return "#";

  } catch {

    return "#";

  }

}


// =========================================================
// 25. URL VALIDATION
// =========================================================

function isValidURL(url) {

  try {

    const parsed =
      new URL(url);


    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );

  } catch {

    return false;

  }

}


// =========================================================
// 26. SIMPLE MESSAGE
// =========================================================

function showMessage(
  message,
  type = "success"
) {

  // Remove old message
  const oldMessage =
    document.querySelector(
      ".app-message"
    );


  if (oldMessage) {

    oldMessage.remove();

  }


  const messageBox =
    document.createElement(
      "div"
    );


  messageBox.className =
    "app-message";


  messageBox.textContent =
    message;


  // Basic style
  messageBox.style.position =
    "fixed";

  messageBox.style.top =
    "20px";

  messageBox.style.right =
    "20px";

  messageBox.style.zIndex =
    "99999";

  messageBox.style.padding =
    "12px 18px";

  messageBox.style.borderRadius =
    "10px";

  messageBox.style.fontWeight =
    "600";

  messageBox.style.boxShadow =
    "0 10px 30px rgba(0,0,0,0.25)";


  if (
    type === "success"
  ) {

    messageBox.style.background =
      "#10b981";

    messageBox.style.color =
      "#ffffff";

  } else {

    messageBox.style.background =
      "#ef4444";

    messageBox.style.color =
      "#ffffff";

  }


  document.body.appendChild(
    messageBox
  );


  setTimeout(
    () => {

      messageBox.remove();

    },
    2500
  );

}


// =========================================================
// 27. GLOBAL FUNCTIONS
// =========================================================
// Required because HTML uses onclick="deleteMaterial(...)"

window.deleteMaterial =
  deleteMaterial;

window.refreshAllData =
  refreshAllData;


// =========================================================
// END OF SCRIPT
// =========================================================
