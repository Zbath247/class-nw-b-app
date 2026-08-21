const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwzKJ8fwImxRdKwSz8QJAgnD5ek-CgeV2is10aZY2l7KeI2ChydmwXA4NkupSQrj0mj/exec";

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

    if (loadingEl) loadingEl.style.display = 'flex';
    bodyTbody.innerHTML = '';

    try {
        const response = await fetch(WEB_APP_URL + queryParam);
        const result = await response.json();

        if (loadingEl) loadingEl.style.display = 'none';
        allData = result;
        filteredData = [...allData];
        currentPage = 1;

        setupColumnToggles();
        renderTable();
        updateStats();
        renderCharts();

        if (isRefresh) showToast("ទាញយកទិន្នន័យថ្មីបានជោគជ័យ!");

    } catch (error) {
        if (loadingEl) loadingEl.style.display = 'none';
        console.error('មានបញ្ហាក្នុងការទាញយកទិន្នន័យ:', error);
        bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; color: #ef4444; padding: 40px;"><i class="fa-solid fa-triangle-exclamation"></i> មានបញ្ហាក្នុងការភ្ជាប់ Server!</td></tr>`;
        showToast("មានបញ្ហាក្នុងការភ្ជាប់ Server!", true);
    }
}

function setupColumnToggles() {
    const container = document.getElementById('columnCheckboxes');
    if (!container) return;
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

    if (!headerTr || !bodyTbody) return;

    headerTr.innerHTML = '';
    bodyTbody.innerHTML = '';

    if (!filteredData || filteredData.length === 0) {
        bodyTbody.innerHTML = `<tr><td colspan="100" style="text-align: center; color: var(--text-secondary); padding: 40px;">គ្មានទិន្នន័យបង្ហាញឡើយ</td></tr>`;
        updatePagination();
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
    const statTotalRows = document.getElementById('statTotalRows');
    const statColumns = document.getElementById('statColumns');
    const statLastUpdate = document.getElementById('statLastUpdate');

    if (statTotalRows) statTotalRows.textContent = allData.length;
    if (statColumns) {
        if (allData.length > 0) {
            const keys = Object.keys(allData[0]).filter(k => k !== 'rowIndex');
            statColumns.textContent = keys.length;
        } else {
            statColumns.textContent = 0;
        }
    }
    
    if (statLastUpdate) {
        const now = new Date();
        statLastUpdate.textContent = now.toLocaleTimeString('km-KH');
    }
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

    const labels = Object.keys(counts).slice(0, 6);
    const dataValues = labels.map(l => counts[l]);

    // Pie Chart
    const pieCanvas = document.getElementById('dataPieChart');
    if (pieCanvas) {
        const pieCtx = pieCanvas.getContext('2d');
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
    }

    // Bar Chart
    const barCanvas = document.getElementById('dataBarChart');
    if (barCanvas) {
        const barCtx = barCanvas.getContext('2d');
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
}

function filterTable() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const input = searchInput.value.toLowerCase();
    
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
    const rowsLimit = document.getElementById('rowsLimit');
    if (!rowsLimit) return;
    rowsPerPage = parseInt(rowsLimit.value);
    currentPage = 1;
    renderTable();
}

function changePage(direction) {
    currentPage += direction;
    renderTable();
}

function updatePagination() {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    if (pageInfo) pageInfo.textContent = `ទំព័រ ${currentPage} នៃ ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
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
    const detailModal = document.getElementById('detailModal');

    if (!modalBody || !modalFooterActions || !detailModal) return;

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

    detailModal.style.display = 'flex';
}

function closeModal() {
    const detailModal = document.getElementById('detailModal');
    if (detailModal) detailModal.style.display = 'none';
}

function openAddModal() {
    if (!allData || allData.length === 0) {
        showToast("មិនទាន់មានโครงสร้าง Columns ទេ។", true);
        return;
    }

    currentEditingRowIndex = null;
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');
    const container = document.getElementById('recordFormFields');
    const recordModal = document.getElementById('recordModal');

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> បន្ថែមទិន្នន័យថ្មី`;
    if (saveBtn) saveBtn.textContent = "រក្សាទុក";
    if (!container || !recordModal) return;

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

    recordModal.style.display = 'flex';
}

function openEditModal(row) {
    closeModal();
    currentEditingRowIndex = row.rowIndex;

    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');
    const container = document.getElementById('recordFormFields');
    const recordModal = document.getElementById('recordModal');

    if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> កែប្រែទិន្នន័យ`;
    if (saveBtn) saveBtn.textContent = "អាប់ដេត";
    if (!container || !recordModal) return;

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

    recordModal.style.display = 'flex';
}

function closeRecordModal() {
    const recordModal = document.getElementById('recordModal');
    if (recordModal) recordModal.style.display = 'none';
}

async function submitRecord(event) {
    event.preventDefault();
    const form = document.getElementById('recordForm');
    if (!form) return;
    const inputs = form.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
        const div = input.closest('.form-group');
        let errSpan = div ? div.querySelector('.error-msg') : null;
        
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error-input');
            if (!errSpan && div) {
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
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "កំពុងដំណើរការ...";
    }

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
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "រក្សាទុក";
        }

        if (result.status === 'success' || result.success) {
            closeRecordModal();
            showToast(isEdit ? "បានកែប្រែទិន្នន័យជោគជ័យ!" : "បានបន្ថែមទិន្នន័យជោគជ័យ!");
            refreshData();
        } else {
            showToast("មានបញ្ហា៖ " + (result.message || 'មិនអាចបញ្ជូនទិន្នន័យបាន'), true);
        }
    } catch (error) {
        console.error('Error submitting record:', error);
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "រក្សាទុក";
        }
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
        if (themeIcon) themeIcon.className = "fa-solid fa-sun";
    } else {
        html.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.className = "fa-solid fa-moon";
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
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = isError ? '#ef4444' : 'var(--primary)';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

window.onload = () => {
    fetchData('');
};
