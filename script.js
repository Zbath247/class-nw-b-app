const WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

let allData = [];
let filteredData = [];
let currentTabType = 'schedule';
let currentPage = 1;
let rowsPerPage = 25;
let sortDirection = false;
let hiddenColumns = new Set();
let currentEditingRowIndex = null;
let pieChartInstance = null;
let barChartInstance = null;

function switchTab(type) {
    currentTabType = type;
    currentPage = 1;
    hiddenColumns.clear();
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
    const loadingEl = document.getElementById('loading');
    const bodyTbody = document.getElementById('tableBody');

    loadingEl.style.display = 'flex';
    bodyTbody.innerHTML = '';

    try {
        const response = await fetch(WEB_APP_URL + queryParam);
        const result = await response.json();

        loadingEl.style.display = 'none';
        allData = result;
        filteredData = [...allData];
        currentPage = 1;

        setupColumnToggles();
        renderTable();
        updateStats();
        renderCharts();

        if (isRefresh) showToast("ទាញយកទិន្នន័យថ្មីបានជោគជ័យ!");

    } catch (error) {
        loadingEl.style.display = 'none';
        console.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ:', error);
        bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; color: #ef4444; padding: 40px;"><i class="fa-solid fa-triangle-exclamation"></i> មានបញ្ហាក្នុងការភ្ជាប់ Server!</td></tr>`;
        showToast("មានបញ្ហាក្នុងការភ្ជាប់ Server!", true);
    }
}

function setupColumnToggles() {
    const container = document.getElementById('columnCheckboxes');
    container.innerHTML = '';

    if (!allData || allData.length === 0) return;

    const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
    keys.forEach(key => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = key;
        checkbox.onchange = (e) => {
            if (e.target.checked) {
                hiddenColumns.delete(key);
            } else {
                hiddenColumns.add(key);
            }
            renderTable();
        };

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(key));
        container.appendChild(label);
    });
}

function renderTable() {
    const headerTr = document.getElementById('tableHeaders');
    const bodyTbody = document.getElementById('tableBody');

    headerTr.innerHTML = '';
    bodyTbody.innerHTML = '';

    if (!filteredData || filteredData.length === 0) {
        bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; color: var(--text-secondary); padding: 40px;">គ្មានទិន្នន័យបង្ហាញឡើយ</td></tr>`;
        return;
    }

    const allKeys = Object.keys(filteredData[0]).filter(k => k !== 'rowIndex');
    const visibleKeys = allKeys.filter(key => !hiddenColumns.has(key));

    visibleKeys.forEach(key => {
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
        tr.onclick = () => showDetails(row);
        
        visibleKeys.forEach(key => {
            const td = document.createElement('td');
            td.textContent = row[key] !== undefined && row[key] !== null ? row[key] : '';
            tr.appendChild(td);
        });
        bodyTbody.appendChild(tr);
    });

    updatePagination();
}

function updateStats() {
    document.getElementById('statTotalRows').textContent = allData.length;
    if (allData.length > 0) {
        const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
        document.getElementById('statColumns').textContent = keys.length;
    } else {
        document.getElementById('statColumns').textContent = 0;
    }
    
    const now = new Date();
    document.getElementById('statLastUpdate').textContent = now.toLocaleTimeString('km-KH');
}

function renderCharts() {
    if (!allData || allData.length === 0) return;

    const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
    if (keys.length === 0) return;

    const primaryKey = keys[0];
    const counts = {};

    allData.forEach(row => {
        const val = row[primaryKey] || 'មិនស្គាល់';
        counts[val] = (counts[val] || 0) + 1;
    });

    const labels = Object.keys(counts).slice(0, 6); // Take top 6 items
    const dataValues = labels.map(l => counts[l]);

    // Pie Chart
    const pieCtx = document.getElementById('dataPieChart').getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Kantumruy Pro' } } } }
        }
    });

    // Bar Chart
    const barCtx = document.getElementById('dataBarChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ចំនួន',
                data: dataValues,
                backgroundColor: '#6366f1',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { font: { family: 'Kantumruy Pro' } } },
                y: { beginAtZero: true, ticks: { precision: 0 } }
            }
        }
    });
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

function changeRowsLimit() {
    rowsPerPage = parseInt(document.getElementById('rowsLimit').value);
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

function showDetails(row) {
    const modalBody = document.getElementById('modalBody');
    const modalFooterActions = document.getElementById('modalFooterActions');
    modalBody.innerHTML = '';
    modalFooterActions.innerHTML = '';

    for (let [key, value] of Object.entries(row)) {
        if (key === 'rowIndex') continue;
        const p = document.createElement('p');
        p.innerHTML = `<strong>${key}:</strong> ${value !== undefined && value !== null ? value : ''}`;
        modalBody.appendChild(p);
    }

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn primary-action';
    editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> កែប្រែ`;
    editBtn.onclick = () => openEditModal(row);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn danger-action';
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> លុប`;
    deleteBtn.onclick = () => deleteRecord(row);

    modalFooterActions.appendChild(deleteBtn);
    modalFooterActions.appendChild(editBtn);

    document.getElementById('detailModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function openAddModal() {
    if (!allData || allData.length === 0) {
        showToast("មិនទាន់មានโครงสร้าง Columns ទេ។", true);
        return;
    }

    currentEditingRowIndex = null;
    document.getElementById('modalTitle').innerHTML = `<i class="fa-solid fa-plus-circle"></i> បន្ថែមទិន្នន័យថ្មី`;
    document.getElementById('saveBtn').textContent = "រក្សាទុក";

    const container = document.getElementById('recordFormFields');
    container.innerHTML = '';

    const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
    keys.forEach(key => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = key;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.placeholder = `បញ្ចូល ${key}...`;
        
        // Form Validation Listener
        input.oninput = (e) => {
            if (e.target.value.trim() !== '') {
                e.target.classList.remove('error-input');
                const errSpan = div.querySelector('.error-msg');
                if (errSpan) errSpan.remove();
            }
        };

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });

    document.getElementById('recordModal').style.display = 'flex';
}

function openEditModal(row) {
    closeModal();
    currentEditingRowIndex = row.rowIndex;

    document.getElementById('modalTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> កែប្រែទិន្នន័យ`;
    document.getElementById('saveBtn').textContent = "អាប់ដេត";

    const container = document.getElementById('recordFormFields');
    container.innerHTML = '';

    const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
    keys.forEach(key => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = key;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.value = row[key] !== undefined && row[key] !== null ? row[key] : '';
        
        input.oninput = (e) => {
            if (e.target.value.trim() !== '') {
                e.target.classList.remove('error-input');
                const errSpan = div.querySelector('.error-msg');
                if (errSpan) errSpan.remove();
            }
        };

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });

    document.getElementById('recordModal').style.display = 'flex';
}

function closeRecordModal() {
    document.getElementById('recordModal').style.display = 'none';
}

async function submitRecord(event) {
    event.preventDefault();
    const form = document.getElementById('recordForm');
    const inputs = form.querySelectorAll('input');
    let isValid = true;

    // Strict Form Validation Check
    inputs.forEach(input => {
        const div = input.closest('.form-group');
        let errSpan = div.querySelector('.error-msg');
        
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error-input');
            if (!errSpan) {
                errSpan = document.createElement('span');
                errSpan.className = 'error-msg';
                errSpan.textContent = "សូមបំពេញព័ត៌មាននេះ!";
                div.appendChild(errSpan);
            }
        } else {
            input.classList.remove('error-input');
            if (errSpan) errSpan.remove();
        }
    });

    if (!isValid) {
        showToast("សូមបំពេញប្រអប់ទិន្នន័យដែលខ្វះខាត!", true);
        return;
    }

    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((value, key) => { dataObj[key] = value; });

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = "កំពុងដំណើរការ...";

    const isEdit = currentEditingRowIndex !== null;
    const actionType = isEdit ? 'update' : 'add';
    if (isEdit) dataObj.rowIndex = currentEditingRowIndex;

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                method: actionType,
                tabType: currentTabType,
                record: dataObj
            })
        });
        
        const result = await response.json();
        saveBtn.disabled = false;
        saveBtn.textContent = "រក្សាទុក";

        if (result.status === 'success' || result.success) {
            closeRecordModal();
            showToast(isEdit ? "បានកែប្រែទិន្នន័យជោគជ័យ!" : "បានបន្ថែមទិន្នន័យជោគជ័យ!");
            refreshData();
        } else {
            showToast("មានបញ្ហា៖ " + (result.message || 'មិនអាចបញ្ជូនទិន្នន័យបាន'), true);
        }
    } catch (error) {
        console.error('Error submitting record:', error);
        saveBtn.disabled = false;
        saveBtn.textContent = "រក្សាទុក";
        closeRecordModal();
        showToast("បានបញ្ជូនសំណើទៅកាន់ Server រួចរាល់!");
        refreshData();
    }
}

async function deleteRecord(row) {
    if (!confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?")) return;

    closeModal();
    showToast("កំពុងលុបទិន្នន័យ...");

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                method: 'delete',
                tabType: currentTabType,
                rowIndex: row.rowIndex
            })
        });

        const result = await response.json();
        if (result.status === 'success' || result.success) {
            showToast("បានលុបទិន្នន័យជោគជ័យ!");
            refreshData();
        } else {
            showToast("មានបញ្ហា៖ " + (result.message || 'មិនអាចលុបបាន'), true);
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        showToast("បានបញ្ជូនសំណើលុបរួចរាល់!");
        refreshData();
    }
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
    a.download = `${currentTabType}_data_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showToast("ទាញយកឯកសារ CSV បានជោគជ័យ!");
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = isError ? '#ef4444' : 'var(--primary)';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

window.onload = () => {
    fetchData('');
};
