const API_URL = "/api/proxy";

let currentUser = null;
let allLessons = []; // រក្សាទុកទិន្នន័យមេរៀនដើមទាំងអស់
let currentFilter = "ALL"; // Category Filter
let allStudents = []; // រក្សាទុកទិន្នន័យនិស្សិតទាំងអស់សម្រាប់ធ្វើ Search
let allClasses = []; // [ADDED] រក្សាទុកទិន្នន័យ Classes
let allSchedules = []; // [ADDED] រក្សាទុកទិន្នន័យ Schedules

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

// [UPDATED] មុខងារបង្ហាញ Dashboard និងទាញយកទិន្នន័យ Tab ទាំង ៥ ព្រមគ្នា
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

  // ហៅទាញយកទិន្នន័យទាំងអស់ពី Tab ទាំង ៥ ព្រមគ្នាតែម្តង
  fetchAllDataTogether();
  refreshIcons();
}

// [ADDED] មុខងារទាញយកទិន្នន័យ Tab ទាំង ៥ ព្រមគ្នា
function fetchAllDataTogether() {
  fetch(`${API_URL}?action=getAllData`)
    .then(res => res.json())
    .then(data => {
      // 1. ទិន្នន័យ Lessons
      allLessons = Array.isArray(data.lessons) ? data.lessons : [];
      const statLessons = document.getElementById("statTotalLessons");
      if (statLessons) statLessons.innerText = allLessons.length;
      renderLessonsByFilter();

      // 2. ការទិន្នន័យ Schedules
      allSchedules = Array.isArray(data.schedules) ? data.schedules : [];
      renderSchedulesData(allSchedules);

      // 3. ការទិន្នន័យ Students
      allStudents = Array.isArray(data.students) ? data.students : [];
      renderStudents(allStudents);

      // 4. ទិន្នន័យ Classes (អាចយកទៅប្រើប្រាស់បន្តបើចាំបាច់)
      allClasses = Array.isArray(data.classes) ? data.classes : [];

      console.log("ទាញយកទិន្នន័យ Tab ទាំង ៥ បានជោគជ័យ:", data);
    })
    .catch(err => {
      console.error("Error fetching all data:", err);
    });
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// [UPDATED] Render Schedules & Update Stats
function renderSchedulesData(data) {
  const scheduleTbody = document.getElementById("scheduleList");
  if (!scheduleTbody) return;

  scheduleTbody.innerHTML = "";

  if (!data || data.length === 0) {
    scheduleTbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400 font-medium">មិនទាន់មានកាលវិភាគនៅឡើយទេ។</td></tr>`;
    updateScheduleStats(0, 0);
    return;
  }

  const totalSessions = data.length;
  const uniqueSubjects = new Set(data.map(item => item.subject ? item.subject.trim() : '')).size;
  updateScheduleStats(uniqueSubjects, totalSessions);

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
}

// Helper to Update Schedule Stat Cards
function updateScheduleStats(totalClasses, totalSessions) {
  const statClasses = document.getElementById("statTotalClasses");
  const statSessions = document.getElementById("statTotalSessions");

  if (statClasses) statClasses.innerText = totalClasses;
  if (statSessions) statSessions.innerText = `${totalSessions} Sessions`;
}

// Filter Function
function filterLessons(subject) {
  currentFilter = subject;

  // Update Active UI Tab Buttons
  const buttons = document.querySelectorAll('.subject-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white');
    btn.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
    event.currentTarget.classList.add('bg-indigo-600', 'text-white');
  }

  renderLessonsByFilter();
}

// Helper to extract Drive File ID and convert to Mobile Friendly Preview Link
function getMobilePreviewLink(url) {
  if (!url) return '#';
  const match = url.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/file/d/${match[0]}/preview` : url;
}

// Render Lessons List
function renderLessonsByFilter() {
  const lessonListDiv = document.getElementById("lessonList");
  if (!lessonListDiv) return;

  lessonListDiv.innerHTML = "";

  let filtered = allLessons;
  if (currentFilter !== "ALL") {
    filtered = allLessons.filter(item => 
      item.title && item.title.toUpperCase().includes(currentFilter.toUpperCase())
    );
  }

  if (filtered.length === 0) {
    lessonListDiv.innerHTML = "<p class='text-slate-400 text-xs text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200'>មិនទាន់មានមេរៀនសម្រាប់មុខវិជ្ជានេះនៅឡើយទេ។</p>";
    return;
  }

  filtered.forEach(item => {
    const isAdmin = currentUser && currentUser.role === "admin";
    const previewUrl = getMobilePreviewLink(item.file_url);

    lessonListDiv.innerHTML += `
      <div class="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
          <span class="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">${item.class_code || 'G1-NW-B'}</span>
          <h3 class="font-bold text-sm text-slate-800 mt-1">${item.title || ''}</h3>
          <p class="text-xs text-slate-500 line-clamp-2">${item.description || "គ្មានការពិពណ៌នា"}</p>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <a href="${previewUrl}" target="_blank" class="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm shadow-emerald-600/20 whitespace-nowrap">
            <i data-lucide="eye" class="w-4 h-4"></i>
            <span>មើល / Download File</span>
          </a>
          ${isAdmin ? `
            <button onclick="deleteLesson('${item.lesson_id}')" class="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition" title="លុបមេរៀន">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });
  refreshIcons();
}

// Helper: Convert File Object to Base64 String
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

// Add Lesson Handler
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data && data.status === "success") {
        alert("បញ្ចូល និង Upload មេរៀនជោគជ័យ!");
        addLessonForm.reset();
        fetchAllDataTogether(); // ទាញយកទិន្នន័យអាប់ដេតថ្មី
      } else {
        alert((data && data.message) ? data.message : "មានបញ្ហាក្នុងការបញ្ចូលមេរៀន!");
      }

    } catch (err) {
      console.error("Upload Lesson Error:", err);
      alert("មានបញ្ហាក្នុងការ Upload មេរៀន!");
    } finally {
      if (btn) {
        btn.innerHTML = `<i data-lucide="save" class="w-4 h-4"></i><span>រក្សាទុកមេរៀន</span>`;
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
      .then(data => {
        alert("លុបមេរៀនជោគជ័យ!");
        fetchAllDataTogether(); // ទាញយកទិន្នន័យអាប់ដេតថ្មី
      })
      .catch(err => {
        console.error("Delete Lesson Error:", err);
        alert("មានបញ្ហាក្នុងការលុបមេរៀន!");
      });
  }
}

// មុខងារ Render បញ្ជីនិស្សិត និងគាំទ្រការ Filter/Search
function renderStudents(students) {
  const studentListTbody = document.getElementById("studentList");
  const totalStudentsBadge = document.getElementById("totalStudentsCountBadge");
  if (!studentListTbody) return;

  studentListTbody.innerHTML = "";

  if (students.length === 0) {
    studentListTbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">មិនមានទិន្នន័យនិស្សិតដែលត្រូវស្វែងរកទេ។</td></tr>`;
    if (totalStudentsBadge) totalStudentsBadge.innerText = "សរុប ០ នាក់";
    return;
  }

  if (totalStudentsBadge) {
    totalStudentsBadge.innerText = `សរុប ${students.length} នាក់`;
  }

  students.forEach((student, index) => {
    studentListTbody.innerHTML += `
      <tr class="hover:bg-indigo-50/30 transition border-b border-slate-100/80">
        <td class="py-3.5 px-4 text-slate-500 font-medium">${index + 1}</td>
        <td class="py-3.5 px-4 font-mono text-indigo-600 font-semibold">${student.student_id || ''}</td>
        <td class="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            ${(student.khmer_name || 'N').charAt(0)}
          </div>
          ${student.khmer_name || ''}
        </td>
        <td class="py-3.5 px-4 text-slate-600 font-medium">${student.latin_name || '-'}</td>
        <td class="py-3.5 px-4">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${student.gender === 'ស្រី' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}">
            ${student.gender || '-'}
          </span>
        </td>
        <td class="py-3.5 px-4 text-slate-500">${student.dob || '-'}</td>
      </tr>
    `;
  });
  refreshIcons();
}

// មុខងារស្វែងរកឈ្មោះនិស្សិត
function searchStudents(keyword) {
  const term = keyword.toLowerCase().trim();
  const filtered = allStudents.filter(s => 
    (s.khmer_name && s.khmer_name.toLowerCase().includes(term)) ||
    (s.latin_name && s.latin_name.toLowerCase().includes(term)) ||
    (s.student_id && s.student_id.toLowerCase().includes(term))
  );
  renderStudents(filtered);
}
// ==========================================
// [ADDED] BOTTOM NAVIGATION BAR FUNCTIONALITY
// ==========================================

// Function សម្រាប់បង្កើតនិងបង្ហាញ Bottom Navigation ស្វ័យប្រវត្តិពេល Load ទំព័រ
document.addEventListener("DOMContentLoaded", () => {
    createBottomNavigationBar();
});

function createBottomNavigationBar() {
    if (document.getElementById("customBottomNav")) return;

    const bottomNav = document.createElement("div");
    bottomNav.id = "customBottomNav";
    bottomNav.className = "custom-bottom-nav";

    // [UPDATED] ប្រើប្រាស់ Lucide Icons ជំនួសឱ្យ Emoji ដើម្បីភាពស្អាតបែប Premium និងដូរ switchNavTab មក switchTab វិញ
    bottomNav.innerHTML = `
        <a href="#dashboard" class="nav-link-item active" onclick="switchTab('home', event)">
            <i data-lucide="home" class="w-5 h-5 mb-1"></i>
            <span>ទំព័រដើម</span>
        </a>
        <a href="#lessons" class="nav-link-item" onclick="switchTab('lessons', event)">
            <i data-lucide="book-open" class="w-5 h-5 mb-1"></i>
            <span>មេរៀន</span>
        </a>
        <a href="#add" class="nav-link-item" onclick="switchTab('add', event)">
            <span class="nav-center-btn">
                <i data-lucide="plus" class="w-6 h-6"></i>
            </span>
        </a>
        <a href="#schedule" class="nav-link-item" onclick="switchTab('schedule', event)">
            <i data-lucide="calendar" class="w-5 h-5 mb-1"></i>
            <span>កាលវិភាគ</span>
        </a>
        <a href="#profile" class="nav-link-item" onclick="switchTab('profile', event)">
            <i data-lucide="user" class="w-5 h-5 mb-1"></i>
            <span>គណនី</span>
        </a>
    `;

    document.body.appendChild(bottomNav);
    document.body.style.paddingBottom = "75px";

    // ហៅទាញ Lucide Icons ឱ្យរត់ចេញជារូបស្អាត
    if (window.lucide) {
        lucide.createIcons();
    }
}

    // បញ្ចូលវាទៅក្នុង body របស់ HTML
    document.body.appendChild(bottomNav);

    // បន្ថែម padding ខាងក្រោម body ដើម្បីកុំឱ្យរបារនេះបាំងអត្ថបទ/conent ចុងក្រោយ
    document.body.style.paddingBottom = "75px";
}

// Function សម្រាប់ការចុចប្តូរ Tab លើ Bottom Navigation
function switchTab(tabName, event) {
    if (event) event.preventDefault();

    // ដក active class ចេញពីគ្រប់ tab ទាំងអស់
    document.querySelectorAll('.nav-link-item').forEach(item => {
        item.classList.remove('active');
    });

    // បន្ថែម active class ទៅកាន់ tab ដែលទើបចុច
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    console.log("Switched to bottom nav tab: ", tabName);
    
    // មុខងារ Scroll ឬ បង្ហាញផ្នែកផ្សេងៗ
    if (tabName === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabName === 'lessons') {
        const elem = document.getElementById("lessonList");
        if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'schedule') {
        const elem = document.getElementById("scheduleList");
        if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'add') {
        const elem = document.getElementById("adminPanel");
        if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'profile') {
        // ហៅមុខងារបើក Modal គណនី
        openProfileModal();
    }
}

// Function បើក Profile Modal
function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) {
        console.error("មិនទាន់បានបង្កើត HTML របស់ profileModal ទេ!");
        return;
    }
    
    const modalContent = document.getElementById('profileModalContent');
    
    // កំណត់ Role តាមទិន្នន័យពិតនៅលើ Header (USER ឬ ADMIN)
    const roleBadge = document.querySelector('.uppercase'); 
    const roleText = roleBadge ? roleBadge.innerText : 'USER';
    
    const modalRoleElem = document.getElementById('modalUserRole');
    if (modalRoleElem) modalRoleElem.innerText = roleText;

    // បង្ហាញ Modal
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modalContent) {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }
    }, 10);

    if (window.lucide) lucide.createIcons();
}

// Function បិទ Profile Modal
function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    const modalContent = document.getElementById('profileModalContent');
    if (!modal) return;
    
    modal.classList.add('opacity-0');
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
