/* =========================================================
   Class_NW_B — University Networking Class Management
   Frontend: HTML + CSS + Vanilla JS
   Backend : Google Apps Script Web App  ->  Google Sheets
   =========================================================
   1. Deploy your Apps Script project as a Web App
      (Execute as: Me, Access: Anyone).
   2. Paste the Web App URL below.
   Until a real URL is set, the app runs on built-in DEMO data
   so every screen and button stays usable.
========================================================= */
const API_URL = "https://script.google.com/macros/s/AKfycbyX16XnIsn1klExZVcIiwEBOuJxA-AYm33JRUzb0340tdzojhzy_OaJfKwqza_GUzmS/exec";

const USE_DEMO = !API_URL || API_URL.indexOf("script.google.com") === -1;

/* ---------------- element helpers ---------------- */
const $ = (id) => document.getElementById(id);
const esc = (v) =>
  String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const uid = () => "id" + Date.now() + Math.floor(Math.random() * 1000);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-");

/* ---------------- UI feedback ---------------- */
let loadingCount = 0;
function showLoading(on) {
  loadingCount = Math.max(0, loadingCount + (on ? 1 : -1));
  $("loader").hidden = loadingCount === 0;
}
function showToast(message, type) {
  const el = document.createElement("div");
  el.className = "toast " + (type || "");
  el.textContent = message;
  $("toasts").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
const showError = (msg) => showToast(msg, "error");
const showSuccess = (msg) => showToast(msg, "success");

/* =========================================================
   DEMO DATABASE (mirrors the Google Sheets structure)
========================================================= */
const DEMO = {
  Users: [
    { id: "u1", name: "Admin Sokha", email: "admin@nw.edu", password: "admin123", role: "Admin", status: "Active", created_at: "2026-01-05" },
    { id: "u2", name: "Mr. Dara Chan", email: "teacher@nw.edu", password: "teacher123", role: "Teacher", status: "Active", created_at: "2026-01-05", teacher_id: "T001" },
    { id: "u3", name: "Lina Pov", email: "student@nw.edu", password: "student123", role: "Student", status: "Active", created_at: "2026-01-06", student_id: "NWB001" },
  ],
  Students: [
    { id: "s1", student_id: "NWB001", name: "Lina Pov", gender: "Female", date_of_birth: "2004-03-11", email: "student@nw.edu", phone: "012 345 678", address: "Phnom Penh", year: "Year 3", class_name: "NW_B", status: "Active", photo: "", created_at: "2026-01-06" },
    { id: "s2", student_id: "NWB002", name: "Sokun Vireak", gender: "Male", date_of_birth: "2003-11-02", email: "vireak@nw.edu", phone: "012 987 111", address: "Kandal", year: "Year 3", class_name: "NW_B", status: "Active", photo: "", created_at: "2026-01-06" },
    { id: "s3", student_id: "NWB003", name: "Chanthou Mao", gender: "Female", date_of_birth: "2004-07-19", email: "chanthou@nw.edu", phone: "011 220 553", address: "Siem Reap", year: "Year 3", class_name: "NW_B", status: "Active", photo: "", created_at: "2026-01-07" },
    { id: "s4", student_id: "NWB004", name: "Ratana Sok", gender: "Male", date_of_birth: "2003-05-25", email: "ratana@nw.edu", phone: "017 445 900", address: "Battambang", year: "Year 3", class_name: "NW_B", status: "Inactive", photo: "", created_at: "2026-01-08" },
    { id: "s5", student_id: "NWB005", name: "Sreyneang Kim", gender: "Female", date_of_birth: "2004-01-30", email: "sreyneang@nw.edu", phone: "096 331 220", address: "Takeo", year: "Year 3", class_name: "NW_B", status: "Active", photo: "", created_at: "2026-01-09" },
  ],
  Teachers: [
    { id: "t1", teacher_id: "T001", name: "Mr. Dara Chan", email: "teacher@nw.edu", phone: "012 111 222", department: "Networking", status: "Active", created_at: "2025-09-01" },
    { id: "t2", teacher_id: "T002", name: "Ms. Bopha Ly", email: "bopha@nw.edu", phone: "012 333 444", department: "Cyber Security", status: "Active", created_at: "2025-09-01" },
    { id: "t3", teacher_id: "T003", name: "Mr. Vannak Ouk", email: "vannak@nw.edu", phone: "017 555 666", department: "Systems / Linux", status: "Active", created_at: "2025-10-12" },
  ],
  Courses: [
    { id: "c1", course_code: "NW101", course_name: "Computer Networking", teacher_id: "T001", credits: 3, semester: "Semester 1", description: "OSI model, TCP/IP, IP addressing and subnetting." },
    { id: "c2", course_code: "NW201", course_name: "Routing and Switching", teacher_id: "T001", credits: 3, semester: "Semester 1", description: "Static/dynamic routing, VLANs, STP, EtherChannel." },
    { id: "c3", course_code: "NW301", course_name: "Network Security", teacher_id: "T002", credits: 3, semester: "Semester 2", description: "Firewalls, ACLs, VPN, threat mitigation." },
    { id: "c4", course_code: "NW210", course_name: "Cisco Networking", teacher_id: "T001", credits: 2, semester: "Semester 2", description: "CCNA labs on Cisco IOS and Packet Tracer." },
    { id: "c5", course_code: "NW220", course_name: "Linux Administration", teacher_id: "T003", credits: 3, semester: "Semester 1", description: "Users, services, networking and shell scripting." },
    { id: "c6", course_code: "NW230", course_name: "Wireless Networking", teacher_id: "T002", credits: 2, semester: "Semester 2", description: "Wi-Fi standards, AP design, wireless security." },
  ],
  Schedule: [
    { id: "sc1", course_id: "c1", day: "Monday", start_time: "08:00", end_time: "10:00", room: "Lab A-201", teacher_id: "T001" },
    { id: "sc2", course_id: "c2", day: "Monday", start_time: "13:00", end_time: "15:00", room: "Lab A-202", teacher_id: "T001" },
    { id: "sc3", course_id: "c5", day: "Tuesday", start_time: "08:00", end_time: "10:00", room: "Lab B-105", teacher_id: "T003" },
    { id: "sc4", course_id: "c3", day: "Wednesday", start_time: "10:00", end_time: "12:00", room: "Room C-310", teacher_id: "T002" },
    { id: "sc5", course_id: "c4", day: "Thursday", start_time: "08:00", end_time: "11:00", room: "Cisco Lab", teacher_id: "T001" },
    { id: "sc6", course_id: "c6", day: "Friday", start_time: "13:00", end_time: "15:00", room: "Lab B-107", teacher_id: "T002" },
    { id: "sc7", course_id: "c1", day: "Saturday", start_time: "08:00", end_time: "10:00", room: "Lab A-201", teacher_id: "T001" },
  ],
  Attendance: [
    { id: "a1", student_id: "NWB001", course_id: "c1", date: "2026-08-17", status: "Present", marked_by: "T001" },
    { id: "a2", student_id: "NWB002", course_id: "c1", date: "2026-08-17", status: "Late", marked_by: "T001" },
    { id: "a3", student_id: "NWB003", course_id: "c1", date: "2026-08-17", status: "Present", marked_by: "T001" },
    { id: "a4", student_id: "NWB004", course_id: "c1", date: "2026-08-17", status: "Absent", marked_by: "T001" },
    { id: "a5", student_id: "NWB005", course_id: "c1", date: "2026-08-17", status: "Present", marked_by: "T001" },
    { id: "a6", student_id: "NWB001", course_id: "c2", date: "2026-08-18", status: "Present", marked_by: "T001" },
    { id: "a7", student_id: "NWB002", course_id: "c2", date: "2026-08-18", status: "Present", marked_by: "T001" },
  ],
  Assignments: [
    { id: "as1", title: "Subnetting Worksheet", description: "Solve 20 VLSM subnetting problems and submit the PDF.", course_id: "c1", teacher_id: "T001", due_date: "2026-08-28", file_url: "https://drive.google.com/", created_at: "2026-08-14" },
    { id: "as2", title: "VLAN + Trunk Lab Report", description: "Packet Tracer lab: configure VLANs, trunking and inter-VLAN routing.", course_id: "c2", teacher_id: "T001", due_date: "2026-09-02", file_url: "https://drive.google.com/", created_at: "2026-08-18" },
    { id: "as3", title: "Firewall ACL Design", description: "Design ACLs for a small campus network.", course_id: "c3", teacher_id: "T002", due_date: "2026-08-25", file_url: "https://drive.google.com/", created_at: "2026-08-12" },
  ],
  Exams: [
    { id: "e1", course_id: "c1", title: "Computer Networking Midterm", exam_date: "2026-09-10", start_time: "08:00", duration: "90 min", room: "Hall 1", description: "Chapters 1-6" },
    { id: "e2", course_id: "c2", title: "Routing & Switching Practical", exam_date: "2026-09-15", start_time: "13:00", duration: "120 min", room: "Cisco Lab", description: "Hands-on configuration exam" },
    { id: "e3", course_id: "c5", title: "Linux Administration Final", exam_date: "2026-09-22", start_time: "09:00", duration: "120 min", room: "Hall 2", description: "Full syllabus" },
  ],
  Grades: [
    { id: "g1", student_id: "NWB001", course_id: "c1", assignment_score: 18, attendance_score: 9, midterm_score: 26, final_score: 38, updated_at: "2026-08-19" },
    { id: "g2", student_id: "NWB001", course_id: "c2", assignment_score: 16, attendance_score: 10, midterm_score: 22, final_score: 34, updated_at: "2026-08-19" },
    { id: "g3", student_id: "NWB002", course_id: "c1", assignment_score: 15, attendance_score: 8, midterm_score: 21, final_score: 30, updated_at: "2026-08-19" },
    { id: "g4", student_id: "NWB003", course_id: "c1", assignment_score: 19, attendance_score: 10, midterm_score: 28, final_score: 40, updated_at: "2026-08-19" },
    { id: "g5", student_id: "NWB005", course_id: "c5", assignment_score: 14, attendance_score: 7, midterm_score: 19, final_score: 28, updated_at: "2026-08-19" },
  ],
  Announcements: [
    { id: "an1", title: "Cisco Lab opens on Saturday", content: "The Cisco lab will be open every Saturday 08:00-16:00 for CCNA practice. Bring your student card.", author_id: "u1", image_url: "", created_at: "2026-08-18" },
    { id: "an2", title: "Midterm schedule published", content: "Midterm exams for Class_NW_B start on 10 September. Check the Exams page for rooms and times.", author_id: "u1", image_url: "", created_at: "2026-08-16" },
    { id: "an3", title: "Guest lecture: Network Security", content: "A guest engineer from a local ISP will talk about real-world firewall deployments on Wednesday.", author_id: "u2", image_url: "", created_at: "2026-08-12" },
  ],
  StudyMaterials: [
    { id: "m1", title: "OSI & TCP/IP Model Slides", description: "Full slide deck with examples.", course_id: "c1", category: "Networking", file_url: "https://drive.google.com/", uploaded_by: "T001", created_at: "2026-08-05" },
    { id: "m2", title: "CCNA Packet Tracer Lab Pack", description: "12 practice labs with answer keys.", course_id: "c4", category: "Cisco", file_url: "https://drive.google.com/", uploaded_by: "T001", created_at: "2026-08-06" },
    { id: "m3", title: "Linux Command Cheat Sheet", description: "Most used commands for administration.", course_id: "c5", category: "Linux", file_url: "https://drive.google.com/", uploaded_by: "T003", created_at: "2026-08-08" },
    { id: "m4", title: "ACL & Firewall Handbook", description: "Reference for access-control lists.", course_id: "c3", category: "Security", file_url: "https://drive.google.com/", uploaded_by: "T002", created_at: "2026-08-10" },
    { id: "m5", title: "Wireless Site Survey Guide", description: "How to plan AP placement.", course_id: "c6", category: "Wireless", file_url: "https://drive.google.com/", uploaded_by: "T002", created_at: "2026-08-11" },
  ],
};

const SHEET_OF = {
  Students: "Students", Teachers: "Teachers", Courses: "Courses", Schedule: "Schedule",
  Attendance: "Attendance", Assignments: "Assignments", Exams: "Exams", Grades: "Grades",
  Announcements: "Announcements", StudyMaterials: "StudyMaterials", Users: "Users",
};

/* Local persistence of demo data so CRUD feels real between reloads */
function demoLoad() {
  try {
    const saved = JSON.parse(localStorage.getItem("nwb_demo_db") || "null");
    if (saved) Object.keys(DEMO).forEach((k) => { if (saved[k]) DEMO[k] = saved[k]; });
  } catch (e) { /* ignore */ }
}
function demoSave() {
  try { localStorage.setItem("nwb_demo_db", JSON.stringify(DEMO)); } catch (e) { /* ignore */ }
}

/* =========================================================
   API LAYER — every operation goes through Apps Script
========================================================= */
async function apiGet(action, params) {
  if (USE_DEMO) return demoHandle(action, params || {});
  const qs = new URLSearchParams(Object.assign({ action: action }, params || {}));
  const res = await fetch(API_URL + "?" + qs.toString());
  return res.json();
}
async function apiPost(action, payload) {
  if (USE_DEMO) return demoHandle(action, payload || {});
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight with Apps Script
    body: JSON.stringify(Object.assign({ action: action }, payload || {})),
  });
  return res.json();
}
async function callApi(action, data, method) {
  showLoading(true);
  try {
    const res = method === "POST" ? await apiPost(action, data) : await apiGet(action, data);
    if (!res || res.success !== true) throw new Error((res && res.message) || "Something went wrong");
    return res.data;
  } catch (err) {
    showError(err.message || "Network error. Please try again.");
    throw err;
  } finally {
    showLoading(false);
  }
}

/* Demo backend: same contract as the Apps Script API */
function demoHandle(action, p) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ok = (data, message) => resolve({ success: true, message: message || "Success", data: data === undefined ? [] : data });
      const fail = (message) => resolve({ success: false, message: message });

      if (action === "login") {
        const u = DEMO.Users.find(
          (x) => x.email.toLowerCase() === String(p.email || "").toLowerCase() && x.password === p.password
        );
        if (!u) return fail("Invalid email or password");
        if (u.status !== "Active") return fail("This account is not active");
        const { password, ...safe } = u;
        return ok(safe, "Welcome back");
      }
      if (action === "changePassword") {
        const u = DEMO.Users.find((x) => x.id === p.user_id);
        if (!u || u.password !== p.old_password) return fail("Current password is incorrect");
        u.password = p.new_password; demoSave(); return ok(null, "Password updated");
      }
      if (action === "updateProfile") {
        const u = DEMO.Users.find((x) => x.id === p.user_id);
        if (u) { u.name = p.name; u.email = p.email; }
        const s = DEMO.Students.find((x) => x.student_id === (u && u.student_id));
        if (s) { s.name = p.name; s.email = p.email; if (p.phone) s.phone = p.phone; }
        demoSave(); return ok(u, "Profile updated");
      }
      if (action === "saveAttendance") {
        (p.records || []).forEach((r) => {
          const found = DEMO.Attendance.find((a) => a.student_id === r.student_id && a.course_id === p.course_id && a.date === p.date);
          if (found) { found.status = r.status; found.marked_by = p.marked_by || ""; }
          else DEMO.Attendance.push({ id: uid(), student_id: r.student_id, course_id: p.course_id, date: p.date, status: r.status, marked_by: p.marked_by || "" });
        });
        demoSave(); return ok(null, "Attendance saved");
      }
      if (action === "saveGrade") {
        const g = DEMO.Grades.find((x) => x.id === p.id);
        const row = Object.assign({}, p, { updated_at: todayISO() });
        if (g) Object.assign(g, row); else DEMO.Grades.push(Object.assign({ id: uid() }, row));
        demoSave(); return ok(null, "Grade saved");
      }

      const m = action.match(/^(get|add|update|delete)(.+)$/);
      if (m) {
        const verb = m[1];
        const sheet = SHEET_OF[m[2]] || SHEET_OF[m[2] + "s"];
        if (!sheet) return fail("Unknown action: " + action);
        const rows = DEMO[sheet];
        if (verb === "get") return ok(rows.slice());
        if (verb === "add") { const row = Object.assign({ id: uid(), created_at: todayISO() }, p); rows.push(row); demoSave(); return ok(row, "Record added"); }
        if (verb === "update") {
          const i = rows.findIndex((r) => r.id === p.id);
          if (i === -1) return fail("Record not found");
          rows[i] = Object.assign({}, rows[i], p); demoSave(); return ok(rows[i], "Record updated");
        }
        if (verb === "delete") {
          const i = rows.findIndex((r) => r.id === p.id);
          if (i === -1) return fail("Record not found");
          rows.splice(i, 1); demoSave(); return ok(null, "Record deleted");
        }
      }
      return fail("Unknown action: " + action);
    }, 260);
  });
}

/* =========================================================
   STATE
========================================================= */
const state = {
  user: null,
  page: "dashboard",
  cache: {},
  search: {},
  filter: {},
};

const PAGES = {
  dashboard: { title: "Dashboard", icon: "🏠", roles: ["Admin", "Teacher", "Student"] },
  classinfo: { title: "Class_NW_B", icon: "🎓", roles: ["Admin", "Teacher", "Student"] },
  students: { title: "Students", icon: "👨‍🎓", roles: ["Admin", "Teacher"] },
  teachers: { title: "Teachers", icon: "👩‍🏫", roles: ["Admin"] },
  courses: { title: "Courses", icon: "📚", roles: ["Admin", "Teacher", "Student"] },
  schedule: { title: "Schedule", icon: "🗓️", roles: ["Admin", "Teacher", "Student"] },
  attendance: { title: "Attendance", icon: "✅", roles: ["Admin", "Teacher", "Student"] },
  assignments: { title: "Assignments", icon: "📝", roles: ["Admin", "Teacher", "Student"] },
  exams: { title: "Exams", icon: "🧪", roles: ["Admin", "Teacher", "Student"] },
  grades: { title: "Grades", icon: "📊", roles: ["Admin", "Teacher", "Student"] },
  announcements: { title: "Announcements", icon: "📢", roles: ["Admin", "Teacher", "Student"] },
  materials: { title: "Study Materials", icon: "📁", roles: ["Admin", "Teacher", "Student"] },
  profile: { title: "Profile", icon: "👤", roles: ["Admin", "Teacher", "Student"] },
  settings: { title: "Settings", icon: "⚙️", roles: ["Admin", "Teacher", "Student"] },
};

/* =========================================================
   AUTH
========================================================= */
async function loginUser(email, password) {
  const btn = $("loginBtn");
  const errBox = $("loginError");
  errBox.hidden = true;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { errBox.textContent = "Please enter a valid email address."; errBox.hidden = false; return; }
  if (!password || password.length < 4) { errBox.textContent = "Password must be at least 4 characters."; errBox.hidden = false; return; }

  btn.disabled = true; btn.textContent = "Signing in...";
  try {
    const user = await callApi("login", { email: email, password: password }, "POST");
    state.user = user;
    if ($("rememberMe").checked) localStorage.setItem("nwb_user", JSON.stringify(user));
    else sessionStorage.setItem("nwb_user", JSON.stringify(user));
    startApp();
    showSuccess("Welcome, " + user.name);
  } catch (e) {
    errBox.textContent = e.message || "Login failed";
    errBox.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = "Sign in";
  }
}
function logoutUser() {
  localStorage.removeItem("nwb_user");
  sessionStorage.removeItem("nwb_user");
  state.user = null; state.cache = {};
  $("app").hidden = true; $("loginScreen").hidden = false;
  showToast("You have been logged out");
}
function restoreSession() {
  const raw = localStorage.getItem("nwb_user") || sessionStorage.getItem("nwb_user");
  if (!raw) return false;
  try { state.user = JSON.parse(raw); return true; } catch (e) { return false; }
}

/* =========================================================
   SHELL
========================================================= */
function startApp() {
  $("loginScreen").hidden = true;
  $("app").hidden = false;
  const u = state.user;
  $("userName").textContent = u.name;
  $("userRole").textContent = u.role;
  $("userAvatar").textContent = (u.name || "U").charAt(0).toUpperCase();
  buildNav();
  navigate("dashboard");
}
function buildNav() {
  const nav = $("navMenu");
  nav.innerHTML = "";
  Object.keys(PAGES).forEach((key) => {
    const p = PAGES[key];
    if (p.roles.indexOf(state.user.role) === -1) return;
    const b = document.createElement("button");
    b.innerHTML = "<span>" + p.icon + "</span><span>" + esc(p.title) + "</span>";
    b.dataset.page = key;
    b.onclick = () => { navigate(key); closeSidebar(); };
    nav.appendChild(b);
  });
}
function navigate(page) {
  if (!PAGES[page] || PAGES[page].roles.indexOf(state.user.role) === -1) page = "dashboard";
  state.page = page;
  $("pageTitle").textContent = PAGES[page].title;
  Array.from($("navMenu").children).forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  const views = $("views");
  views.innerHTML = '<div class="empty">Loading...</div>';
  const map = {
    dashboard: loadDashboard, classinfo: loadClassInfo, students: loadStudents, teachers: loadTeachers,
    courses: loadCourses, schedule: loadSchedule, attendance: loadAttendance, assignments: loadAssignments,
    exams: loadExams, grades: loadGrades, announcements: loadAnnouncements, materials: loadStudyMaterials,
    profile: loadProfile, settings: loadSettings,
  };
  map[page]().catch(() => { views.innerHTML = '<div class="card empty">Could not load this page. Please try again.</div>'; });
}
function closeSidebar() { $("sidebar").classList.remove("open"); $("overlay").hidden = true; }

/* data cache */
async function getData(name, force) {
  if (!force && state.cache[name]) return state.cache[name];
  const data = await callApi("get" + name, {});
  state.cache[name] = Array.isArray(data) ? data : [];
  return state.cache[name];
}
function invalidate(name) { delete state.cache[name]; }

/* lookups */
const courseName = (courses, id) => { const c = courses.find((x) => x.id === id || x.course_code === id); return c ? c.course_code + " — " + c.course_name : "-"; };
const teacherName = (teachers, tid) => { const t = teachers.find((x) => x.teacher_id === tid || x.id === tid); return t ? t.name : "-"; };
const studentName = (students, sid) => { const s = students.find((x) => x.student_id === sid || x.id === sid); return s ? s.name : sid; };

/* =========================================================
   MODAL + FORMS
========================================================= */
function openModal(title, bodyHTML, buttons) {
  $("modalTitle").textContent = title;
  $("modalBody").innerHTML = bodyHTML;
  const foot = $("modalFoot");
  foot.innerHTML = "";
  (buttons || []).forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "btn " + (b.class || "btn-ghost");
    btn.textContent = b.label;
    btn.onclick = b.onClick;
    foot.appendChild(btn);
  });
  $("modal").hidden = false;
}
function closeModal() { $("modal").hidden = true; }

function fieldHTML(f, value) {
  const v = value == null ? "" : value;
  let input;
  if (f.type === "select") {
    input = '<select id="f_' + f.name + '">' + f.options.map((o) => {
      const val = typeof o === "string" ? o : o.value, lab = typeof o === "string" ? o : o.label;
      return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + esc(lab) + "</option>";
    }).join("") + "</select>";
  } else if (f.type === "textarea") {
    input = '<textarea id="f_' + f.name + '">' + esc(v) + "</textarea>";
  } else {
    input = '<input id="f_' + f.name + '" type="' + (f.type || "text") + '" value="' + esc(v) + '" />';
  }
  return '<div><label for="f_' + f.name + '">' + esc(f.label) + (f.required ? " *" : "") + "</label>" + input +
    '<div class="field-err" id="e_' + f.name + '"></div></div>';
}
function readForm(fields) {
  const out = {}; let valid = true;
  fields.forEach((f) => {
    const el = $("f_" + f.name);
    const err = $("e_" + f.name);
    const val = (el.value || "").trim();
    err.textContent = "";
    if (f.required && !val) { err.textContent = f.label + " is required"; valid = false; }
    else if (f.type === "email" && val && !/^\S+@\S+\.\S+$/.test(val)) { err.textContent = "Enter a valid email"; valid = false; }
    else if (f.type === "number" && val && isNaN(Number(val))) { err.textContent = "Enter a number"; valid = false; }
    out[f.name] = f.type === "number" ? Number(val || 0) : val;
  });
  return valid ? out : null;
}
function crudModal(opts) {
  // opts: {title, fields, record, sheet, onDone}
  openModal(opts.title, '<div class="form-grid">' + opts.fields.map((f) => fieldHTML(f, opts.record ? opts.record[f.name] : f.default)).join("") + "</div>", [
    { label: "Cancel", onClick: closeModal },
    {
      label: "Save", class: "btn-primary", onClick: async () => {
        const data = readForm(opts.fields);
        if (!data) return;
        try {
          if (opts.record) { data.id = opts.record.id; await callApi("update" + opts.sheet, data, "POST"); showSuccess("Updated successfully"); }
          else { await callApi("add" + opts.sheet, data, "POST"); showSuccess("Added successfully"); }
          closeModal(); invalidate(opts.sheet); navigate(state.page);
        } catch (e) { /* toast already shown */ }
      }
    },
  ]);
}
function confirmDelete(sheet, id, label) {
  openModal("Confirm delete", "<p>Are you sure you want to delete <strong>" + esc(label) + "</strong>? This cannot be undone.</p>", [
    { label: "Cancel", onClick: closeModal },
    {
      label: "Delete", class: "btn-danger", onClick: async () => {
        try { await callApi("delete" + sheet, { id: id }, "POST"); showSuccess("Deleted"); closeModal(); invalidate(sheet); navigate(state.page); }
        catch (e) { /* toast shown */ }
      }
    },
  ]);
}
function viewModal(title, pairs) {
  openModal(title, '<div class="kv">' + pairs.map((p) => "<div>" + esc(p[0]) + "</div><div>" + esc(p[1] || "-") + "</div>").join("") + "</div>",
    [{ label: "Close", class: "btn-primary", onClick: closeModal }]);
}

/* generic table renderer */
function tableHTML(columns, rows, rowRenderer) {
  if (!rows.length) return '<div class="card empty">No records found.</div>';
  return '<div class="table-wrap"><table><thead><tr>' + columns.map((c) => "<th>" + esc(c) + "</th>").join("") +
    "</tr></thead><tbody>" + rows.map(rowRenderer).join("") + "</tbody></table></div>";
}
function bindActions(root) {
  root.querySelectorAll("[data-act]").forEach((el) => {
    el.onclick = () => ACTIONS[el.dataset.act] && ACTIONS[el.dataset.act](el.dataset.id);
  });
}
const ACTIONS = {};

/* =========================================================
   DASHBOARD
========================================================= */
function statCard(label, value) {
  return '<div class="card stat"><span class="label">' + esc(label) + '</span><span class="value">' + esc(value) + "</span></div>";
}
function barChart(items) {
  const max = Math.max.apply(null, items.map((i) => i.value).concat([1]));
  return '<div class="bars">' + items.map((i) =>
    '<div class="bar-col"><span class="bar-val">' + i.value + '</span><div class="bar" style="height:' +
    Math.round((i.value / max) * 130) + 'px"></div><span class="bar-lab">' + esc(i.label) + "</span></div>").join("") + "</div>";
}
function donutChart(present, late, absent) {
  const total = present + late + absent || 1;
  const p = (present / total) * 360, l = (late / total) * 360;
  const style = "background:conic-gradient(#15803d 0deg " + p + "deg,#b45309 " + p + "deg " + (p + l) + "deg,#b91c1c " + (p + l) + "deg 360deg)";
  return '<div class="donut-row"><div class="donut" style="' + style + '"><span>' + Math.round((present / total) * 100) + '%</span></div>' +
    '<div class="legend"><span><i class="dot" style="background:#15803d"></i>Present: ' + present + "</span>" +
    '<span><i class="dot" style="background:#b45309"></i>Late: ' + late + "</span>" +
    '<span><i class="dot" style="background:#b91c1c"></i>Absent: ' + absent + "</span></div></div>";
}

async function loadDashboard() {
  const [students, teachers, courses, schedule, attendance, assignments, exams, grades, anns] = await Promise.all([
    getData("Students"), getData("Teachers"), getData("Courses"), getData("Schedule"),
    getData("Attendance"), getData("Assignments"), getData("Exams"), getData("Grades"), getData("Announcements"),
  ]);
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const todayClasses = schedule.filter((s) => s.day === dayName);
  const present = attendance.filter((a) => a.status === "Present").length;
  const late = attendance.filter((a) => a.status === "Late").length;
  const absent = attendance.filter((a) => a.status === "Absent").length;
  const rate = attendance.length ? Math.round(((present + late * 0.5) / attendance.length) * 100) : 0;
  const pending = assignments.filter((a) => new Date(a.due_date) >= new Date(todayISO())).length;
  const upcomingExams = exams.filter((e) => new Date(e.exam_date) >= new Date(todayISO()));

  const gradeBuckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  grades.forEach((g) => { gradeBuckets[letterGrade(totalScore(g))]++; });

  $("views").innerHTML =
    '<div class="grid stats">' +
    statCard("Total Students", students.length) +
    statCard("Total Teachers", teachers.length) +
    statCard("Total Courses", courses.length) +
    statCard("Today's Classes", todayClasses.length) +
    statCard("Attendance Rate", rate + "%") +
    statCard("Pending Assignments", pending) +
    statCard("Upcoming Exams", upcomingExams.length) +
    "</div><div class='spacer'></div>" +
    '<div class="grid cols2">' +
      '<div class="card"><h3>Attendance overview</h3><div class="spacer"></div>' + donutChart(present, late, absent) + "</div>" +
      '<div class="card"><h3>Grade distribution</h3>' + barChart(Object.keys(gradeBuckets).map((k) => ({ label: k, value: gradeBuckets[k] }))) + "</div>" +
    "</div><div class='spacer'></div>" +
    '<div class="grid cols3">' +
      '<div class="card"><h3>Recent announcements</h3><div class="spacer"></div><div class="list">' +
        (anns.slice(0, 3).map((a) => '<div class="list-item"><h4>' + esc(a.title) + "</h4><p>" + esc(a.content).slice(0, 110) + '...</p><div class="meta"><span>' + fmtDate(a.created_at) + "</span></div></div>").join("") || '<div class="empty">No announcements</div>') +
      "</div></div>" +
      '<div class="card"><h3>Today\'s classes (' + dayName + ")</h3><div class='spacer'></div><div class=\"list\">" +
        (todayClasses.map((s) => '<div class="list-item"><h4>' + esc(courseName(courses, s.course_id)) + "</h4><p>" + esc(s.start_time + " - " + s.end_time) + " · " + esc(s.room) + "</p></div>").join("") || '<div class="empty">No classes today</div>') +
      "</div></div>" +
      '<div class="card"><h3>Recent assignments</h3><div class="spacer"></div><div class="list">' +
        (assignments.slice(0, 3).map((a) => '<div class="list-item"><h4>' + esc(a.title) + "</h4><p>" + esc(courseName(courses, a.course_id)) + '</p><div class="meta"><span>Due ' + fmtDate(a.due_date) + "</span></div></div>").join("") || '<div class="empty">No assignments</div>') +
      "</div></div>" +
    "</div>";
}

async function loadClassInfo() {
  const [students, courses, teachers, schedule] = await Promise.all([getData("Students"), getData("Courses"), getData("Teachers"), getData("Schedule")]);
  $("views").innerHTML =
    '<div class="card"><h3>Class_NW_B</h3><p class="muted">Networking Department — Year 3 class group.</p>' +
    '<div class="kv"><div>Class code</div><div>NW_B</div><div>Students enrolled</div><div>' + students.filter((s) => s.class_name === "NW_B").length +
    "</div><div>Courses</div><div>" + courses.length + "</div><div>Instructors</div><div>" + teachers.length +
    "</div><div>Weekly sessions</div><div>" + schedule.length + "</div></div></div><div class='spacer'></div>" +
    '<div class="grid cols3">' + courses.map((c) =>
      '<div class="card"><h4>' + esc(c.course_code) + " — " + esc(c.course_name) + '</h4><p class="muted">' + esc(c.description) +
      '</p><div class="spacer"></div><span class="badge info">' + esc(teacherName(teachers, c.teacher_id)) + "</span></div>").join("") + "</div>";
}

/* =========================================================
   STUDENTS
========================================================= */
const STUDENT_FIELDS = [
  { name: "student_id", label: "Student ID", required: true },
  { name: "name", label: "Full name", required: true },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { name: "date_of_birth", label: "Date of birth", type: "date" },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address" },
  { name: "year", label: "Year", type: "select", options: ["Year 1", "Year 2", "Year 3", "Year 4"], default: "Year 3" },
  { name: "class_name", label: "Class", default: "NW_B" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  { name: "photo", label: "Photo URL" },
];

async function loadStudents() {
  const students = await getData("Students");
  const q = (state.search.students || "").toLowerCase();
  const fy = state.filter.studentsYear || "";
  const fs = state.filter.studentsStatus || "";
  const rows = students.filter((s) =>
    (!q || (s.name + s.student_id + s.email).toLowerCase().includes(q)) &&
    (!fy || s.year === fy) && (!fs || s.status === fs)
  );
  const canEdit = state.user.role === "Admin";
  $("views").innerHTML =
    '<div class="section-head"><div><h3>Student Management</h3><span class="muted">' + rows.length + " of " + students.length + " students</span></div>' +
    (canEdit ? '<button class="btn btn-primary" data-act="addStudent">+ Add Student</button>' : "") + "</div>" +
    '<div class="toolbar"><input id="q" placeholder="Search name, ID or email" value="' + esc(state.search.students || "") + '" />' +
    '<select id="fy"><option value="">All years</option>' + ["Year 1", "Year 2", "Year 3", "Year 4"].map((y) => '<option' + (fy === y ? " selected" : "") + ">" + y + "</option>").join("") + "</select>" +
    '<select id="fs"><option value="">All status</option><option' + (fs === "Active" ? " selected" : "") + ">Active</option><option" + (fs === "Inactive" ? " selected" : "") + ">Inactive</option></select>" +
    '<button class="btn btn-ghost" data-act="clearStudentFilters">Reset</button></div>' +
    tableHTML(["Student ID", "Name", "Gender", "Email", "Phone", "Year", "Class", "Status", "Actions"], rows, (s) =>
      "<tr><td>" + esc(s.student_id) + "</td><td>" + esc(s.name) + "</td><td>" + esc(s.gender) + "</td><td>" + esc(s.email) +
      "</td><td>" + esc(s.phone) + "</td><td>" + esc(s.year) + "</td><td>" + esc(s.class_name) + '</td><td><span class="badge ' +
      (s.status === "Active" ? "ok" : "no") + '">' + esc(s.status) + '</span></td><td><div class="actions">' +
      '<button class="btn btn-sm btn-ghost" data-act="viewStudent" data-id="' + s.id + '">View</button>' +
      (canEdit ? '<button class="btn btn-sm btn-dark" data-act="editStudent" data-id="' + s.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-act="delStudent" data-id="' + s.id + '">Delete</button>' : "") +
      "</div></td></tr>");
  const v = $("views");
  $("q").oninput = (e) => { state.search.students = e.target.value; renderDebounced(); };
  $("fy").onchange = (e) => { state.filter.studentsYear = e.target.value; loadStudents(); };
  $("fs").onchange = (e) => { state.filter.studentsStatus = e.target.value; loadStudents(); };
  bindActions(v);
  const inp = $("q"); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
}
let debounceTimer;
function renderDebounced() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => navigate(state.page), 250); }

ACTIONS.addStudent = () => crudModal({ title: "Add Student", fields: STUDENT_FIELDS, sheet: "Students" });
ACTIONS.editStudent = (id) => crudModal({ title: "Edit Student", fields: STUDENT_FIELDS, sheet: "Students", record: state.cache.Students.find((s) => s.id === id) });
ACTIONS.delStudent = (id) => { const s = state.cache.Students.find((x) => x.id === id); confirmDelete("Students", id, s.name); };
ACTIONS.viewStudent = (id) => {
  const s = state.cache.Students.find((x) => x.id === id);
  viewModal("Student: " + s.name, [["Student ID", s.student_id], ["Name", s.name], ["Gender", s.gender], ["Date of birth", s.date_of_birth],
  ["Email", s.email], ["Phone", s.phone], ["Address", s.address], ["Year", s.year], ["Class", s.class_name], ["Status", s.status], ["Registered", fmtDate(s.created_at)]]);
};
ACTIONS.clearStudentFilters = () => { state.search.students = ""; state.filter.studentsYear = ""; state.filter.studentsStatus = ""; loadStudents(); };

/* =========================================================
   TEACHERS
========================================================= */
const TEACHER_FIELDS = [
  { name: "teacher_id", label: "Teacher ID", required: true },
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone" },
  { name: "department", label: "Department" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
];
async function loadTeachers() {
  const teachers = await getData("Teachers");
  const q = (state.search.teachers || "").toLowerCase();
  const rows = teachers.filter((t) => !q || (t.name + t.teacher_id + t.email + t.department).toLowerCase().includes(q));
  $("views").innerHTML =
    '<div class="section-head"><h3>Teacher Management</h3><button class="btn btn-primary" data-act="addTeacher">+ Add Teacher</button></div>' +
    '<div class="toolbar"><input id="q" placeholder="Search teachers" value="' + esc(state.search.teachers || "") + '" /></div>' +
    tableHTML(["Teacher ID", "Name", "Email", "Phone", "Department", "Status", "Actions"], rows, (t) =>
      "<tr><td>" + esc(t.teacher_id) + "</td><td>" + esc(t.name) + "</td><td>" + esc(t.email) + "</td><td>" + esc(t.phone) +
      "</td><td>" + esc(t.department) + '</td><td><span class="badge ' + (t.status === "Active" ? "ok" : "no") + '">' + esc(t.status) +
      '</span></td><td><div class="actions"><button class="btn btn-sm btn-ghost" data-act="viewTeacher" data-id="' + t.id + '">View</button>' +
      '<button class="btn btn-sm btn-dark" data-act="editTeacher" data-id="' + t.id + '">Edit</button>' +
      '<button class="btn btn-sm btn-danger" data-act="delTeacher" data-id="' + t.id + '">Delete</button></div></td></tr>');
  $("q").oninput = (e) => { state.search.teachers = e.target.value; renderDebounced(); };
  bindActions($("views"));
  const inp = $("q"); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
}
ACTIONS.addTeacher = () => crudModal({ title: "Add Teacher", fields: TEACHER_FIELDS, sheet: "Teachers" });
ACTIONS.editTeacher = (id) => crudModal({ title: "Edit Teacher", fields: TEACHER_FIELDS, sheet: "Teachers", record: state.cache.Teachers.find((t) => t.id === id) });
ACTIONS.delTeacher = (id) => { const t = state.cache.Teachers.find((x) => x.id === id); confirmDelete("Teachers", id, t.name); };
ACTIONS.viewTeacher = (id) => {
  const t = state.cache.Teachers.find((x) => x.id === id);
  viewModal("Teacher: " + t.name, [["Teacher ID", t.teacher_id], ["Name", t.name], ["Email", t.email], ["Phone", t.phone], ["Department", t.department], ["Status", t.status], ["Joined", fmtDate(t.created_at)]]);
};

/* =========================================================
   COURSES
========================================================= */
async function loadCourses() {
  const [courses, teachers] = await Promise.all([getData("Courses"), getData("Teachers")]);
  const q = (state.search.courses || "").toLowerCase();
  const rows = courses.filter((c) => !q || (c.course_code + c.course_name + c.semester).toLowerCase().includes(q));
  const canEdit = state.user.role !== "Student";
  const fields = [
    { name: "course_code", label: "Course code", required: true },
    { name: "course_name", label: "Course name", required: true },
    { name: "teacher_id", label: "Teacher", type: "select", options: teachers.map((t) => ({ value: t.teacher_id, label: t.name })) },
    { name: "credits", label: "Credits", type: "number", default: 3 },
    { name: "semester", label: "Semester", type: "select", options: ["Semester 1", "Semester 2"] },
    { name: "description", label: "Description", type: "textarea" },
  ];
  ACTIONS.addCourse = () => crudModal({ title: "Add Course", fields: fields, sheet: "Courses" });
  ACTIONS.editCourse = (id) => crudModal({ title: "Edit Course", fields: fields, sheet: "Courses", record: courses.find((c) => c.id === id) });
  ACTIONS.delCourse = (id) => confirmDelete("Courses", id, courses.find((c) => c.id === id).course_name);

  $("views").innerHTML =
    '<div class="section-head"><h3>Courses</h3>' + (canEdit ? '<button class="btn btn-primary" data-act="addCourse">+ Add Course</button>' : "") + "</div>" +
    '<div class="toolbar"><input id="q" placeholder="Search courses" value="' + esc(state.search.courses || "") + '" /></div>' +
    tableHTML(["Code", "Course Name", "Teacher", "Credits", "Semester"].concat(canEdit ? ["Actions"] : []), rows, (c) =>
      "<tr><td>" + esc(c.course_code) + "</td><td>" + esc(c.course_name) + "</td><td>" + esc(teacherName(teachers, c.teacher_id)) +
      "</td><td>" + esc(c.credits) + "</td><td>" + esc(c.semester) + "</td>" +
      (canEdit ? '<td><div class="actions"><button class="btn btn-sm btn-dark" data-act="editCourse" data-id="' + c.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-act="delCourse" data-id="' + c.id + '">Delete</button></div></td>' : "") + "</tr>");
  $("q").oninput = (e) => { state.search.courses = e.target.value; renderDebounced(); };
  bindActions($("views"));
  const inp = $("q"); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
}

/* =========================================================
   SCHEDULE
========================================================= */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
async function loadSchedule() {
  const [schedule, courses, teachers] = await Promise.all([getData("Schedule"), getData("Courses"), getData("Teachers")]);
  const canEdit = state.user.role !== "Student";
  const fields = [
    { name: "course_id", label: "Course", type: "select", options: courses.map((c) => ({ value: c.id, label: c.course_code + " — " + c.course_name })), required: true },
    { name: "day", label: "Day", type: "select", options: DAYS },
    { name: "start_time", label: "Start time", type: "time", default: "08:00" },
    { name: "end_time", label: "End time", type: "time", default: "10:00" },
    { name: "room", label: "Room", required: true },
    { name: "teacher_id", label: "Teacher", type: "select", options: teachers.map((t) => ({ value: t.teacher_id, label: t.name })) },
  ];
  ACTIONS.addSlot = () => crudModal({ title: "Add Class Session", fields: fields, sheet: "Schedule" });
  ACTIONS.editSlot = (id) => crudModal({ title: "Edit Class Session", fields: fields, sheet: "Schedule", record: schedule.find((s) => s.id === id) });
  ACTIONS.delSlot = (id) => confirmDelete("Schedule", id, "this class session");

  $("views").innerHTML =
    '<div class="section-head"><h3>Weekly Timetable</h3>' + (canEdit ? '<button class="btn btn-primary" data-act="addSlot">+ Add Session</button>' : "") + "</div>" +
    '<div class="timetable">' + DAYS.map((d) => {
      const slots = schedule.filter((s) => s.day === d).sort((a, b) => a.start_time.localeCompare(b.start_time));
      return '<div class="day-col"><h4>' + d + '</h4><div class="slots">' +
        (slots.map((s) => '<div class="slot"><strong>' + esc(courseName(courses, s.course_id)) + "</strong><small>" +
          esc(s.start_time + " - " + s.end_time) + " · " + esc(s.room) + "</small><small>" + esc(teacherName(teachers, s.teacher_id)) + "</small>" +
          (canEdit ? '<div class="actions" style="margin-top:6px"><button class="btn btn-sm btn-ghost" data-act="editSlot" data-id="' + s.id + '">Edit</button>' +
            '<button class="btn btn-sm btn-danger" data-act="delSlot" data-id="' + s.id + '">Delete</button></div>' : "") + "</div>").join("") ||
          '<span class="muted" style="font-size:13px">No classes</span>') + "</div></div>";
    }).join("") + "</div>";
  bindActions($("views"));
}

/* =========================================================
   ATTENDANCE
========================================================= */
async function loadAttendance() {
  const [attendance, students, courses] = await Promise.all([getData("Attendance"), getData("Students"), getData("Courses")]);
  if (state.user.role === "Student") {
    const sid = state.user.student_id;
    const mine = attendance.filter((a) => a.student_id === sid);
    const p = mine.filter((a) => a.status === "Present").length;
    const l = mine.filter((a) => a.status === "Late").length;
    const ab = mine.filter((a) => a.status === "Absent").length;
    const pct = mine.length ? Math.round(((p + l * 0.5) / mine.length) * 100) : 0;
    $("views").innerHTML =
      '<div class="grid stats">' + statCard("Present", p) + statCard("Late", l) + statCard("Absent", ab) + statCard("Attendance %", pct + "%") + "</div><div class='spacer'></div>" +
      tableHTML(["Date", "Course", "Status"], mine.sort((a, b) => b.date.localeCompare(a.date)), (a) =>
        "<tr><td>" + fmtDate(a.date) + "</td><td>" + esc(courseName(courses, a.course_id)) + '</td><td><span class="badge ' +
        (a.status === "Present" ? "ok" : a.status === "Late" ? "warn" : "no") + '">' + esc(a.status) + "</span></td></tr>");
    return;
  }

  const courseId = state.filter.attCourse || (courses[0] && courses[0].id);
  const date = state.filter.attDate || todayISO();
  const list = students.filter((s) => s.status === "Active");
  const existing = {};
  attendance.filter((a) => a.course_id === courseId && a.date === date).forEach((a) => { existing[a.student_id] = a.status; });

  $("views").innerHTML =
    '<div class="section-head"><h3>Mark Attendance</h3><button class="btn btn-primary" id="saveAtt">Save Attendance</button></div>' +
    '<div class="toolbar"><select id="ac">' + courses.map((c) => '<option value="' + c.id + '"' + (c.id === courseId ? " selected" : "") + ">" + esc(c.course_code + " — " + c.course_name) + "</option>").join("") + "</select>" +
    '<input type="date" id="ad" value="' + date + '" />' +
    '<button class="btn btn-ghost" id="allPresent">Mark all present</button></div>' +
    tableHTML(["Student ID", "Name", "Status"], list, (s) =>
      "<tr><td>" + esc(s.student_id) + "</td><td>" + esc(s.name) + '</td><td><select class="attsel" data-sid="' + esc(s.student_id) + '">' +
      ["Present", "Absent", "Late"].map((st) => "<option" + (existing[s.student_id] === st ? " selected" : "") + ">" + st + "</option>").join("") + "</select></td></tr>");

  $("ac").onchange = (e) => { state.filter.attCourse = e.target.value; loadAttendance(); };
  $("ad").onchange = (e) => { state.filter.attDate = e.target.value; loadAttendance(); };
  $("allPresent").onclick = () => { document.querySelectorAll(".attsel").forEach((s) => (s.value = "Present")); showToast("All marked present — remember to save"); };
  $("saveAtt").onclick = () => saveAttendance(courseId, date);
}
async function saveAttendance(courseId, date) {
  const records = Array.from(document.querySelectorAll(".attsel")).map((s) => ({ student_id: s.dataset.sid, status: s.value }));
  if (!records.length) return showError("No students to save");
  try {
    await callApi("saveAttendance", { course_id: courseId, date: date, marked_by: state.user.teacher_id || state.user.id, records: records }, "POST");
    showSuccess("Attendance saved for " + fmtDate(date));
    invalidate("Attendance"); loadAttendance();
  } catch (e) { /* toast shown */ }
}

/* =========================================================
   ASSIGNMENTS
========================================================= */
async function loadAssignments() {
  const [assignments, courses] = await Promise.all([getData("Assignments"), getData("Courses")]);
  const canEdit = state.user.role !== "Student";
  const q = (state.search.assignments || "").toLowerCase();
  const rows = assignments.filter((a) => !q || (a.title + a.description).toLowerCase().includes(q));
  const fields = [
    { name: "title", label: "Title", required: true },
    { name: "course_id", label: "Course", type: "select", options: courses.map((c) => ({ value: c.id, label: c.course_code + " — " + c.course_name })) },
    { name: "due_date", label: "Due date", type: "date", required: true },
    { name: "file_url", label: "Google Drive file URL" },
    { name: "description", label: "Description", type: "textarea", required: true },
  ];
  ACTIONS.addAsg = () => crudModal({ title: "Add Assignment", fields: fields, sheet: "Assignments" });
  ACTIONS.editAsg = (id) => crudModal({ title: "Edit Assignment", fields: fields, sheet: "Assignments", record: assignments.find((a) => a.id === id) });
  ACTIONS.delAsg = (id) => confirmDelete("Assignments", id, assignments.find((a) => a.id === id).title);

  $("views").innerHTML =
    '<div class="section-head"><h3>Assignments</h3>' + (canEdit ? '<button class="btn btn-primary" data-act="addAsg">+ Add Assignment</button>' : "") + "</div>" +
    '<div class="toolbar"><input id="q" placeholder="Search assignments" value="' + esc(state.search.assignments || "") + '" /></div>' +
    (rows.length ? '<div class="grid cols2">' + rows.map((a) => {
      const overdue = new Date(a.due_date) < new Date(todayISO());
      return '<div class="card"><div class="section-head" style="margin:0"><h4>' + esc(a.title) + '</h4><span class="badge ' + (overdue ? "no" : "ok") + '">' +
        (overdue ? "Closed" : "Open") + '</span></div><p class="muted">' + esc(a.description) + '</p><div class="meta muted" style="font-size:12.5px;margin-top:8px">' +
        esc(courseName(courses, a.course_id)) + " · Due " + fmtDate(a.due_date) + '</div><div class="actions" style="margin-top:12px">' +
        (a.file_url ? '<a class="btn btn-sm btn-ghost" href="' + esc(a.file_url) + '" target="_blank" rel="noopener">Open file</a>' : "") +
        (canEdit ? '<button class="btn btn-sm btn-dark" data-act="editAsg" data-id="' + a.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-act="delAsg" data-id="' + a.id + '">Delete</button>' : "") + "</div></div>";
    }).join("") + "</div>" : '<div class="card empty">No assignments found.</div>');
  $("q").oninput = (e) => { state.search.assignments = e.target.value; renderDebounced(); };
  bindActions($("views"));
}

/* =========================================================
   EXAMS
========================================================= */
async function loadExams() {
  const [exams, courses] = await Promise.all([getData("Exams"), getData("Courses")]);
  const canEdit = state.user.role !== "Student";
  const fields = [
    { name: "title", label: "Exam title", required: true },
    { name: "course_id", label: "Course", type: "select", options: courses.map((c) => ({ value: c.id, label: c.course_code + " — " + c.course_name })) },
    { name: "exam_date", label: "Date", type: "date", required: true },
    { name: "start_time", label: "Start time", type: "time", default: "08:00" },
    { name: "duration", label: "Duration", default: "90 min" },
    { name: "room", label: "Room", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ];
  ACTIONS.addExam = () => crudModal({ title: "Add Exam", fields: fields, sheet: "Exams" });
  ACTIONS.editExam = (id) => crudModal({ title: "Edit Exam", fields: fields, sheet: "Exams", record: exams.find((e) => e.id === id) });
  ACTIONS.delExam = (id) => confirmDelete("Exams", id, exams.find((e) => e.id === id).title);

  const sorted = exams.slice().sort((a, b) => a.exam_date.localeCompare(b.exam_date));
  $("views").innerHTML =
    '<div class="section-head"><h3>Exam Schedule</h3>' + (canEdit ? '<button class="btn btn-primary" data-act="addExam">+ Add Exam</button>' : "") + "</div>" +
    tableHTML(["Title", "Course", "Date", "Start", "Duration", "Room"].concat(canEdit ? ["Actions"] : []), sorted, (e) =>
      "<tr><td>" + esc(e.title) + "</td><td>" + esc(courseName(courses, e.course_id)) + "</td><td>" + fmtDate(e.exam_date) +
      "</td><td>" + esc(e.start_time) + "</td><td>" + esc(e.duration) + "</td><td>" + esc(e.room) + "</td>" +
      (canEdit ? '<td><div class="actions"><button class="btn btn-sm btn-dark" data-act="editExam" data-id="' + e.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-act="delExam" data-id="' + e.id + '">Delete</button></div></td>' : "") + "</tr>");
  bindActions($("views"));
}

/* =========================================================
   GRADES
========================================================= */
function totalScore(g) {
  return Number(g.assignment_score || 0) + Number(g.attendance_score || 0) + Number(g.midterm_score || 0) + Number(g.final_score || 0);
}
function letterGrade(total) {
  if (total >= 90) return "A"; if (total >= 80) return "B"; if (total >= 70) return "C"; if (total >= 60) return "D"; return "F";
}
function gradePoint(letter) { return { A: 4, B: 3, C: 2, D: 1, F: 0 }[letter]; }

async function loadGrades() {
  const [grades, courses, students] = await Promise.all([getData("Grades"), getData("Courses"), getData("Students")]);
  const isStudent = state.user.role === "Student";
  const rows = isStudent ? grades.filter((g) => g.student_id === state.user.student_id) : grades;
  const totals = rows.map((g) => totalScore(g));
  const avg = totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
  const gpa = rows.length ? (rows.reduce((a, g) => a + gradePoint(letterGrade(totalScore(g))), 0) / rows.length).toFixed(2) : "0.00";

  const fields = [
    { name: "student_id", label: "Student", type: "select", options: students.map((s) => ({ value: s.student_id, label: s.student_id + " — " + s.name })) },
    { name: "course_id", label: "Course", type: "select", options: courses.map((c) => ({ value: c.id, label: c.course_code + " — " + c.course_name })) },
    { name: "assignment_score", label: "Assignment (20)", type: "number" },
    { name: "attendance_score", label: "Attendance (10)", type: "number" },
    { name: "midterm_score", label: "Midterm (30)", type: "number" },
    { name: "final_score", label: "Final (40)", type: "number" },
  ];
  ACTIONS.addGrade = () => gradeModal(fields, null);
  ACTIONS.editGrade = (id) => gradeModal(fields, grades.find((g) => g.id === id));
  ACTIONS.delGrade = (id) => confirmDelete("Grades", id, "this grade record");

  $("views").innerHTML =
    '<div class="grid stats">' + statCard("Records", rows.length) + statCard("Average total", avg) + statCard("GPA", gpa) + "</div><div class='spacer'></div>" +
    '<div class="section-head"><h3>Grades</h3>' + (!isStudent ? '<button class="btn btn-primary" data-act="addGrade">+ Add Grade</button>' : "") + "</div>" +
    tableHTML((isStudent ? [] : ["Student"]).concat(["Course", "Assignment", "Attendance", "Midterm", "Final", "Total", "Grade"]).concat(isStudent ? [] : ["Actions"]), rows, (g) => {
      const t = totalScore(g), l = letterGrade(t);
      return "<tr>" + (isStudent ? "" : "<td>" + esc(studentName(students, g.student_id)) + "</td>") +
        "<td>" + esc(courseName(courses, g.course_id)) + "</td><td>" + esc(g.assignment_score) + "</td><td>" + esc(g.attendance_score) +
        "</td><td>" + esc(g.midterm_score) + "</td><td>" + esc(g.final_score) + "</td><td><strong>" + t + '</strong></td><td><span class="badge ' +
        (l === "F" ? "no" : l === "D" ? "warn" : "ok") + '">' + l + "</span></td>" +
        (isStudent ? "" : '<td><div class="actions"><button class="btn btn-sm btn-dark" data-act="editGrade" data-id="' + g.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-act="delGrade" data-id="' + g.id + '">Delete</button></div></td>') + "</tr>";
    });
  bindActions($("views"));
}
function gradeModal(fields, record) {
  openModal(record ? "Edit Grade" : "Add Grade", '<div class="form-grid">' + fields.map((f) => fieldHTML(f, record ? record[f.name] : "")).join("") + "</div>", [
    { label: "Cancel", onClick: closeModal },
    {
      label: "Save", class: "btn-primary", onClick: async () => {
        const data = readForm(fields);
        if (!data) return;
        if (record) data.id = record.id;
        try { await callApi("saveGrade", data, "POST"); showSuccess("Grade saved"); closeModal(); invalidate("Grades"); loadGrades(); }
        catch (e) { /* toast shown */ }
      }
    },
  ]);
}

/* =========================================================
   ANNOUNCEMENTS
========================================================= */
async function loadAnnouncements() {
  const anns = await getData("Announcements");
  const canEdit = state.user.role !== "Student";
  const q = (state.search.anns || "").toLowerCase();
  const rows = anns.filter((a) => !q || (a.title + a.content).toLowerCase().includes(q)).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const fields = [
    { name: "title", label: "Title", required: true },
    { name: "image_url", label: "Image URL" },
    { name: "content", label: "Content", type: "textarea", required: true },
  ];
  ACTIONS.addAnn = () => crudModal({ title: "New Announcement", fields: fields.concat([{ name: "author_id", label: "Author ID", default: state.user.id }]), sheet: "Announcements" });
  ACTIONS.editAnn = (id) => crudModal({ title: "Edit Announcement", fields: fields, sheet: "Announcements", record: anns.find((a) => a.id === id) });
  ACTIONS.delAnn = (id) => confirmDelete("Announcements", id, anns.find((a) => a.id === id).title);

  $("views").innerHTML =
    '<div class="section-head"><h3>Announcements</h3>' + (canEdit ? '<button class="btn btn-primary" data-act="addAnn">+ New Announcement</button>' : "") + "</div>" +
    '<div class="toolbar"><input id="q" placeholder="Search announcements" value="' + esc(state.search.anns || "") + '" /></div>' +
    (rows.length ? '<div class="list">' + rows.map((a) =>
      '<div class="list-item"><h4>' + esc(a.title) + "</h4><p>" + esc(a.content) + '</p><div class="meta"><span>Posted ' + fmtDate(a.created_at) + "</span>" +
      (a.image_url ? '<a href="' + esc(a.image_url) + '" target="_blank" rel="noopener">View image</a>' : "") + "</div>" +
      (canEdit ? '<div class="actions" style="margin-top:10px"><button class="btn btn-sm btn-dark" data-act="editAnn" data-id="' + a.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-act="delAnn" data-id="' + a.id + '">Delete</button></div>' : "") + "</div>").join("") + "</div>"
      : '<div class="card empty">No announcements yet.</div>');
  $("q").oninput = (e) => { state.search.anns = e.target.value; renderDebounced(); };
  bindActions($("views"));
}

/* =========================================================
   STUDY MATERIALS
========================================================= */
const CATEGORIES = ["Networking", "Cisco", "Linux", "Security", "Routing", "Switching", "Wireless"];
async function loadStudyMaterials() {
  const [mats, courses] = await Promise.all([getData("StudyMaterials"), getData("Courses")]);
  const canEdit = state.user.role !== "Student";
  const q = (state.search.mats || "").toLowerCase();
  const cat = state.filter.matCat || "";
  const rows = mats.filter((m) => (!q || (m.title + m.description).toLowerCase().includes(q)) && (!cat || m.category === cat));
  const fields = [
    { name: "title", label: "Title", required: true },
    { name: "course_id", label: "Course", type: "select", options: courses.map((c) => ({ value: c.id, label: c.course_code + " — " + c.course_name })) },
    { name: "category", label: "Category", type: "select", options: CATEGORIES },
    { name: "file_url", label: "Google Drive URL", required: true },
    { name: "uploaded_by", label: "Uploaded by", default: state.user.teacher_id || state.user.name },
    { name: "description", label: "Description", type: "textarea" },
  ];
  ACTIONS.addMat = () => crudModal({ title: "Add Study Material", fields: fields, sheet: "StudyMaterials" });
  ACTIONS.editMat = (id) => crudModal({ title: "Edit Study Material", fields: fields, sheet: "StudyMaterials", record: mats.find((m) => m.id === id) });
  ACTIONS.delMat = (id) => confirmDelete("StudyMaterials", id, mats.find((m) => m.id === id).title);

  $("views").innerHTML =
    '<div class="section-head"><h3>Study Materials</h3>' + (canEdit ? '<button class="btn btn-primary" data-act="addMat">+ Add Material</button>' : "") + "</div>" +
    '<div class="toolbar"><input id="q" placeholder="Search materials" value="' + esc(state.search.mats || "") + '" />' +
    '<select id="mc"><option value="">All categories</option>' + CATEGORIES.map((c) => "<option" + (cat === c ? " selected" : "") + ">" + c + "</option>").join("") + "</select></div>" +
    (rows.length ? '<div class="grid cols3">' + rows.map((m) =>
      '<div class="card"><span class="badge info">' + esc(m.category) + "</span><h4 style=\"margin-top:8px\">" + esc(m.title) + '</h4><p class="muted">' + esc(m.description) +
      '</p><div class="meta muted" style="font-size:12.5px;margin-top:8px">' + esc(courseName(courses, m.course_id)) + " · " + fmtDate(m.created_at) + "</div>" +
      '<div class="actions" style="margin-top:12px"><a class="btn btn-sm btn-primary" href="' + esc(m.file_url) + '" target="_blank" rel="noopener">Open / Download</a>' +
      (canEdit ? '<button class="btn btn-sm btn-dark" data-act="editMat" data-id="' + m.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-danger" data-act="delMat" data-id="' + m.id + '">Delete</button>' : "") + "</div></div>").join("") + "</div>"
      : '<div class="card empty">No materials found.</div>');
  $("q").oninput = (e) => { state.search.mats = e.target.value; renderDebounced(); };
  $("mc").onchange = (e) => { state.filter.matCat = e.target.value; loadStudyMaterials(); };
  bindActions($("views"));
}

/* =========================================================
   PROFILE & SETTINGS
========================================================= */
async function loadProfile() {
  const u = state.user;
  const students = await getData("Students");
  const me = students.find((s) => s.student_id === u.student_id);
  $("views").innerHTML =
    '<div class="card"><div class="profile-top">' +
    (me && me.photo ? '<img class="profile-photo" src="' + esc(me.photo) + '" alt="' + esc(u.name) + '" />' : '<div class="profile-photo">' + esc((u.name || "U").charAt(0)) + "</div>") +
    "<div><h3>" + esc(u.name) + '</h3><p class="muted">' + esc(u.email) + '</p><span class="badge info">' + esc(u.role) + "</span></div></div>" +
    '<div class="kv"><div>Email</div><div>' + esc(u.email) + "</div><div>Role</div><div>" + esc(u.role) + "</div>" +
    (u.student_id ? "<div>Student ID</div><div>" + esc(u.student_id) + "</div>" : "") +
    (u.teacher_id ? "<div>Teacher ID</div><div>" + esc(u.teacher_id) + "</div>" : "") +
    (me ? "<div>Class</div><div>" + esc(me.class_name) + "</div><div>Year</div><div>" + esc(me.year) + "</div><div>Phone</div><div>" + esc(me.phone) + "</div>" : "") +
    '</div><div class="actions" style="margin-top:16px">' +
    '<button class="btn btn-primary" data-act="editProfile">Edit profile</button>' +
    '<button class="btn btn-ghost" data-act="changePw">Change password</button></div></div>';
  bindActions($("views"));
}
ACTIONS.editProfile = () => {
  const fields = [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone" },
  ];
  openModal("Edit profile", '<div class="form-grid">' + fields.map((f) => fieldHTML(f, state.user[f.name])).join("") + "</div>", [
    { label: "Cancel", onClick: closeModal },
    {
      label: "Save", class: "btn-primary", onClick: async () => {
        const data = readForm(fields);
        if (!data) return;
        try {
          await callApi("updateProfile", Object.assign({ user_id: state.user.id }, data), "POST");
          state.user = Object.assign({}, state.user, data);
          (localStorage.getItem("nwb_user") ? localStorage : sessionStorage).setItem("nwb_user", JSON.stringify(state.user));
          $("userName").textContent = state.user.name;
          showSuccess("Profile updated"); closeModal(); invalidate("Students"); loadProfile();
        } catch (e) { /* toast shown */ }
      }
    },
  ]);
};
ACTIONS.changePw = () => {
  const fields = [
    { name: "old_password", label: "Current password", type: "password", required: true },
    { name: "new_password", label: "New password", type: "password", required: true },
    { name: "confirm", label: "Confirm new password", type: "password", required: true },
  ];
  openModal("Change password", '<div class="form-grid">' + fields.map((f) => fieldHTML(f, "")).join("") + "</div>", [
    { label: "Cancel", onClick: closeModal },
    {
      label: "Update", class: "btn-primary", onClick: async () => {
        const data = readForm(fields);
        if (!data) return;
        if (data.new_password.length < 6) return ($("e_new_password").textContent = "Use at least 6 characters");
        if (data.new_password !== data.confirm) return ($("e_confirm").textContent = "Passwords do not match");
        try {
          await callApi("changePassword", { user_id: state.user.id, old_password: data.old_password, new_password: data.new_password }, "POST");
          showSuccess("Password updated"); closeModal();
        } catch (e) { /* toast shown */ }
      }
    },
  ]);
};

async function loadSettings() {
  $("views").innerHTML =
    '<div class="card"><h3>Appearance</h3><p class="muted">Choose how Class_NW_B looks on this device.</p>' +
    '<div class="actions" style="margin-top:12px"><button class="btn btn-ghost" data-act="setLight">Light mode</button>' +
    '<button class="btn btn-dark" data-act="setDark">Dark mode</button></div></div><div class="spacer"></div>' +
    '<div class="card"><h3>Backend connection</h3><div class="kv"><div>API mode</div><div>' +
    (USE_DEMO ? "Demo data (no Apps Script URL set)" : "Google Apps Script") + "</div><div>API URL</div><div>" + esc(USE_DEMO ? "—" : API_URL) +
    "</div><div>Database</div><div>Google Sheets</div></div>" +
    '<p class="muted" style="margin-top:12px">Paste your Apps Script Web App URL into <code>API_URL</code> at the top of script.js to switch to live data.</p></div>' +
    '<div class="spacer"></div><div class="card"><h3>Session</h3><div class="actions" style="margin-top:10px">' +
    '<button class="btn btn-ghost" data-act="clearCache">Refresh data</button>' +
    '<button class="btn btn-danger" data-act="doLogout">Logout</button></div></div>';
  bindActions($("views"));
}
ACTIONS.setLight = () => setTheme("light");
ACTIONS.setDark = () => setTheme("dark");
ACTIONS.clearCache = () => { state.cache = {}; showSuccess("Data refreshed"); navigate(state.page); };
ACTIONS.doLogout = () => logoutUser();

/* =========================================================
   THEME + GLOBAL EVENTS
========================================================= */
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("nwb_theme", t);
  $("themeBtn").textContent = t === "dark" ? "☀️" : "🌙";
}

document.addEventListener("DOMContentLoaded", () => {
  demoLoad();
  setTheme(localStorage.getItem("nwb_theme") || "light");

  $("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    loginUser($("loginEmail").value.trim(), $("loginPassword").value);
  });
  $("togglePw").onclick = () => {
    const i = $("loginPassword");
    const show = i.type === "password";
    i.type = show ? "text" : "password";
    $("togglePw").textContent = show ? "Hide" : "Show";
  };
  $("logoutBtn").onclick = logoutUser;
  $("themeBtn").onclick = () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  $("menuBtn").onclick = () => { $("sidebar").classList.toggle("open"); $("overlay").hidden = !$("sidebar").classList.contains("open"); };
  $("overlay").onclick = closeSidebar;
  $("modalClose").onclick = closeModal;
  $("modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  if (restoreSession()) startApp();
});
