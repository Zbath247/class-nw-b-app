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

// Login Handler using GET Parameters
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const btn = document.getElementById("loginBtn");
    if (btn) {
      btn.innerText = "កំពុងផ្ទៀងផ្ទាត់...";
      btn.disabled = true;
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
          // ការពារការលោត undefined ប្រសិនបើ Server មិនបានផ្ញើ message
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
          btn.innerText = "ចូលប្រព័ន្ធ";
          btn.disabled = false;
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
        scheduleTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400">មិនទាន់មានកាលវិភាគនៅឡើយទេ។</td></tr>`;
        return;
      }

      data.forEach(item => {
        scheduleTbody.innerHTML += `
          <tr class="hover:bg-gray-50 transition">
            <td class="p-3 font-bold text-blue-600">${item.day || ''}</td>
            <td class="p-3 text-gray-600">${item.time || ''}</td>
            <td class="p-3 font-semibold text-gray-800">${item.subject || ''}</td>
            <td class="p-3"><span class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border">${item.room || ''}</span></td>
            <td class="p-3 text-gray-600">${item.teacher || ''}</td>
          </tr>
        `;
      });
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
        lessonListDiv.innerHTML = "<p class='text-gray-400 text-sm'>មិនទាន់មានមេរៀននៅឡើយទេ។</p>";
        return;
      }

      data.forEach(item => {
        lessonListDiv.innerHTML += `
          <div class="border p-4 rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">${item.class_code || 'G1-NW-B'}</span>
              <h3 class="font-bold text-base text-gray-800 mt-1">${item.title || ''}</h3>
              <p class="text-xs text-gray-500 mt-0.5">${item.description || "គ្មានការពិពណ៌នា"}</p>
            </div>
            <a href="${item.file_url || '#'}" target="_blank" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition shadow-sm">
              📥 មើល / Download File
            </a>
          </div>
        `;
      });
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
      btn.innerText = "កំពុងរក្សាទុក...";
      btn.disabled = true;
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
          btn.innerText = "រក្សាទុកមេរៀន";
          btn.disabled = false;
        }
      });
  });
}
