// Google Apps Script Web App URL របស់អ្នក
const API_URL = 'https://script.google.com/macros/s/AKfycbwzKJ8fwImxRdKwSz8QJAgnD5ek-CgeV2is10aZY2l7KeI2ChydmwXA4NkupSQrj0mj/exec'; 

let currentTab = 'schedule';
let tableData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 6;
let isAdmin = false;

// នាឡិកាឌីជីថលដំណើរការផ្ទាល់
function updateDigitalClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('digitalClock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
}
setInterval(updateDigitalClock, 1000);

window.onload = () => {
    fetchData();
    updateDigitalClock();
};

// ទាញយកទិន្នន័យពី Google Apps Script
async function fetchData() {
    showToast("SYNCING_DATA...");
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // បែងចែកទិន្នន័យតាម Tab ប្រសិនបើ Google Script ส่งมาគ្រប់ Tab ឬទាញយកទូទៅ
        tableData = Array.isArray(data) ? data : (data[currentTab] || []);
        filteredData = tableData;
        currentPage = 1;
        renderTable();
        updateStats();
        showToast("STATUS: OK");
    } catch (error) {
        console.error('Error fetching data:', error);
        loadMockData();
    }
}

// Mock Data សម្រាប់ប្រើបណ្តោះអាសន្នបើមានបញ្ហា kết nối
function loadMockData() {
    if (currentTab === 'schedule') {
        tableData = [
            { ម៉ោង: '08:00 - 10:00', ថ្ងៃច័ន្ទ: 'Cisco Routing', ថ្ងៃអង្គារ: 'Linux Admin', ថ្ងៃពុធ: 'Database Design' },
            { ម៉ោង: '10:15 - 12:15', ថ្ងៃច័ន្ទ: 'Network Security', ថ្ងៃអង្គារ: 'Python Scripting', ថ្ងៃពុធ: 'Cloud Setup' }
        ];
    } else if (currentTab === 'students') {
        tableData = [
            { អត្តលេខ: 'G1-001', ឈ្មោះ: 'Mok Sambath', ភេទ: 'ប្រុស', ជំនាញ: 'Network Engineering' },
            { អត្តលេខ: 'G1-002', ឈ្មោះ: 'Dara Chan', ភេទ: 'ប្រុស', ជំនាញ: 'Cybersecurity' }
        ];
    } else {
        tableData = [];
    }
    filteredData = tableData;
    renderTable();
    updateStats();
}

// ប្តូរ Tab ទៅមក
function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');

    const titleEl = document.getElementById('sectionTitle');
    const subEl = document.getElementById('sectionSubtitle');

    if (tabName === 'schedule') {
        titleEl.innerHTML = `<i class="fa-solid fa-terminal" style="color: var(--primary-cyan);"></i> កាលវិភាគសិក្សាថ្នាក់រៀន`;
        subEl.textContent = `Digital Enterprise Portal - Connected via Google Apps Script`;
        fetchData();
    } else if (tabName === 'students') {
        titleEl.innerHTML = `<i class="fa-solid fa-users-viewfinder" style="color: var(--primary-cyan);"></i> បញ្ជីឈ្មោះនិស្សិត CLASS G1-NW-B`;
        subEl.textContent = `Student Database Records & Information Directory`;
        fetchData();
    } else if (tabName === 'materials') {
        titleEl.innerHTML = `<i class="fa-solid fa-folder-open" style="color: var(--primary-cyan);"></i> កម្រងឯកសារ និងមេរៀនបច្ចេកវិទ្យា`;
        subEl.textContent = `Digital Library - Cisco, Linux, & Networking Documentation`;
        renderLibraryMaterials();
        return;
    }
}

// បង្ហាញតារាងទិន្នន័យ (Table Rendering)
function renderTable() {
    const container = document.getElementById('dynamicViewContainer');
    
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead><tr id="tableHeaders"></tr></thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>
    `;

    const newHeaderTr = document.getElementById('tableHeaders');
    const newBodyTbody = document.getElementById('tableBody');

    if (filteredData.length === 0) {
        newHeaderTr.innerHTML = `<th>SYSTEM_STATUS</th>`;
        newBodyTbody.innerHTML = `<tr><td style="text-align: center; color: var(--text-muted);">រកមិនឃើញទិន្នន័យក្នុងប្រព័ន្ធឡើយ (No Records Found)</td></tr>`;
        return;
    }

    const keys = Object.keys(filteredData[0]);
    let headerHTML = keys.map(key => `<th>${key.toUpperCase()}</th>`).join('');
    if (isAdmin) headerHTML += `<th>ACTIONS</th>`;
    newHeaderTr.innerHTML = headerHTML;

    const start = (currentPage - 1) * rowsPerPage;
    const paginatedItems = filteredData.slice(start, start + rowsPerPage);

    let bodyHTML = '';
    paginatedItems.forEach((row, index) => {
        let rowHTML = keys.map(key => `<td>${row[key] || ''}</td>`).join('');
        if (isAdmin) {
            let actualIndex = start + index;
            rowHTML += `<td>
                <button class="btn-secondary" style="padding: 4px 8px; font-size: 10px;" onclick="deleteRecord(${actualIndex})"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        }
        bodyHTML += `<tr>${rowHTML}</tr>`;
    });
    newBodyTbody.innerHTML = bodyHTML;

    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    document.getElementById('pageInfo').textContent = `PAGE ${currentPage} OF ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// បង្ហាញបណ្ណាល័យឯកសារ (Library Materials View)
function renderLibraryMaterials() {
    const container = document.getElementById('dynamicViewContainer');
    document.getElementById('paginationBar').style.display = 'none';

    const materials = [
        { title: 'Cisco Routing & Switching', code: 'NET-101', desc: 'មេរៀនស្ដីពី OSPF, VLAN, និង Enterprise Network Topologies.', link: '#' },
        { title: 'Linux Systems Administration', code: 'SYS-202', desc: 'การកំណត់ Netplan, BIND9 DNS, និង iptables Firewall Rules.', link: '#' },
        { title: 'Node.js & MySQL Database', code: 'DB-303', desc: 'การសាងសង់ RESTful APIs និងប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ relational.', link: '#' },
        { title: 'Cybersecurity & Ethical Hacking', code: 'SEC-404', desc: 'គោលការណ៍សុវត្ថិភាពបណ្តាញ និងការការពារប្រព័ន្ធកម្រិតខ្ពស់.', link: '#' }
    ];

    let html = '<div class="materials-grid">';
    materials.forEach(item => {
        html += `
            <div class="material-card">
                <div>
                    <div class="material-header">
                        <div class="material-icon"><i class="fa-solid fa-book"></i></div>
                        <div class="material-title">
                            <h3>${item.title}</h3>
                            <span>${item.code}</span>
                        </div>
                    </div>
                    <div class="material-body">${item.desc}</div>
                </div>
                <a href="${item.link}" class="read-btn" target="_blank"><i class="fa-solid fa-terminal"></i> ACCESS_FILE</a>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function filterTable() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    filteredData = tableData.filter(row => {
        return Object.values(row).some(val => String(val).toLowerCase().includes(keyword));
    });
    currentPage = 1;
    renderTable();
}

function changePage(direction) {
    currentPage += direction;
    renderTable();
}

function updateStats() {
    document.getElementById('statColumns').textContent = String(tableData.length).padStart(2, '0');
}

function handleAuthClick() {
    if (isAdmin) {
        isAdmin = false;
        document.getElementById('authBtn').classList.remove('logged-in');
        document.getElementById('authText').textContent = 'Admin Auth';
        document.getElementById('addBtn').style.display = 'none';
        showToast("LOGGED OUT");
        renderTable();
    } else {
        document.getElementById('loginModal').classList.add('active');
    }
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function verifyAdmin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === 'admin123') {
        isAdmin = true;
        document.getElementById('authBtn').classList.add('logged-in');
        document.getElementById('authText').textContent = 'Admin Active';
        document.getElementById('addBtn').style.display = 'flex';
        closeLoginModal();
        showToast("ACCESS GRANTED: ADMIN");
        renderTable();
    } else {
        showToast("ACCESS DENIED: INVALID KEY");
    }
}

function openAddModal() {
    if (!tableData.length) return;
    const keys = Object.keys(tableData[0]);
    let formHTML = '';
    keys.forEach(key => {
        formHTML += `
            <div class="form-group">
                <label>${key.toUpperCase()}</label>
                <input type="text" id="input_${key}" placeholder="Enter ${key}...">
            </div>
        `;
    });
    document.getElementById('modalFormContainer').innerHTML = formHTML;
    document.getElementById('dataModal').classList.add('active');
}

function closeDataModal() {
    document.getElementById('dataModal').classList.remove('active');
}

async function saveRecord() {
    const keys = Object.keys(tableData[0]);
    let newRecord = {};
    keys.forEach(key => {
        newRecord[key] = document.getElementById(`input_${key}`).value;
    });

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(newRecord)
        });
        showToast("RECORD SAVED SUCCESSFULLY");
        closeDataModal();
        fetchData();
    } catch (error) {
        tableData.push(newRecord);
        filteredData = tableData;
        renderTable();
        updateStats();
        closeDataModal();
        showToast("RECORD SAVED LOCALLY");
    }
}

async function deleteRecord(index) {
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?')) return;
    tableData.splice(index, 1);
    filteredData = tableData;
    renderTable();
    updateStats();
    showToast("RECORD DELETED");
}

function toggleDarkMode() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = 'fa-solid fa-sun';
        showToast("THEME: LIGHT MODE");
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fa-solid fa-moon';
        showToast("THEME: CYBER DARK");
    }
}

function exportToCSV() {
    if (!tableData.length) return;
    const keys = Object.keys(tableData[0]);
    let csvContent = keys.join(',') + '\n';
    tableData.forEach(row => {
        csvContent += keys.map(k => `"${row[k] || ''}"`).join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTab}_export.csv`;
    a.click();
    showToast("CSV EXPORTED SUCCESSFULLY");
}

function refreshData() {
    fetchData();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
