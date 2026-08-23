const API_URL = "/api/proxy";

let currentUser = null;
let allLessons = []; 
let currentFilter = "ALL"; 
let searchQuery = "";

// Check user status on load
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      showDashboard();
    } catch (e) {
      localStorage.removeItem("user");
    }
  }
});

// Helper for Lucide Icons
function refreshIcons() {
  setTimeout(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  }, 50);
}

// Login Handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const btn = document.getElementById("loginBtn");
    if (btn) {
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>កំពុងផ្ទៀងផ្ទាត់...</span>`;
      btn.disabled = true;
      refreshIcons();
    }

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const email = emailInput ? encodeURIComponent(emailInput.value.trim()) : "";
    const password = passwordInput ? encodeURIComponent(passwordInput.value.trim()) : "";

    fetch(`${API_URL}?action=login&email=${email}&password=${password}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.status === "success") {
          currentUser = data.user;
          localStorage.setItem("user", JSON.stringify(currentUser));
          showDashboard();
        } else {
          const errorMsg = (data && data.message) ? data.message : "អ៊ីម៉ែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!";
          alert(errorMsg);
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!");
      })
      .finally(() => {
        if (btn) {
          btn.innerHTML = `<span>ចូលប្រព័ន្ធ</span><i data-lucide="arrow-right" class="w-4 h-4"></i>`;
          btn.disabled = false;
          refreshIcons();
        }
      });
  });
}

function showDashboard() {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");

  if (loginSection) loginSection.classList.add("hidden");
  if (dashboardSection) dashboardSection.classList.remove("hidden");

  if (currentUser) {
    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");
    const adminPanel = document.getElementById("adminPanel");

    if (userName) userName.innerText = currentUser.name || "អ្នកប្រើប្រាស់";
    if (userRole) userRole.innerText = currentUser.role || "សិស្ស";

    if (adminPanel) {
      if (currentUser.role === "admin") {
        adminPanel.classList.remove("hidden");
      } else {
        adminPanel.classList.add("hidden");
      }
    }
  }

  fetchSchedules();
  fetchLessons();
  fetchStudents();
  refreshIcons();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// Fetch Schedules & Stats
function fetchSchedules() {
  fetch(`${API_URL}?action=getSchedules`)
    .then(res => res.json())
    .then(data => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        updateScheduleStats(0, 0);
        return;
      }
      const totalSessions = data.length;
      const uniqueSubjects = new Set(data.map(item => item.subject ? item.subject.trim() : '')).size;
      updateScheduleStats(uniqueSubjects, totalSessions);
    })
    .catch(err => console.error("Schedule Error:", err));
}

function updateScheduleStats(totalClasses, totalSessions) {
  const statClasses = document.getElementById("statTotalClasses");
  const statSessions = document.getElementById("statTotalSessions");
  if (statClasses) statClasses.innerText = totalClasses;
  if (statSessions) statSessions.innerText = totalSessions;
}

// Fetch Lessons
function fetchLessons() {
  const statLessons = document.getElementById("statTotalLessons");

  fetch(`${API_URL}?action=getLessons`)
    .then(res => res.json())
    .then(data => {
      allLessons = Array.isArray(data) ? data : [];
      if (statLessons) statLessons.innerText = allLessons.length;
      renderLessonsByFilter();
    })
    .catch(err => console.error("Lesson Error:", err));
}

// Filter Lessons by Category Tab
function filterLessons(subject) {
  currentFilter = subject;
  const buttons = document.querySelectorAll('.subject-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
    btn.classList.add('bg-slate-900', 'text-slate-400', 'border', 'border-slate-800');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-slate-900', 'text-slate-400', 'border', 'border-slate-800');
    event.currentTarget.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
  }

  renderLessonsByFilter();
}

// Instant Search Handler
function handleLessonSearch(query) {
  searchQuery = query.trim().toLowerCase();
  renderLessonsByFilter();
}

// Helper: Convert Google Drive Link to Preview Link
function getMobilePreviewLink(url) {
  if (!url) return '#';
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/file/d/${match[0]}/preview` : url;
}

// Open In-App Preview Modal
function openPreviewModal(url, title) {
  const modal = document.getElementById("previewModal");
  const iframe = document.getElementById("previewIframe");
  const modalTitle = document.getElementById("modalTitle");

  if (modal && iframe) {
    iframe.src = getMobilePreviewLink(url);
    if (modalTitle) modalTitle.innerHTML = `<i data-lucide="file-text" class="w-4 h-4 text-indigo-400"></i> ${title}`;
    modal.classList.remove("hidden");
    refreshIcons();
  }
}

function closePreviewModal() {
  const modal = document.getElementById("previewModal");
  const iframe = document.getElementById("previewIframe");
  if (modal && iframe) {
    iframe.src = "";
    modal.classList.add("hidden");
  }
}

// Render Filtered & Searched Lessons
function renderLessonsByFilter() {
  const lessonListDiv = document.getElementById("lessonList");
  if (!lessonListDiv) return;

  lessonListDiv.innerHTML = "";

  let filtered = allLessons;

  // Filter by Subject Category
  if (currentFilter !== "ALL") {
    filtered = filtered.filter(item => 
      item.title && item.title.toUpperCase().includes(currentFilter.toUpperCase())
    );
  }

  // Filter by Instant Search Query
  if (searchQuery !== "") {
    filtered = filtered.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchQuery)) ||
      (item.description && item.description.toLowerCase().includes(searchQuery))
    );
  }

  if (filtered.length === 0) {
    lessonListDiv.innerHTML = `<div class="col-span-full py-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">រកមិនឃើញមេរៀនដែលត្រូវស្វែងរកទេ</div>`;
    return;
  }

  filtered.forEach(item => {
    const isAdmin = currentUser && currentUser.role === "admin";
    const previewUrl = item.file_url || '#';

    lessonListDiv.innerHTML += `
      <div class="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition flex flex-col justify-between gap-4 shadow-sm">
        <div class="space-y-1.5">
          <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">${item.class_code || 'G1-NW-B'}</span>
          <h4 class="font-bold text-sm text-white mt-1">${item.title || ''}</h4>
          <p class="text-xs text-slate-400 line-clamp-2">${item.description || "គ្មានការពិពណ៌នា"}</p>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button onclick="openPreviewModal('${previewUrl}', '${escapeHtml(item.title || '')}')" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm shadow-indigo-600/20">
            <i data-lucide="eye" class="w-4 h-4"></i>
            <span>មើលមេរៀន</span>
          </button>
          <a href="${previewUrl}" target="_blank" class="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition" title="ទាញយក / Download">
            <i data-lucide="download" class="w-4 h-4"></i>
          </a>
          ${isAdmin ? `
            <button onclick="deleteLesson('${item.lesson_id}')" class="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition" title="លុបមេរៀន">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });
  refreshIcons();
}

function escapeHtml(text) {
  return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Helper: Convert File to Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

// Add Lesson Form Handler
const addLessonForm = document.getElementById("addLessonForm");
if (addLessonForm) {
  addLessonForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("addLessonBtn");
    const fileInput = document.getElementById("lessonFileInput");
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("សូមជ្រើសរើស File ឯកសារជាមុនសិន!");
      return;
    }

    const file = fileInput.files[0];
    if (btn) {
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>កំពុង Upload និង រក្សាទុក...</span>`;
      btn.disabled = true;
      refreshIcons();
    }

    try {
      const base64File = await fileToBase64(file);
      const lessonId = "LES-" + Date.now();
      const subjectSelect = document.getElementById("lessonSubject");
      const rawTitle = document.getElementById("lessonTitle").value.trim();
      const subjectPrefix = subjectSelect ? subjectSelect.value : "";
      const fullTitle = subjectPrefix ? `${subjectPrefix} - ${rawTitle}` : rawTitle;
      const desc = document.getElementById("lessonDesc").value.trim();
      const classCode = document.getElementById("classCode").value.trim();

      const payload = {
        action: "addLesson",
        lesson_id: lessonId,
        title: fullTitle,
        description: desc,
        class_code: classCode,
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
      if (data && data.status === "success") {
        alert("បញ្ចូល និង Upload មេរៀនជោគជ័យ!");
        addLessonForm.reset();
        fetchLessons();
      } else {
        alert((data && data.message) ? data.message : "មានបញ្ហាក្នុងការបញ្ចូលមេរៀន!");
      }
    } catch (err) {
      console.error("Upload Lesson Error:", err);
      alert("មានបញ្ហាក្នុងការ Upload មេរៀន!");
    } finally {
      if (btn) {
        btn.innerHTML = `<i data-lucide="upload-cloud" class="w-4 h-4"></i><span>Upload និង រក្សាទុកមេរៀន</span>`;
        btn.disabled = false;
        refreshIcons();
      }
    }
  });
}

// Delete Lesson Handler
function deleteLesson(lessonId) {
  if (!lessonId) return;
  if (confirm("តើអ្នកប្រាកដជាចង់លុបមេរៀននេះមែនទេ?")) {
    fetch(`${API_URL}?action=deleteLesson&lesson_id=${encodeURIComponent(lessonId)}`)
      .then(res => res.json())
      .then(() => {
        alert("លុបមេរៀនជោគជ័យ!");
        fetchLessons();
      })
      .catch(err => {
        console.error("Delete Lesson Error:", err);
        alert("មានបញ្ហាក្នុងការលុបមេរៀន!");
      });
  }
}

// Fetch Students
function fetchStudents() {
  const studentListTbody = document.getElementById("studentList");
  const totalStudentsBadge = document.getElementById("totalStudentsCountBadge");
  if (!studentListTbody) return;

  fetch(`${API_URL}?action=getStudents`)
    .then(res => res.json())
    .then(data => {
      studentListTbody.innerHTML = "";

      if (!data || !Array.isArray(data) || data.length === 0) {
        studentListTbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-500 font-medium">មិនទាន់មានទិន្នន័យនិស្សិតនៅឡើយទេ។</td></tr>`;
        if (totalStudentsBadge) totalStudentsBadge.innerText = "សរុប ០ នាក់";
        return;
      }

      if (totalStudentsBadge) {
        totalStudentsBadge.innerText = `សរុប ${data.length} នាក់`;
      }

      data.forEach((student, index) => {
        studentListTbody.innerHTML += `
          <tr class="hover:bg-slate-900/60 transition border-b border-slate-800/40">
            <td class="py-3.5 px-4 text-slate-500">${index + 1}</td>
            <td class="py-3.5 px-4 font-mono text-indigo-400 font-medium">${student.student_id || ''}</td>
            <td class="py-3.5 px-4 font-bold text-white">${student.khmer_name || ''}</td>
            <td class="py-3.5 px-4 text-slate-300">${student.latin_name || '-'}</td>
            <td class="py-3.5 px-4">${student.gender || '-'}</td>
            <td class="py-3.5 px-4 text-slate-400">${student.dob || '-'}</td>
          </tr>
        `;
      });
      refreshIcons();
    })
    .catch(err => {
      console.error("Student Error:", err);
      if (studentListTbody) {
        studentListTbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-rose-400 font-medium">មិនអាចទាញយកទិន្នន័យនិស្សិតបានទេ!</td></tr>`;
      }
    });
}
