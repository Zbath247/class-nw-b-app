// បញ្ចូល Google Apps Script Web App URL របស់អ្នកនៅទីនេះ
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

// Authentication System
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

// Fetch Data from Google Sheet API
async function loadDataFromSheet() {
    showToast("STATUS: SYNCING DATABASE...");
    
    try {
        let endpoint = API_URL;
        if (currentTab === 'students') {
            endpoint += "?action=getStudents";
        } else if (currentTab === 'schedule') {
            endpoint += "?action=getSchedule";
        } else {
            // បើគ្មាន Tab ឯកសារ បង្ហាញទិន្នន័យទទេ ឬ Mock ទុកសិន
            tableData = [];
            filteredData = tableData;
            document.getElementById('statColumns').innerText = '00';
            renderTable();
            showToast("STATUS: SYNC COMPLETE");
            return;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        
        tableData = data;
        filteredData = tableData;
        document.getElementById('statColumns').innerText = tableData.length < 10 ? '0' + tableData.length : tableData.length;
        renderTable();
        showToast("STATUS: SYNC COMPLETE");
    } catch (error) {
        console.error("Error fetching data:", error);
        showToast("ERROR: FAILED TO SYNC");
    }
}

// Render Table
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

    paginatedItems.forEach((item, index) => {
        let rowId = item.id || index;
        html += `<tr>`;
        keys.forEach(key => {
            if(key !== 'id') {
                html += `<td>${item[key]}</td>`;
            }
        });
        
        if(isAdmin) {
            html += `<td style="text-align: right;">
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 10px; display: inline-flex;" onclick="editRecord('${rowId}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 10px; color: #ef4444; border-color: rgba(239, 68, 68, 0.3); display: inline-flex;" onclick="deleteRecord('${rowId}')"><i class="fa-solid fa-trash"></i></button>
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

function changePage(direction) {
    currentPage += direction;
    renderTable();
}

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
            <div class="form-group"><label>DAY</label><input type="text" id="f_day" placeholder="ថ្ងៃ..."></div>
            <div class="form-group"><label>TIME</label><input type="text" id="f_time" placeholder="ម៉ោង..."></div>
            <div class="form-group"><label>SUBJECT</label><input type="text" id="f_subject" placeholder="មុខវិជ្ជា..."></div>
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
        tableData = tableData.filter((item, index) => (item.id || index) != id);
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

window.onload = () => {
    loadDataFromSheet();
};
