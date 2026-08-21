const API_URL = "https://script.google.com/macros/s/AKfycbwe3Nkapdy0QEDz4SRsoeIUUyvh5KjleyWrGBPup6h91eiG8WOm7c6dvSVjZvk5jdHU/exec";

let currentTab = 'schedule';
let tableData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 8;
let isAdmin = false;
let editingId = null;

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

async function loadDataFromSheet() {
    showToast("STATUS: SYNCING DATABASE...");
    
    try {
        let endpoint = API_URL;
        if (currentTab === 'students') {
            endpoint += "?action=getStudents";
        } else if (currentTab === 'materials') {
            endpoint += "?action=getLibrary";
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

function renderTable() {
    const container = document.getElementById('dynamicViewContainer');
    if (filteredData.length === 0) {
        container.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-muted); font-family: 'JetBrains Mono';">NO RECORDS FOUND IN DATABASE.</div>`;
        return;
    }

    let html = `<table><thead><tr>`;
    const keys = Object.keys(filteredData[0]);
    
    keys.forEach(key => {
        if(key !== 'id' && key !== 'link') {
            html += `<th>${key.toUpperCase()}</th>`;
        }
    });
    
    if (currentTab === 'materials') {
        html += `<th style="text-align: right;">ACTIONS</th>`;
    } else if(isAdmin) {
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
            if(key !== 'id' && key !== 'link') {
                html += `<td>${item[key]}</td>`;
            }
        });
        
        if (currentTab === 'materials') {
            let rawLink = item.link || '#';
            let embedLink = rawLink;
            if (rawLink.includes('drive.google.com')) {
                embedLink = rawLink.replace('/view?usp=sharing', '/preview').replace('/edit?usp=sharing', '/preview');
            }

            html += `<td style="text-align: right; display: flex; gap: 6px; justify-content: flex-end;">
                <button class="btn-primary" style="padding: 4px 10px; font-size: 10px; display: inline-flex;" onclick="openPdfViewer('${embedLink}', '${item.title || 'Document'}')"><i class="fa-solid fa-eye"></i> View</button>
                <a href="${rawLink}" target="_blank" class="btn-secondary" style="padding: 4px 10px; font-size: 10px; display: inline-flex; text-decoration: none;"><i class="fa-solid fa-download"></i></a>
            </td>`;
        } else if(isAdmin) {
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

function openPdfViewer(url, title) {
    document.getElementById('pdfModalTitle').innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${title}`;
    document.getElementById('pdfIframe').src = url;
    document.getElementById('pdfModal').classList.add('active');
}

function closePdfModal() {
    document.getElementById('pdfModal').classList.remove('active');
    document.getElementById('pdfIframe').src = '';
}

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
    } else if (currentTab === 'materials') {
        formHtml = `
            <div class="form-group"><label>TITLE</label><input type="text" id="f_title" placeholder="ឈ្មោះមេរៀន..."></div>
            <div class="form-group"><label>TYPE</label><input type="text" id="f_type" placeholder="PDF, PPTX, etc..."></div>
            <div class="form-group"><label>SIZE</label><input type="text" id="f_size" placeholder="15 MB..."></div>
            <div class="form-group"><label>SELECT FILE FROM COMPUTER</label><input type="file" id="f_file" style="color: var(--text-main);"></div>
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

async function saveRecord() {
    showToast("STATUS: UPLOADING & SAVING...");
    
    let payload = { tab: currentTab };

    if (currentTab === 'materials') {
        payload.title = document.getElementById('f_title').value;
        payload.type = document.getElementById('f_type').value;
        payload.size = document.getElementById('f_size').value;
        
        const fileInput = document.getElementById('f_file');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            payload.fileName = file.name;
            payload.mimeType = file.type;
            
            const base64Data = await toBase64(file);
            payload.fileData = base64Data.split(',')[1];
        }
    } else if (currentTab === 'students') {
        payload.student_id = document.getElementById('f_student_id').value;
        payload.name_kh = document.getElementById('f_name_kh').value;
        payload.name_en = document.getElementById('f_name_en').value;
    } else {
        payload.day = document.getElementById('f_day').value;
        payload.time = document.getElementById('f_time').value;
        payload.subject = document.getElementById('f_subject').value;
    }

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        showToast("STATUS: SUCCESS!");
        closeDataModal();
        loadDataFromSheet();
    } catch (error) {
        console.error(error);
        showToast("ERROR: FAILED TO SAVE");
    }
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

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
