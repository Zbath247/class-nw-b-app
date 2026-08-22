const API_URL = "/api/proxy";

const state = {
  currentUser: null,
  allLessons: [],
  currentFilter: "ALL",
};

// UI Element Cache
const elements = {
  loginSection: document.getElementById("loginSection"),
  dashboardSection: document.getElementById("dashboardSection"),
  loginForm: document.getElementById("loginForm"),
  loginBtn: document.getElementById("loginBtn"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  userName: document.getElementById("userName"),
  userRole: document.getElementById("userRole"),
  adminPanel: document.getElementById("adminPanel"),
  scheduleList: document.getElementById("scheduleList"),
  statTotalClasses: document.getElementById("statTotalClasses"),
  statTotalSessions: document.getElementById("statTotalSessions"),
  statTotalLessons: document.getElementById("statTotalLessons"),
  lessonList: document.getElementById("lessonList"),
  addLessonForm: document.getElementById("addLessonForm"),
  addLessonBtn: document.getElementById("addLessonBtn"),
};

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  initApp();
  setupEventListeners();
});

function initApp() {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
      showDashboard();
    } catch (e) {
      console.error("Failed to parse local session:", e);
      localStorage.removeItem("user");
    }
  }
}

function setupEventListeners() {
  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", handleLogin);
  }
  if (elements.addLessonForm) {
    elements.addLessonForm.addEventListener("submit", handleAddLesson);
  }
}

// Icon Refresh Utility
function refreshIcons() {
  requestAnimationFrame(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  });
}

// Authentication Handler
async function handleLogin(e) {
  e.preventDefault();

  const email = elements.loginEmail?.value.trim() || "";
  const password = elements.loginPassword?.value.trim() || "";

  if (!email || !password) {
    alert("សូមបញ្ចូលអ៊ីម៉ែល និងពាក្យសម្ងាត់!");
    return;
  }

  setButtonLoading(elements.loginBtn, true, "កំពុងផ្ទៀងផ្ទាត់...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data?.status === "success") {
      state.currentUser = data.user;
      localStorage.setItem("user", JSON.stringify(state.currentUser));
      showDashboard();
    } else {
      alert(data?.message || "អ៊ីម៉ែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!");
    }
  } catch (err) {
    console.error("Login Error:", err);
    alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!");
  } finally {
    setButtonLoading(elements.loginBtn, false, "ចូលប្រព័ន្ធ", "arrow-right");
  }
}

function showDashboard() {
  elements.loginSection?.classList.add("hidden");
  elements.dashboardSection?.classList.remove("hidden");

  if (state.currentUser) {
    if (elements.userName) elements.userName.innerText = state.currentUser.name || "អ្នកប្រើប្រាស់";
    if (elements.userRole) elements.userRole.innerText = state.currentUser.role || "សិស្ស";

    if (elements.adminPanel) {
      elements.adminPanel.classList.toggle("hidden", state.currentUser.role !== "admin");
    }
  }

  fetchSchedules();
  fetchLessons();
  refreshIcons();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// Fetch Schedules & Dashboard Metrics
async function fetchSchedules() {
  if (!elements.scheduleList) return;

  try {
    const res = await fetch(`${API_URL}?action=getSchedules`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      elements.scheduleList.innerHTML = `
        <tr>
          <td colspan="5" class="p-8 text-center text-slate-400 font-medium">
            មិនទាន់មានកាលវិភាគនៅឡើយទេ។
          </td>
        </tr>`;
      updateScheduleStats(0, 0);
      return;
    }

    const uniqueSubjects = new Set(data.map(item => item.subject?.trim())).size;
    updateScheduleStats(uniqueSubjects, data.length);

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-indigo-50/30 transition border-b border-slate-100/80";
      tr.innerHTML = `
        <td class="p-3.5 pl-5 font-bold text-indigo-600 flex items-center gap-1.5">
          <i data-lucide="calendar-days" class="w-4 h-4 text-indigo-400"></i>
          ${escapeHTML(item.day || '')}
        </td>
        <td class="p-3.5 text-slate-600 font-medium">${escapeHTML(item.time || '')}</td>
        <td class="p-3.5 font-semibold text-slate-800">${escapeHTML(item.subject || '')}</td>
        <td class="p-3.5">
          <span class="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
            ${escapeHTML(item.room || '')}
          </span>
        </td>
        <td class="p-3.5 pr-5 text-slate-600 font-medium">${escapeHTML(item.teacher || '')}</td>
      `;
      fragment.appendChild(tr);
    });

    elements.scheduleList.replaceChildren(fragment);
    refreshIcons();
  } catch (err) {
    console.error("Schedule Fetch Error:", err);
  }
}

function updateScheduleStats(totalClasses, totalSessions) {
  if (elements.statTotalClasses) elements.statTotalClasses.innerText = totalClasses;
  if (elements.statTotalSessions) elements.statTotalSessions.innerText = `${totalSessions} Sessions`;
}

// Fetch & Render Lessons
async function fetchLessons() {
  try {
    const res = await fetch(`${API_URL}?action=getLessons`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    state.allLessons = Array.isArray(data) ? data : [];
    if (elements.statTotalLessons) elements.statTotalLessons.innerText = state.allLessons.length;
    renderLessonsByFilter();
  } catch (err) {
    console.error("Lesson Fetch Error:", err);
  }
}

function filterLessons(subject, targetBtn = null) {
  state.currentFilter = subject;

  document.querySelectorAll('.subject-filter-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white');
    btn.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
  });

  if (targetBtn) {
    targetBtn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
    targetBtn.classList.add('bg-indigo-600', 'text-white');
  }

  renderLessonsByFilter();
}

function renderLessonsByFilter() {
  if (!elements.lessonList) return;

  const filtered = state.currentFilter === "ALL" 
    ? state.allLessons 
    : state.allLessons.filter(item => item.title?.toUpperCase().includes(state.currentFilter.toUpperCase()));

  if (filtered.length === 0) {
    elements.lessonList.innerHTML = `
      <p class='text-slate-400 text-xs text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200'>
        មិនទាន់មានមេរៀនសម្រាប់មុខវិជ្ជានេះនៅឡើយទេ។
      </p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  const isAdmin = state.currentUser?.role === "admin";

  filtered.forEach(item => {
    const previewUrl = getMobilePreviewLink(item.file_url);
    const card = document.createElement("div");
    card.className = "p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4";

    card.innerHTML = `
      <div class="space-y-1">
        <span class="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          ${escapeHTML(item.class_code || 'G1-NW-B')}
        </span>
        <h3 class="font-bold text-sm text-slate-800 mt-1">${escapeHTML(item.title || '')}</h3>
        <p class="text-xs text-slate-500 line-clamp-2">${escapeHTML(item.description || "គ្មានការពិពណ៌នា")}</p>
      </div>
      <div class="flex items-center gap-2 w-full md:w-auto">
        <a href="${escapeHTML(previewUrl)}" target="_blank" rel="noopener noreferrer" class="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20 whitespace-nowrap">
          <i data-lucide="eye" class="w-4 h-4"></i>
          <span>មើល / Download File</span>
        </a>
        ${isAdmin ? `
          <button data-id="${escapeHTML(item.lesson_id)}" class="btn-delete-lesson p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition" title="លុបមេរៀន">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        ` : ''}
      </div>
    `;

    if (isAdmin) {
      const deleteBtn = card.querySelector('.btn-delete-lesson');
      deleteBtn?.addEventListener('click', () => deleteLesson(item.lesson_id));
    }

    fragment.appendChild(card);
  });

  elements.lessonList.replaceChildren(fragment);
  refreshIcons();
}

// Add Lesson Handler
async function handleAddLesson(e) {
  e.preventDefault();

  const fileInput = document.getElementById("lessonFileInput");
  if (!fileInput?.files?.[0]) {
    alert("សូមជ្រើសរើស File ឯកសារជាមុនសិន!");
    return;
  }

  const file = fileInput.files[0];
  setButtonLoading(elements.addLessonBtn, true, "កំពុង Upload និង រក្សាទុក...");

  try {
    const base64File = await fileToBase64(file);
    const lessonId = `LES-${Date.now()}`;
    const subjectPrefix = document.getElementById("lessonSubject")?.value || "";
    const rawTitle = document.getElementById("lessonTitle")?.value.trim() || "";
    
    const payload = {
      action: "addLesson",
      lesson_id: lessonId,
      title: subjectPrefix ? `${subjectPrefix} - ${rawTitle}` : rawTitle,
      description: document.getElementById("lessonDesc")?.value.trim() || "",
      class_code: document.getElementById("classCode")?.value.trim() || "",
      file_name: file.name,
      mime_type: file.type,
      file_data: base64File
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data?.status === "success") {
      alert("បញ្ចូល និង Upload មេរៀនជោគជ័យ!");
      elements.addLessonForm.reset();
      fetchLessons();
    } else {
      alert(data?.message || "មានបញ្ហាក្នុងការបញ្ចូលមេរៀន!");
    }
  } catch (err) {
    console.error("Upload Lesson Error:", err);
    alert("មានបញ្ហាក្នុងការ Upload មេរៀន!");
  } finally {
    setButtonLoading(elements.addLessonBtn, false, "រក្សាទុកមេរៀន", "save");
  }
}

// Delete Lesson Handler
async function deleteLesson(lessonId) {
  if (!lessonId || !confirm("តើអ្នកប្រាកដជាចង់លុបមេរៀននេះមែនទេ?")) return;

  try {
    const res = await fetch(`${API_URL}?action=deleteLesson&lesson_id=${encodeURIComponent(lessonId)}`);
    const data = await res.json();

    if (data?.status === "success" || data === true) {
      alert("លុបមេរៀនជោគជ័យ!");
      fetchLessons();
    } else {
      alert(data?.message || "មានបញ្ហាក្នុងការលុបមេរៀន!");
    }
  } catch (err) {
    console.error("Delete Lesson Error:", err);
    alert("មានបញ្ហាក្នុងការលុបមេរៀន!");
  }
}

// Helper Utilities
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

function getMobilePreviewLink(url) {
  if (!url) return '#';
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/file/d/${match[0]}/preview` : url;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setButtonLoading(btn, isLoading, text, iconName = "loader-2") {
  if (!btn) return;
  btn.disabled = isLoading;
  if (isLoading) {
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>${text}</span>`;
  } else {
    btn.innerHTML = `<span>${text}</span>${iconName ? `<i data-lucide="${iconName}" class="w-4 h-4"></i>` : ''}`;
  }
  refreshIcons();
}
