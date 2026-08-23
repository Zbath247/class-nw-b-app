const API_URL = "/api/proxy"; 

document.addEventListener("DOMContentLoaded", () => {
  // 1. មុខងារ Login Form Handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        alert("សូមបំពេញអ៊ីម៉ែល និងពាក្យសម្ងាត់!");
        return;
      }

      try {
        const res = await fetch(`${API_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const data = await res.json();

        if (data.status === "success") {
          document.getElementById("loginSection").classList.add("hidden");
          document.getElementById("dashboardSection").classList.remove("hidden");
          document.getElementById("adminPanel").classList.remove("hidden");

          document.getElementById("userName").textContent = data.user.name || "Mok Sambath";
          document.getElementById("userRole").textContent = data.user.role || "Admin";

          if (typeof lucide !== 'undefined') lucide.createIcons();
          
          // ទាញយកទិន្នន័យទាំងអស់មកបង្ហាញក្នុង Dashboard
          fetchAllData();
        } else {
          alert(data.message || "អ៊ីម៉ែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!");
        }
      } catch (err) {
        console.error("Login Error:", err);
        alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!");
      }
    });
  }

  // មុខងារបង្ហាញ/លាក់ Password ពេល Login
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const loginPassword = document.getElementById("loginPassword");
  if (togglePasswordBtn && loginPassword) {
    togglePasswordBtn.addEventListener("click", () => {
      const type = loginPassword.getAttribute("type") === "password" ? "text" : "password";
      loginPassword.setAttribute("type", type);
    });
  }

  // ចងភ្ជាប់ Event Listener ជាមួយ Form បន្ថែមនិស្សិតថ្មី
  const addStudentForm = document.getElementById("addStudentForm");
  if (addStudentForm) {
    addStudentForm.addEventListener("submit", handleAddStudent);
  }
});

// មុខងារ Logout ចេញពីប្រព័ន្ធ
function logout() {
  document.getElementById("dashboardSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.reset();
}

// មុខងារបើក/បិទ Modal បន្ថែមនិស្សិត
function openAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.add("hidden");
  const form = document.getElementById("addStudentForm");
  if (form) form.reset();
}

// មុខងារជំនួយសម្រាប់បង្ហាញ Loading នៅលើប៊ូតុង
function setButtonLoading(button, isLoading, text, iconName = "save") {
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> <span>${text}</span>`;
  } else {
    button.disabled = false;
    button.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i> <span>${text}</span>`;
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ប្រមូលផ្ដុំមុខងារទាញយកទិន្នន័យទាំងអស់
function fetchAllData() {
  fetchStudents();
  fetchClasses();
  fetchLessons();
  fetchSchedules();
}

// 1. មុខងារទាញយក និងបង្ហាញទិន្នន័យនិស្សិត
async function fetchStudents() {
  const tbody = document.getElementById("studentList");
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">កំពុងទាញយកទិន្នន័យនិស្សិត...</td></tr>`;
  }

  try {
    const res = await fetch(`${API_URL}?action=getStudents`);
    const students = await res.json();
    
    if (!tbody) return;

    if (!Array.isArray(students) || students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400">មិនទាន់មានទិន្នន័យនិស្សិតទេ</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map((s, index) => `
      <tr class="hover:bg-slate-900/50 transition border-b border-slate-800/40">
        <td class="py-3 px-4">${index + 1}</td>
        <td class="py-3 px-4 font-mono text-indigo-400">${s.student_id || ''}</td>
        <td class="py-3 px-4 font-bold text-white">${s.khmer_name || ''}</td>
        <td class="py-3 px-4 text-slate-300">${s.latin_name || '-'}</td>
        <td class="py-3 px-4">${s.gender || '-'}</td>
        <td class="py-3 px-4 text-slate-400">${s.dob || '-'}</td>
      </tr>
    `).join('');

    const totalCountEl = document.getElementById("totalStudentsCount");
    if (totalCountEl) totalCountEl.textContent = students.length;

  } catch (err) {
    console.error("Error fetching students:", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-rose-400">មិនអាចទាញយកទិន្នន័យពី Server បានទេ!</td></tr>`;
    }
  }
}

// 2. មុខងារទាញយក និងបង្ហាញទិន្នន័យថ្នាក់រៀន (Classes)
async function fetchClasses() {
  try {
    const res = await fetch(`${API_URL}?action=getClasses`);
    const classes = await res.json();
    
    const classContainer = document.getElementById("classList");
    if (classContainer && Array.isArray(classes)) {
      classContainer.innerHTML = classes.map(c => `
        <div class="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-2">
          <div class="font-bold text-white">${c.class_name}</div>
          <div class="text-sm text-indigo-400">កូដថ្នាក់៖ ${c.class_code} | គ្រូបង្រៀន៖ ${c.teacher_name}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error("Error fetching classes:", err);
  }
}

// 3. មុខងារទាញយក និងបង្ហាញទិន្នន័យមេរៀន (Lessons) ព្រមទាំងរាប់ចំនួនសរុបដាក់លើ Dashboard
async function fetchLessons() {
  try {
    const res = await fetch(`${API_URL}?action=getLessons`);
    const lessons = await res.json();
    
    // 🧮 កូដរាប់ចំនួនឯកសារមេរៀនសរុប ដាក់ចូលទៅកាន់កាត Summary
    const totalLessonsEl = document.getElementById("totalLessonsCount");
    if (totalLessonsEl && Array.isArray(lessons)) {
      totalLessonsEl.textContent = lessons.length;
    }

    const lessonContainer = document.getElementById("lessonList");
    if (lessonContainer && Array.isArray(lessons)) {
      lessonContainer.innerHTML = lessons.map(l => `
        <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-3">
          <h4 class="font-bold text-white">${l.title}</h4>
          <p class="text-sm text-slate-300 mt-1">${l.description || ''}</p>
          <div class="mt-2">
            <a href="${l.file_url}" target="_blank" class="text-indigo-400 hover:underline text-sm flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> មើលឯកសារមេរៀន
            </a>
          </div>
        </div>
      `).join('');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } catch (err) {
    console.error("Error fetching lessons:", err);
  }
}

// 4. មុខងារទាញយក និងបង្ហាញទិន្នន័យកាលវិភាគសិក្សា (Schedules) ព្រមទាំងរាប់ចំនួន Sessions
async function fetchSchedules() {
  try {
    const res = await fetch(`${API_URL}?action=getSchedules`);
    const schedules = await res.json();
    
    // 🧮 កូដរាប់ចំនួន Sessions សរុប ដាក់ចូលទៅកាន់កាត Summary
    const totalSessionsEl = document.getElementById("totalSessionsCount");
    if (totalSessionsEl && Array.isArray(schedules)) {
      totalSessionsEl.textContent = `${schedules.length} Sessions`;
    }

    const scheduleContainer = document.getElementById("scheduleList");
    if (scheduleContainer && Array.isArray(schedules)) {
      scheduleContainer.innerHTML = schedules.map(sch => `
        <tr class="hover:bg-slate-900/50 transition border-b border-slate-800/40">
          <td class="py-3 px-4 text-slate-300">${sch.day || ''}</td>
          <td class="py-3 px-4 text-slate-300">${sch.time || ''}</td>
          <td class="py-3 px-4 font-bold text-white">${sch.subject || ''}</td>
          <td class="py-3 px-4 text-indigo-400">${sch.room || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error("Error fetching schedules:", err);
  }
}

// 5. មុខងារបន្ថែមនិស្សិតថ្មី
async function handleAddStudent(e) {
  e.preventDefault();
  
  const studentId = document.getElementById("newStudentId")?.value.trim();
  const khmerName = document.getElementById("newKhmerName")?.value.trim();
  const latinName = document.getElementById("newLatinName")?.value.trim();
  const gender = document.getElementById("newGender")?.value.trim();
  const dob = document.getElementById("newDob")?.value.trim();

  if (!studentId || !khmerName) {
    alert("សូមបំពេញអត្តលេខ និងឈ្មោះខ្មែរឱ្យបានត្រឹមត្រូវ!");
    return;
  }

  const submitBtn = document.getElementById("saveStudentBtn");
  setButtonLoading(submitBtn, true, "កំពុងរក្សាទុក...");

  try {
    const payload = {
      action: "addStudent",
      student_id: studentId,
      khmer_name: khmerName,
      latin_name: latinName,
      gender: gender,
      dob: dob
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data?.status === "success") {
      alert("បន្ថែមទិន្នន័យនិស្សិតថ្មីជោគជ័យ!");
      closeAddStudentModal();
      fetchStudents();
    } else {
      alert(data?.message || "មានបញ្ហាក្នុងការបន្ថែមទិន្នន័យនិស្សិត!");
    }
  } catch (err) {
    console.error("Add Student Error:", err);
    alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!");
  } finally {
    setButtonLoading(submitBtn, false, "រក្សាទុក", "save");
  }
}
