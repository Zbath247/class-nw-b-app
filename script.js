const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwzKJ8fwImxRdKwSz8QJAgnD5ek-CgeV2is10aZY2l7KeI2ChydmwXA4NkupSQrj0mj/exec";

let allData = [];
let filteredData = [];
let currentTabType = 'schedule';
let currentPage = 1;
let rowsPerPage = 10;
let sortDirection = false;

function switchTab(type) {
    currentTabType = type;
    currentPage = 1;
    document.getElementById('searchInput').value = '';

    const btnSchedule = document.getElementById('btnSchedule');
    const btnStudents = document.getElementById('btnStudents');

    if (type === 'schedule') {
        btnSchedule.classList.add('active');
        btnStudents.classList.remove('active');
        fetchData(''); 
    } else {
        btnStudents.classList.add('active');
        btnSchedule.classList.remove('active');
        fetchData('?action=getStudents'); 
    }
}

function refreshData() {
    const query = currentTabType === 'schedule' ? '' : '?action=getStudents';
    fetchData(query, true);
}

async function fetchData(queryParam = '', isRefresh = false) {
    const bodyTbody = document.getElementById('tableBody');
    bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; padding: 40px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin fa-lg"></i> កំពុងទាញយកទិន្នន័យ...</td></tr>`;

    try {
        const response = await fetch(WEB_APP_URL + queryParam);
        const result = await response.json();

        allData = result;
        filteredData = [...allData];
        currentPage = 1;

        renderTable();
        updateStats();

        if (isRefresh) showToast("ទាញយកទិន្នន័យថ្មីបានជោគជ័យ!");

    } catch (error) {
        console.error('មានបញ្ហា:', error);
        bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; color: #ef4444; padding: 40px;"><i class="fa-solid fa-triangle-exclamation"></i> មានបញ្ហាក្នុងការភ្ជាប់ Server!</td></tr>`;
        showToast("មានបញ្ហាក្នុងការភ្ជាប់ Server!", true);
    }
}

function renderTable() {
    const headerTr = document.getElementById('tableHeaders');
    const bodyTbody = document.getElementById('tableBody');

    headerTr.innerHTML = '';
    bodyTbody.innerHTML = '';

    if (!filteredData || filteredData.length === 0) {
        bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; color: var(--text-muted); padding: 40px;">គ្មានទិន្នន័យបង្ហាញឡើយ</td></tr>`;
        updatePagination();
        return;
    }

    const allKeys = Object.keys(filteredData[0]).filter(k => k !== 'rowIndex');

    allKeys.forEach(key => {
        const th = document.createElement('th');
        th.innerHTML = `${key} <i class="fa-solid fa-sort" style="font-size: 11px; opacity: 0.5;"></i>`;
        th.onclick = () => sortTable(key);
        headerTr.appendChild(th);
    });

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        allKeys.forEach(key => {
            const td = document.createElement('td');
            td.textContent = row[key] !== undefined && row[key] !== null ? row[key] : '';
            tr.appendChild(td);
        });
        bodyTbody.appendChild(tr);
    });

    updatePagination();
}

function updateStats() {
    const statColumns = document.getElementById('statColumns');
    if (statColumns && allData.length > 0) {
        const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
        statColumns.textContent = keys.length;
    }
}

function filterTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    if (!allData || allData.length === 0) return;

    filteredData = allData.filter(row => {
        return Object.entries(row).some(([k, val]) => 
            k !== 'rowIndex' && String(val).toLowerCase().includes(input)
        );
    });

    currentPage = 1;
    renderTable();
}

function changePage(direction) {
    currentPage += direction;
    renderTable();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    document.getElementById('pageInfo').textContent = `ទំព័រ ${currentPage} នៃ ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function sortTable(key) {
    sortDirection = !sortDirection;
    filteredData.sort((a, b) => {
        let valA = a[key] !== undefined ? String(a[key]).toLowerCase() : '';
        let valB = b[key] !== undefined ? String(b[key]).toLowerCase() : '';
        if (valA < valB) return sortDirection ? 1 : -1;
        if (valA > valB) return sortDirection ? -1 : 1;
        return 0;
    });
    renderTable();
}

function toggleDarkMode() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    
    if (html.getAttribute('data-theme') === 'light') {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = "fa-solid fa-sun";
    } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = "fa-solid fa-moon";
    }
}

function exportToCSV() {
    if (!filteredData || filteredData.length === 0) {
        showToast("គ្មានទិន្នន័យសម្រាប់ Export ទេ។", true);
        return;
    }

    const keys = Object.keys(filteredData[0]).filter(k => k !== 'rowIndex');
    let csvContent = "\uFEFF" + keys.join(",") + "\n";

    filteredData.forEach(row => {
        let values = keys.map(key => {
            let val = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
            return `"${val.replace(/"/g, '""')}"`;
        });
        csvContent += values.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTabType}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("ទាញយកឯកសារ CSV បានជោគជ័យ!");
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = isError ? '#ef4444' : '#06b6d4';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

window.onload = () => {
    fetchData('');
};
