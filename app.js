const API_URL = "/api/proxy";

const state = {
  currentUser: null,
  allLessons: [],
  currentFilter: "ALL",
};

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
  studentList: document.getElementById("studentList"), // [ADDED] Reference ទៅកាន់ studentList
  addLessonForm: document.getElementById("addLessonForm"),
  addLessonBtn: document.getElementById("addLessonBtn"),
};

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
      console.error("Failed to parse stored session:", e);
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

function refreshIcons() {
  requestAnimationFrame(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  });
}

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

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
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
  fetchStudents(); // [ADDED] ហៅទាញយកទិន្នន័យបញ្ជីឈ្មោះនិស្សិត
  refreshIcons();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

async function fetchSchedules() {
  if (!elements.scheduleList) return;

  try {
    const res = await fetch(`${API_URL}?action=getSchedules`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      elements.scheduleList.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
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
      tr.className = "hover:bg-slate-800/50 transition duration-150 border-b border-slate-800/60";
      tr.innerHTML = `
        <td class="py-4 px-6 font-bold text-indigo-400 flex items-center gap-2">
          <i data-lucide="calendar-days" class="w-4 h-4 text-indigo-400"></i>
          ${escapeHTML(item.day || '')}
        </td>
        <td class="py-4 px-4 text-slate-300 font-semibold">${escapeHTML(item.time || '')}</td>
        <td class="py-4 px-4 font-bold text-white">${escapeHTML(item.subject || '')}</td>
        <td class="py-4 px-4">
          <span class="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-[11px] font-bold">
            ${escapeHTML(item.room || '')}
          </span>
        </td>
        <td class="py-4 px-6 text-right text-slate-400 font-medium">${escapeHTML(item.teacher || '')}</td>
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

async function fetchLessons() {
  try {
    const res = await fetch(`${API_URL}?action=getLessons`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();

    state.allLessons = Array.isArray(data) ? data : [];
    if (elements.statTotalLessons) elements.statTotalLessons.innerText = state.allLessons.length;
    renderLessonsByFilter();
  } catch (err) {
    console.error("Lesson Fetch Error:", err);
  }
}

// [ADDED] មុខងារទាញយកបញ្ជីឈ្មោះនិស្សិតពី Google Sheet / Backend Proxy
async function fetchStudents() {
  const studentContainer = elements.studentList || document.getElementById("studentList");
  if (!studentContainer) return;

  try {
    const res = await fetch(`${API_URL}?action=getStudents`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      studentContainer.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 text-center text-slate-400 font-medium">
            មិនទាន់មានទិន្នន័យនិស្សិតនៅឡើយទេ។
          </td>
        </tr>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach((student, index) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-800/40 transition duration-150 border-b border-slate-800/40";
      tr.innerHTML = `
        <td class="py-3 px-4 text-slate-500 font-mono text-xs">${index + 1}</td>
        <td class="py-3 px-4 font-mono font-bold text-indigo-400">${escapeHTML(student.student_id || '')}</td>
        <td class="py-3 px-4 font-semibold text-white">${escapeHTML(student.khmer_name || '')}</td>
        <td class="py-3 px-4 text-slate-300 uppercase text-xs font-medium tracking-wide">${escapeHTML(student.latin_name || '')}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold ${student.gender === 'ស្រី' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">
            ${escapeHTML(student.gender || '')}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-400 text-xs font-mono">${escapeHTML(student.dob || '')}</td>
      `;
      fragment.appendChild(tr);
    });

    studentContainer.replaceChildren(fragment);
  } catch (err) {
    console.error("Error fetching students:", err);
    studentContainer.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-rose-400 font-medium">
          មិនអាចទាញយកទិន្នន័យនិស្សិតបានទេ។
        </td>
      </tr>`;
  }
}

function filterLessons(subject, targetBtn = null) {
  state.currentFilter = subject;

  document.querySelectorAll('.subject-filter-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-indigo-600/30');
    btn.classList.add('bg-slate-800', 'text-slate-300', 'hover:bg-slate-700');
  });

  if (targetBtn) {
    targetBtn.classList.remove('bg-slate-800', 'text-slate-300', 'hover:bg-slate-700');
    targetBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-indigo-600/30');
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
      <div class='text-slate-400 text-xs text-center py-8 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800'>
        មិនទាន់មានមេរៀនសម្រាប់មុខវិជ្ជានេះនៅឡើយទេ។
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  const isAdmin = state.currentUser?.role === "admin";

  filtered.forEach(item => {
    const previewUrl = getMobilePreviewLink(item.file_url);
    const card = document.createElement("div");
    card.className = "p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4";

    card.innerHTML = `
      <div class="space-y-1">
        <span class="inline-block bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
          ${escapeHTML(item.class_code || 'G1-NW-B')}
        </span>
        <h3 class="font-bold text-sm text-white mt-1">${escapeHTML(item.title || '')}</h3>
        <p class="text-xs text-slate-400 line-clamp-2">${escapeHTML(item.description || "គ្មានការពិពណ៌នា")}</p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <a href="${escapeHTML(previewUrl)}" target="_blank" rel="noopener noreferrer" class="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 whitespace-nowrap">
          <i data-lucide="eye" class="w-4 h-4"></i>
          <span>មើល / Download File</span>
        </a>
        ${isAdmin ? `
          <button data-id="${escapeHTML(item.lesson_id)}" class="btn-edit-lesson p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl transition active:scale-[0.98]" title="កែប្រែមេរៀន">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button data-id="${escapeHTML(item.lesson_id)}" class="btn-delete-lesson p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition active:scale-[0.98]" title="លុបមេរៀន">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        ` : ''}
      </div>
    `;

    if (isAdmin) {
      const editBtn = card.querySelector('.btn-edit-lesson');
      editBtn?.addEventListener('click', () => editLesson(item));

      const deleteBtn = card.querySelector('.btn-delete-lesson');
      deleteBtn?.addEventListener('click', () => deleteLesson(item.lesson_id));
    }

    fragment.appendChild(card);
  });

  elements.lessonList.replaceChildren(fragment);
  refreshIcons();
}

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

async function editLesson(item) {
  const newTitle = prompt("បញ្ចូលចំណងជើងថ្មី៖", item.title);
  if (newTitle === null) return;

  const newDesc = prompt("បញ្ចូលការពិពណ៌នាថ្មី៖", item.description || "");
  if (newDesc === null) return;

  if (!newTitle.trim()) {
    alert("ចំណងជើងមិនអាចទទេបានទេ!");
    return;
  }

  try {
    const payload = {
      action: "editLesson",
      lesson_id: item.lesson_id,
      title: newTitle.trim(),
      description: newDesc.trim()
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data?.status === "success" || data === true) {
      alert("ធ្វើបច្ចុប្បន្នភាពមេរៀនជោគជ័យ!");
      fetchLessons();
    } else {
      alert(data?.message || "មានបញ្ហាក្នុងការកែប្រែមេរៀន!");
    }
  } catch (err) {
    console.error("Edit Lesson Error:", err);
    alert("មានបញ្ហាក្នុងការកែប្រែមេរៀន!");
  }
}

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
