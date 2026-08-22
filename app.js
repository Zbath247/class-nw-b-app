const API_URL = "/api/proxy";

let currentUser = null;

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

// Login Handler using GET Parameters
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
        alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server! សូមពិនិត្យមើល permissions លើ Apps Script (Who has access: Anyone)។");
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
  refreshIcons();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// Fetch Schedules
function fetchSchedules() {
  const scheduleTbody = document.getElementById("scheduleList");
  if (!scheduleTbody) return;

  fetch(`${API_URL}?action=getSchedules`)
    .then(res => res.json())
    .then(data => {
      scheduleTbody.innerHTML = "";

      if (!data || !Array.isArray(data) || data.length === 0) {
        scheduleTbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-medium">មិនទាន់មានកាលវិភាគនៅឡើយទេ។</td></tr>`;
        return;
      }

      data.forEach(item => {
        scheduleTbody.innerHTML += `
          <tr class="hover:bg-indigo-50/30 transition border-b border-slate-100/80">
            <td class="p-3.5 pl-5 font-bold text-indigo-600 flex items-center gap-1.5">
              <i data-lucide="calendar-days" class="w-4 h-4 text-indigo-400"></i>
              ${item.day || ''}
            </td>
            <td class="p-3.5 text-slate-600 font-medium">${item.time || ''}</td>
            <td class="p-3.5 font-semibold text-slate-800">${item.subject || ''}</td>
            <td class="p-3.5">
              <span class="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold">${item.room || ''}</span>
            </td>
            <td class="p-3.5 pr-5 text-slate-600 font-medium">${item.teacher || ''}</td>
          </tr>
        `;
      });
      refreshIcons();
    })
    .catch(err => console.error("Schedule Error:", err));
}

// Fetch Lessons
function fetchLessons() {
  const lessonListDiv = document.getElementById("lessonList");
  if (!lessonListDiv) return;

  fetch(`${API_URL}?action=getLessons`)
    .then(res => res.json())
    .then(data => {
      lessonListDiv.innerHTML = "";
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        lessonListDiv.innerHTML = "<p class='text-slate-400 text-xs text-center py-6'>មិនទាន់មានមេរៀននៅឡើយទេ។</p>";
        return;
      }

      data.forEach(item => {
        lessonListDiv.innerHTML += `
          <div class="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="space-y-1">
              <span class="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">${item.class_code || 'G1-NW-B'}</span>
              <h3 class="font-bold text-sm text-slate-800 mt-1">${item.title || ''}</h3>
              <p class="text-xs text-slate-500 line-clamp-2">${item.description || "គ្មានការពិពណ៌នា"}</p>
            </div>
            <a href="${item.file_url || '#'}" target="_blank" class="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20 whitespace-nowrap">
              <i data-lucide="download-cloud" class="w-4 h-4"></i>
              <span>មើល / Download File</span>
            </a>
          </div>
        `;
      });
      refreshIcons();
    })
    .catch(err => console.error("Lesson Error:", err));
}

// Add Lesson Handler
const addLessonForm = document.getElementById("addLessonForm");
if (addLessonForm) {
  addLessonForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const btn = document.getElementById("addLessonBtn");
    if (btn) {
      btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>កំពុងរក្សាទុក...</span>`;
      btn.disabled = true;
      refreshIcons();
    }

    const lessonId = "LES-" + Date.now();
    const title = encodeURIComponent(document.getElementById("lessonTitle").value);
    const desc = encodeURIComponent(document.getElementById("lessonDesc").value);
    const fileUrl = encodeURIComponent(document.getElementById("fileUrl").value);
    const classCode = encodeURIComponent(document.getElementById("classCode").value);

    fetch(`${API_URL}?action=addLesson&lesson_id=${lessonId}&title=${title}&description=${desc}&file_url=${fileUrl}&class_code=${classCode}`)
      .then(res => res.json())
      .then(data => {
        alert("បញ្ចូលមេរៀនជោគជ័យ!");
        addLessonForm.reset();
        fetchLessons();
      })
      .catch(err => alert("មានបញ្ហាក្នុងការបញ្ចូលមេរៀន!"))
      .finally(() => {
        if (btn) {
          btn.innerHTML = `<i data-lucide="save" class="w-4 h-4"></i><span>រក្សាទុកមេរៀន</span>`;
          btn.disabled = false;
          refreshIcons();
        }
      });
  });
}
