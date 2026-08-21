// Google Sheets Web App Endpoint ថ្មី
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwzKJ8fwImxRdKwSz8QJAgnD5ek-CgeV2is10aZY2l7KeI2ChydmwXA4NkupSQrj0mj/exec";

// ==========================================
// 1. AUTHENTICATION & ROLE CONFIGURATION
// ==========================================
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// ទាញយក Role ពី LocalStorage (Default គឺ 'user')
let currentRole = localStorage.getItem("userRole") || "user";

// អថេរសម្រាប់រក្សាទុកទិន្នន័យសិស្ស
let studentList = [];

// ទិន្នន័យគំរូដើមដំបូងសម្រាប់ Materials
let materialsList = JSON.parse(localStorage.getItem("materialsData")) || [
  { id: 1, title: "Lab 01: OSPF Multi-Area Setup", subject: "CS IV", type: "LAB", url: "https://drive.google.com" },
  { id: 2, title: "Database Administration II Slide", subject: "DA II", type: "SLIDE", url: "https://drive.google.com" }
];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  fetchSchedule();
  fetchStudents();
  setupSearch();
  
  // ដំណើរការប្រព័ន្ធ Auth & Permissions
  setupAuthEvents();
  updateRoleUI();

  // ដំណើរការផ្នែក Materials
  renderMaterials(materialsList);
  setupMaterialsForm();
  setupMaterialsSearch();
});

function setupNavigation() {
  const links = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page-content');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const target = link.id.replace('menu-', 'section-');
      document.getElementById(target).classList.add('active');
    });
  });
}

/* =========================================================
   2. AUTHENTICATION LOGIC (ADMIN vs USER)
   ========================================================= */
function setupAuthEvents() {
  const authBtn = document.getElementById("auth-btn");
  const loginModal = document.getElementById("login-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");

  if (authBtn) {
    authBtn.addEventListener("click", () => {
      if (currentRole === "admin") {
        // Logout Action
        currentRole = "user";
        localStorage.setItem("userRole", "user");
        updateRoleUI();
        renderMaterials(materialsList);
      } else {
        // Open Login Modal
        if (loginModal) {
          loginModal.style.display = "flex";
          if (loginError) loginError.style.display = "none";
        }
      }
    });
  }

  if (closeModalBtn && loginModal) {
    closeModalBtn.addEventListener("click", () => {
      loginModal.style.display = "none";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("login-user").value;
      const p = document.getElementById("login-pass").value;

      if (u === ADMIN_USER && p === ADMIN_PASS) {
        currentRole = "admin";
        localStorage.setItem("userRole", "admin");
        if (loginModal) loginModal.style.display = "none";
        loginForm.reset();
        updateRoleUI();
        renderMaterials(materialsList);
      } else {
        if (loginError) loginError.style.display = "block";
      }
    });
  }
}

function updateRoleUI() {
  const roleBadge = document.getElementById("role-badge");
  const authBtn = document.getElementById("auth-btn");
  const uploadPanel = document.getElementById("upload-panel");
  const adminOnlyElements = document.querySelectorAll(".admin-only");

  if (currentRole === "admin") {
    if (roleBadge) {
      roleBadge.textContent = "ADMIN";
      roleBadge.style.background = "rgba(16, 185, 129, 0.2)";
      roleBadge.style.color = "#10b981";
    }
    if (authBtn) authBtn.textContent = "🚪 Logout";
    
    // បង្ហាញ Panel សម្រាប់ Admin
    if (uploadPanel) uploadPanel.style.display = "block";
    adminOnlyElements.forEach(el => el.style.display = "block");
  } else {
    if (roleBadge) {
      roleBadge.textContent = "USER";
      roleBadge.style.background = "rgba(148, 163, 184, 0.2)";
      roleBadge.style.color = "#94a3b8";
    }
    if (authBtn) authBtn.textContent = "🔑 Login Admin";
    
    // លាក់ Panel សម្រាប់ User ធម្មតា
    if (uploadPanel) uploadPanel.style.display = "none";
    adminOnlyElements.forEach(el => el.style.display = "none");
  }
}

/* =========================================================
   3. FETCH SCHEDULE DATA FROM GOOGLE SHEETS
   ========================================================= */
function fetchSchedule() {
  const tbody = document.getElementById("schedule-body");
  const totalSubj = document.getElementById("total-subjects");

  const daysMap = { 0: "អាទិត្យ", 1: "ច័ន្ទ", 2: "អង្គារ", 3: "ពុធ", 4: "ព្រហស្បតិ៍", 5: "សុក្រ", 6: "សៅរ៍" };
  const todayKhmer = daysMap[new Date().getDay()];

  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">កំពុងភ្ជាប់ទៅកាន់ប្រព័ន្ធ Google Sheets...</td></tr>`;
  }

  fetch(`${GOOGLE_SHEET_API_URL}?action=getSchedule`, { redirect: "follow" })
    .then(res => res.json())
    .then(data => {
      if (!tbody) return;
      tbody.innerHTML = "";
      if (!data || data.length === 0 || data.error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">ពុំមានទិន្នន័យកាលវិភាគឡើយ</td></tr>`;
        if (totalSubj) totalSubj.textContent = "0";
        return;
      }

      data.forEach(item => {
        const tr = document.createElement("tr");
        if (item.day && item.day.trim() === todayKhmer) {
          tr.classList.add("today-highlight");
        }

        tr.innerHTML = `
          <td><strong>${item.day || ''}</strong></td>
          <td>${item.time || ''}</td>
          <td>${item.subject || ''}</td>
          <td><span class="room-badge">${item.room || ''}</span></td>
          <td>${item.instructor || ''}</td>
        `;
        tbody.appendChild(tr);
      });

      if (totalSubj) totalSubj.textContent = data.length;
    })
    .catch(err => {
      console.error(err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#f87171;">ការភ្ជាប់បានបរាជ័យ!</td></tr>`;
      }
    });
}

/* =========================================================
   4. FETCH STUDENTS DATA FROM GOOGLE SHEETS
   ========================================================= */
function fetchStudents() {
  const tbody = document.getElementById("student-body");
  const totalStudentsEl = document.getElementById("total-students");

  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">កំពុងទាញយកទិន្នន័យសិស្សពី Google Sheets...</td></tr>`;
  }

  fetch(`${GOOGLE_SHEET_API_URL}?action=getStudents`, { redirect: "follow" })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171;">មិនមាន Tab ឈ្មោះ "Students" ក្នុង Google Sheet ឡើយ!</td></tr>`;
        return;
      }

      studentList = data; // រក្សាទុកក្នុងអថេរសម្រាប់ Search
      renderStudents(studentList);
      
      if (totalStudentsEl) {
        totalStudentsEl.textContent = studentList.length;
      }
    })
    .catch(err => {
      console.error(err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#f87171;">មិនអាចទាញយកទិន្នន័យសិស្សបានឡើយ!</td></tr>`;
      }
    });
}

function renderStudents(data) {
  const tbody = document.getElementById("student-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">រកមិនឃើញទិន្នន័យដែលស្វែងរកឡើយ</td></tr>`;
    return;
  }

  data.forEach((s, index) => {
    const tr = document.createElement("tr");
    const genderClass = s.gender === "ស្រី" ? "female" : "male";

    tr.innerHTML = `
      <td>${s.id || (index + 1)}</td>
      <td><strong style="color: var(--accent-cyan);">${s.student_id || ''}</strong></td>
      <td>${s.name_kh || ''}</td>
      <td>${s.name_en || ''}</td>
      <td><span class="gender-badge ${genderClass}">${s.gender || ''}</span></td>
      <td>${s.dob || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setupSearch() {
  const input = document.getElementById("student-search");
  if (!input) return;
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = studentList.filter(s =>
      (s.name_kh && String(s.name_kh).toLowerCase().includes(query)) ||
      (s.name_en && String(s.name_en).toLowerCase().includes(query)) ||
      (s.student_id && String(s.student_id).toLowerCase().includes(query))
    );
    renderStudents(filtered);
  });
}

/* =========================================================
   5. MATERIALS FUNCTIONS (RENDER, ADD, DELETE & SEARCH)
   ========================================================= */
function renderMaterials(data) {
  const container = document.getElementById("materials-list");
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 20px;">មិនទាន់មានឯកសារមេរៀនឡើយ...</p>`;
    return;
  }

  container.innerHTML = data.map(m => `
    <div class="material-card">
      <div class="material-meta">
        <span class="badge-subject">${m.subject}</span>
        <span class="badge-type">${m.type}</span>
      </div>
      <div class="material-title">${m.title}</div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <a href="${m.url}" target="_blank" class="btn-download" style="flex: 1;">
          📥 ទាញយកឯកសារ
        </a>
        ${currentRole === "admin" ? `<button onclick="deleteMaterial(${m.id})" class="btn-delete-mat" title="លុបមេរៀន">🗑️</button>` : ""}
      </div>
    </div>
  `).join("");
}

// អនុគមន៍លុបមេរៀន (សម្រាប់តែ Admin)
function deleteMaterial(id) {
  if (currentRole !== "admin") return;
  
  if (confirm("តើអ្នកពិតជាចង់លុបឯកសារមេរៀននេះមែនទេ?")) {
    materialsList = materialsList.filter(m => m.id !== id);
    localStorage.setItem("materialsData", JSON.stringify(materialsList));
    renderMaterials(materialsList);
  }
}

function setupMaterialsForm() {
  const form = document.getElementById("upload-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // ពិនិត្យសិទ្ធិ
    if (currentRole !== "admin") {
      alert("មានតែ Admin ប៉ុណ្ណោះដែលអាចបន្ថែមមេរៀនបាន!");
      return;
    }

    const title = document.getElementById("doc-title").value;
    const subject = document.getElementById("doc-subject").value;
    const type = document.getElementById("doc-type").value;
    const url = document.getElementById("doc-url").value;

    const newMaterial = {
      id: Date.now(),
      title,
      subject,
      type,
      url
    };

    materialsList.unshift(newMaterial);
    localStorage.setItem("materialsData", JSON.stringify(materialsList));
    renderMaterials(materialsList);

    form.reset();
  });
}

function setupMaterialsSearch() {
  const input = document.getElementById("material-search");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = materialsList.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.type.toLowerCase().includes(query)
    );
    renderMaterials(filtered);
  });
}
