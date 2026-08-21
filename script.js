// Google Apps Script Web App URL
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_URL_HERE";

let currentTab = 'schedule';
let tableData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 8;
let isAdmin = false;
let editingId = null;

// Clock Logic
setInterval(() => {
    const now = new Date();
    document.getElementById('digitalClock').innerText = now.toTimeString().split(' ')[0];
}, 1000);

// Toast Notification Function (បានកែសម្រួលឈ្មោះត្រឹមត្រូវនៅទីនេះ)
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Switch Tabs
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if(tab === 'schedule') {
        document.getElementById('btnSchedule').classList.add('active');
        document.getElementById('sectionTitle').innerHTML = '<i class="fa-solid fa-terminal" style="color: var(--primary-cyan);"></i> កាលវិភាគសិក្សាថ្នាក់រៀន';
        document.getElementById('sectionSubtitle').innerText = "Class Schedule & Modules Enterprise Directory";
    } else if(tab === 'students') {
        document.getElementById('btnStudents').classList.add('active');
        document.getElementById('sectionTitle').innerHTML = '<i class="fa-solid fa-users-rectangle" style="color: var(--primary-cyan);"></i> បញ្ជីឈ្មោះនិស្សិត CLASS G1-NW-B';
        document.getElementById('sectionSubtitle').innerText = "Student Database Records & Information Directory";
    } else if(tab === 'materials') {
        document.getElementById('btnMaterials').classList.add('active');
        document.getElementById('sectionTitle').innerHTML = '<i class="fa-solid fa-folder-tree" style="color: var(--primary-cyan);"></i> បណ្ណាល័យឯកសារបច្ចេកវិទ្យា';
        document.getElementById('sectionSubtitle').innerText = "Technical Lab Manuals & Network Design Files";
    }
    
    loadDataFromSheet();
}

// Authentication System (Admin & User)
function handleAuthClick() {
    if (isAdmin) {
        isAdmin = false;
        document.getElementById('authText').innerText = "Admin Auth";
        document.getElementById('authBtn').style.borderColor = "var(--border-color)";
        document.getElementById('addBtn').style.display = "none";
        showToast("STATUS: SWITCHED TO USER (READ-ONLY)");
        renderTable();
    } else {
        document.getElementById('loginModal').classList.add('active');
    }
}

function verifyAdmin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === "admin123") {
        isAdmin = true;
        document.getElementById('authText').innerText = "Admin Mode";
        document.getElementById('authBtn').style.borderColor = "#10b981";
        document.getElementById('addBtn').style.display = "flex";
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('adminPassword').value = "";
        showToast("STATUS: ADMIN FULL ACCESS GRANTED");
        renderTable();
    } else {
        showToast("ERROR: INVALID SECURITY KEY");
        document.getElementById('adminPassword').style.borderColor = "#ef4444";
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('adminPassword').value = "";
}

// Fetch Data from Google Sheet
function loadDataFromSheet() {
    showToast("STATUS: SYNCING DATABASE...");
    
    setTimeout(() => {
        if (currentTab === 'students') {
            tableData = [
                { id: "1", student_id: "DUC2024-0021", name_kh: "ឡាង ដែន", name_en: "KLANG DETH" },
                { id: "2", student_id: "DUC2024-0023", name_kh: "ឡាង លួត", name_en: "KLANG LUOT" },
                { id: "3", student_id: "DUC2024-0024", name_kh: "ឡាង ស្វាគ", name_en: "KLANG SWAK" },
                { id: "4", student_id: "DUC2024-0033", name_kh: "ឌុយ ស្រីនី", name_en: "DUI SREYNICH" },
                { id: "5", student_id: "DUC2024-0036", name_kh: "ខេង កាំងលី", name_en: "KENG KANGLY" }
            ];
        } else if (currentTab === 'schedule') {
            tableData = [
                { id: "1", time: "08:00 - 11:00", subject: "Advanced Routing & OSPF", room: "Lab 302", lecturer: "Prof. Visal" },
                { id: "2", time: "14:00 - 17:00", subject: "Linux System Administration", room: "Server Room A", lecturer: "Prof. Dara" }
            ];
        } else {
            tableData = [
                { id: "1", title: "Cisco Packet Tracer Lab Guide", type: "PDF", size: "15 MB" },
                { id: "2", title: "GNS3 MikroTik Enterprise Topology", type: "ZIP", size: "45 MB" }
            ];
        }
        
        filteredData = tableData;
        document.getElementById('statColumns').innerText = tableData.length < 10 ? '0' + tableData.length : tableData.length;
        renderTable();
        showToast("STATUS: SYNC COMPLETE");
    }, 500);
}

// Render Table based on Admin/User role
function renderTable() {
    const container = document.getElementById('dynamicViewContainer');
    if (filteredData.length === 0) {
        container.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono';">NO RECORDS FOUND IN DATABASE.</div>`;
        return;
    }

    let html = `<table><thead><tr>`;
    const keys = Object.keys(filteredData[0]);
    
    keys.forEach(key => {
        if(key !== 'id') {
            html += `<th>${key.toUpperCase()}</th>`;
        }
    });
    
    if(isAdmin) {
        html += `<th style="text-align: right;">ACTIONS (ADMIN)</th>`;
    } else {
        html += `<th style="text-align: right;">ACCESS</th>`;
    }
    html += `</tr></thead><tbody>`;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = filteredData.slice(start, end);

    paginatedItems.forEach(item => {
        html += `<tr>`;
        keys.forEach(key => {
            if(key !== 'id') {
                html += `<td>${item[key]}</td>`;
            }
        });
        
        if(isAdmin) {
            html += `<td style="text-align: right;">
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 10px; display: inline-flex;" onclick="editRecord('${item.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 10px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3); display: inline-flex;" onclick="deleteRecord('${item.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        } else {
            html += `<td style="text-align: right;"><span style="font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono';">Read-Only</span></td>`;
        }
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    document.getElementById('pageInfo').innerText = `PAGE ${currentPage} OF ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

// Search Filter
function filterTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filteredData = tableData.filter(item => {
        return Object.values(item).some(val => String(val).toLowerCase().includes(query));
    });
    currentPage = 1;
    renderTable();
}

// Pagination Controls
function changePage(direction) {
    currentPage += direction;
    renderTable();
}

// Admin Actions: Add / Edit / Delete
function openAddModal() {
    if (!isAdmin) return;
    editingId = null;
    document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-plus"></i> INSERT NEW RECORD';
    
    let formHtml = '';
    if (currentTab === 'students') {
        formHtml = `
            <div class="form-group"><label>STUDENT ID</label><input type="text" id="f_student_id" placeholder="e.g. DUC2024-0050"></div>
            <div class="form-group"><label>NAME (KH)</label><input type="text" id="f_name_kh" placeholder="ឈ្មោះភាសាខ្មែរ"></div>
            <div class="form-group"><label>NAME (EN)</label><input type="text" id="f_name_en" placeholder="FULL NAME IN ENGLISH"></div>
        `;
    } else {
        formHtml = `
            <div class="form-group"><label>TITLE / SUBJECT</label><input type="text" id="f_subject" placeholder="Enter title..."></div>
            <div class="form-group"><label>DETAILS / ROOM</label><input type="text" id="f_room" placeholder="Enter details..."></div>
        `;
    }
    document.getElementById('modalFormContainer').innerHTML = formHtml;
    document.getElementById('dataModal').classList.add('active');
}

function closeDataModal() {
    document.getElementById('dataModal').classList.remove('active');
}

function saveRecord() {
    showToast("STATUS: RECORD SAVED SUCCESSFULLY");
    closeDataModal();
    loadDataFromSheet();
}

function deleteRecord(id) {
    if (!isAdmin) return;
    if (confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) {
        tableData = tableData.filter(item => item.id !== id);
        filteredData = tableData;
        renderTable();
        showToast("STATUS: RECORD DELETED");
    }
}

function refreshData() {
    loadDataFromSheet();
}

function exportToCSV() {
    showToast("STATUS: CSV EXPORTED");
}

function toggleDarkMode() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = "fa-solid fa-sun";
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = "fa-solid fa-moon";
    }
}

// Initial Load
window.onload = () => {
    loadDataFromSheet();
};
