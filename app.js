// កំណត់តំណភ្ជាប់ API ទៅកាន់ Vercel Proxy របស់អ្នក
const API_URL = "/api/proxy"; 

document.addEventListener("DOMContentLoaded", () => {
  // 1. មុខងារ Login Form Handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault(); // ទប់ស្កាត់ការ Refresh ទំព័រ
      
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      // កំណត់លក្ខខណ្ឌផ្ទៀងផ្ទាត់អ៊ីម៉ែល
      if (email === "moksambath@gmail.com") {
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("dashboardSection").classList.remove("hidden");
        document.getElementById("adminPanel").classList.remove("hidden");

        document.getElementById("userName").textContent = "Mok Sambath";
        document.getElementById("userRole").textContent = "Admin";

        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // កោះហៅទាញយកទិន្នន័យនិស្សិតមកបង្ហាញភ្លាមពេល Login ចូល
        fetchStudents();
      } else {
        alert("អ៊ីម៉ែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!");
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

  // 2. ចងភ្ជាប់ Event Listener ជាមួយ Form បន្ថែមនិស្សិតថ្មី
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

// 3. មុខងារបើក Modal បន្ថែមនិស្សិតថ្មី
function openAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  if (modal) modal.classList.remove("hidden");
}

// មុខងារបិទ Modal បន្ថែមនិស្សិត
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

// 4. មុខងារទាញយកទិន្នន័យនិស្សិតពី Server មកបង្ហាញក្នុងតារាង
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

    // បង្ហាញទិន្នន័យចូលក្នុងតារាង HTML
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

    // បច្ចុប្បន្នភាពចំនួនសរុប (បើមាន Element បង្ហាញចំនួនសរុប)
    const totalCountEl = document.getElementById("totalStudentsCount");
    if (totalCountEl) totalCountEl.textContent = students.length;

  } catch (err) {
    console.error("Error fetching students:", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-rose-400">មិនអាចទាញយកទិន្នន័យពី Server បានទេ!</td></tr>`;
    }
  }
}

// 5. មុខងារបញ្ជូនទិន្នន័យបន្ថែមនិស្សិតថ្មីទៅកាន់ Server (API)
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

    if (data?.status === "success" || data === true) {
      alert("បន្ថែមទិន្នន័យនិស្សិតថ្មីជោគជ័យ!");
      closeAddStudentModal();
      
      // ទាញយកតារាងនិស្សិតមកបង្ហាញសាថ្មីភ្លាមៗ
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
