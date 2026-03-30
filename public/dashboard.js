// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
const AppState = {
    currentUser: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    currentContent: 'devices',
    currentTopContent: 'profile',
    devices: [],
    filteredDevices: [],
    employees: [],
    deviceTypes: [],
    productionPlaces: [],
    productionMonths: [],
    productionYears: [],
    productionStages: [],
    locations: [],
    components: [],
    assemblers: [],
    electricians: [],
    psiTests: [],
    macs: []
};

// ===== ФУНКЦИЯ ДЛЯ API ЗАПРОСОВ С ТОКЕНОМ =====
async function apiRequest(url, options = {}) {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        console.error('❌ Нет токена авторизации');
        window.location.href = '/';
        throw new Error('Не авторизован');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 401) {
        console.error('❌ Сессия истекла');
        window.location.href = '/';
        throw new Error('Сессия истекла');
    }
    
    return response;
}

// ===== ДОБАВЛЕНИЕ СТИЛЕЙ =====
function addFixedTableStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .devices-page .table-container, .product-types-page .table-container,
        .components-page .table-container, .production-places-page .table-container,
        .employees-page .table-container {
            overflow-x: auto;
            position: relative;
            min-height: 300px;
        }
        
        .devices-page .data-table, .product-types-page .data-table,
        .components-page .data-table, .production-places-page .data-table,
        .employees-page .data-table {
            width: 100%;
            min-width: 800px;
            table-layout: fixed;
            border-collapse: collapse;
        }
        
        .devices-page .data-table th, .devices-page .data-table td,
        .product-types-page .data-table th, .product-types-page .data-table td,
        .components-page .data-table th, .components-page .data-table td,
        .production-places-page .data-table th, .production-places-page .data-table td,
        .employees-page .data-table th, .employees-page .data-table td {
            padding: 12px 8px;
            vertical-align: middle;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .device-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            background: var(--bg-soft);
            padding: 4px;
            display: block;
            margin: 0 auto;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
        }
        
        .status-badge.success { background: #e8f5e9; color: #2e7d32; }
        .status-badge.danger { background: #ffebee; color: #c62828; }
        .status-badge.warning { background: #fff3e0; color: #ef6c00; }
        .status-badge.info { background: #e3f2fd; color: #1976d2; }
        
        .table-actions { display: flex; gap: 5px; flex-wrap: nowrap; }
        .table-actions button { padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .table-actions .edit-btn { background: var(--bg-soft); color: var(--primary); }
        .table-actions .delete-btn { background: #ffebee; color: #c62828; }
        .table-actions button:hover { opacity: 0.8; transform: translateY(-1px); }
        
        .loading-spinner { display: flex; justify-content: center; align-items: center; padding: 40px; }
        .spinner { width: 40px; height: 40px; border: 4px solid var(--border-light); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .search-panel { position: sticky; top: 0; background: var(--bg-white); z-index: 10; margin-bottom: 20px; padding: 15px; border-radius: 8px; box-shadow: var(--shadow-sm); }
        .info-row { display: flex; margin-bottom: 10px; padding: 8px 12px; background: var(--bg-soft); border-radius: 6px; }
        .info-label { width: 140px; font-weight: 600; color: var(--text-secondary); }
        .info-value { flex: 1; color: var(--text-primary); }
        .empty-state { text-align: center; padding: 40px; color: var(--text-tertiary); font-style: italic; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-container { background: var(--bg-white); border-radius: 12px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); }
        .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { margin: 0; color: var(--primary); }
        .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-tertiary); }
        .modal-content { padding: 20px; }
        .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 10px; }
        .btn-cancel { padding: 8px 20px; background: var(--bg-soft); border: 1px solid var(--border-light); border-radius: 6px; cursor: pointer; }
        .btn-save { padding: 8px 20px; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-secondary); }
        .form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid var(--border-light); border-radius: 6px; background: var(--bg-white); color: var(--text-primary); }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .stats-section { background: var(--bg-white); border-radius: 12px; border: 1px solid var(--border-light); overflow: hidden; margin-bottom: 1.5rem; }
        .section-header { background: var(--bg-soft); padding: 12px 20px; border-bottom: 1px solid var(--border-light); }
        .section-header h2 { margin: 0; font-size: 18px; color: var(--primary); }
        .stat-item { background: var(--bg-soft); padding: 16px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--primary); }
        .stat-label { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }
        
        .components-tabs {
            display: flex;
            gap: 0.5rem;
            margin: 1.5rem 0 1rem;
            padding: 0.5rem;
            background: var(--bg-white);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-light);
            flex-wrap: wrap;
        }
        
        .component-tab {
            padding: 0.6rem 1.5rem;
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-full);
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .component-tab:hover {
            background: var(--bg-soft);
            color: var(--primary);
            border-color: var(--primary-light);
        }
        
        .component-tab.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }
        
        .filter-info {
            background: var(--bg-soft);
            padding: 0.8rem 1.2rem;
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
            border-left: 4px solid var(--primary);
        }
        
        .filter-info p {
            margin: 0;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .image-preview {
            width: 100px;
            height: 100px;
            background: var(--bg-soft);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed var(--border-light);
            overflow: hidden;
        }
        
        .image-preview img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .stat-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .employee-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--primary-light);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
        }
        
        .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .role-badge.admin { background: #e8f5e9; color: #2e7d32; }
        .role-badge.user { background: #e3f2fd; color: #1976d2; }
        .role-badge.operator { background: #fff3e0; color: #ef6c00; }
        
        .employee-table {
            width: 100%;
            border-collapse: collapse;
        }
        .employee-table th {
            text-align: left;
            padding: 1rem;
            background: var(--bg-soft);
            color: var(--primary);
            font-weight: 600;
            border-bottom: 2px solid var(--border-light);
        }
        .employee-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-soft);
            color: var(--text-primary);
        }
        .employee-table tr:hover {
            background: var(--bg-soft);
        }
        .employee-table tr:last-child td {
            border-bottom: none;
        }
    `;
    document.head.appendChild(style);
}

// ===== ЗАГРУЗКА ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ =====
async function loadCurrentUser() {
    try {
        const token = new URLSearchParams(window.location.search).get('token');
        const response = await fetch('/api/current-user', {
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            AppState.currentUser = await response.json();
            console.log('✅ Пользователь загружен:', AppState.currentUser);
            updateUserDisplay();
            return true;
        } else if (response.status === 401) {
            window.location.href = '/';
            return false;
        }
        return false;
    } catch (error) {
        console.error('❌ Ошибка загрузки пользователя:', error);
        return false;
    }
}

function updateUserDisplay() {
    if (!AppState.currentUser) return;
    
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    
    if (userNameEl) {
        userNameEl.textContent = AppState.currentUser.fullName || AppState.currentUser.username;
    }
    
    if (userRoleEl) {
        let roleText = '';
        switch(AppState.currentUser.role) {
            case 'admin': roleText = 'Администратор'; break;
            case 'user': roleText = 'Пользователь'; break;
            case 'operator': roleText = 'Оператор'; break;
            default: roleText = 'Пользователь';
        }
        userRoleEl.textContent = roleText;
    }
    
    updateUIBasedOnRole();
}

// ===== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА В ЗАВИСИМОСТИ ОТ РОЛИ =====
function updateUIBasedOnRole() {
    const role = AppState.currentUser?.role;
    
    const addButtons = document.querySelectorAll('.add-button');
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const topTabs = document.querySelectorAll('.top-tab');
    
    addButtons.forEach(btn => btn.style.display = '');
    editButtons.forEach(btn => btn.style.display = '');
    deleteButtons.forEach(btn => btn.style.display = '');
    sidebarTabs.forEach(tab => tab.style.display = '');
    topTabs.forEach(tab => tab.style.display = '');
    
    switch(role) {
        case 'admin':
            break;
        case 'user':
            deleteButtons.forEach(btn => btn.style.display = 'none');
            topTabs.forEach(tab => {
                const text = tab.textContent.trim().toLowerCase();
                if (text === 'сотрудники') {
                    tab.style.display = 'none';
                }
            });
            sidebarTabs.forEach(tab => {
                const text = tab.textContent.trim().toLowerCase();
                if (text.includes('типы изделий') || text.includes('места производства')) {
                    tab.style.display = 'none';
                }
            });
            break;
        case 'operator':
            addButtons.forEach(btn => btn.style.display = 'none');
            editButtons.forEach(btn => btn.style.display = 'none');
            deleteButtons.forEach(btn => btn.style.display = 'none');
            sidebarTabs.forEach(tab => {
                const text = tab.textContent.trim().toLowerCase();
                if (!text.includes('устройства') && !text.includes('статистика')) {
                    tab.style.display = 'none';
                }
            });
            topTabs.forEach(tab => {
                const text = tab.textContent.trim().toLowerCase();
                if (text !== 'профиль' && text !== 'о программе' && text !== 'выйти') {
                    tab.style.display = 'none';
                }
            });
            break;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📢 dashboard.js загружен');
    
    addFixedTableStyles();
    
    if (AppState.currentTheme === 'dark') {
        document.body.classList.add('theme-dark');
    }
    
    const userLoaded = await loadCurrentUser();
    if (!userLoaded) return;
    
    await loadReferenceData();
    
    setTimeout(() => {
        if (typeof window.showContent === 'function') {
            window.showContent('devices');
        }
    }, 100);
});

// ===== ЗАГРУЗКА СПРАВОЧНЫХ ДАННЫХ =====
async function loadReferenceData() {
    console.log('📚 Загрузка справочных данных...');
    try {
        const [types, months, years, stages, locations, places] = await Promise.all([
            apiRequest('/api/device-types').then(r => r.ok ? r.json() : []),
            apiRequest('/api/production-months').then(r => r.ok ? r.json() : []),
            apiRequest('/api/production-years').then(r => r.ok ? r.json() : []),
            apiRequest('/api/production-stages').then(r => r.ok ? r.json() : []),
            apiRequest('/api/locations').then(r => r.ok ? r.json() : []),
            apiRequest('/api/production-places').then(r => r.ok ? r.json() : [])
        ]);
        
        AppState.deviceTypes = types;
        AppState.productionMonths = months;
        AppState.productionYears = years;
        AppState.productionStages = stages;
        AppState.locations = locations;
        AppState.productionPlaces = places;
        
        console.log('✅ Справочные данные загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки справочных данных:', error);
    }
}

function getDeviceImage(deviceType) {
    if (!deviceType) return '/images/default.png';
    const type = deviceType.toLowerCase();
    
    if (type.includes('isn41508t3-m-ac') || type.includes('isbn41508t3-m-ac')) return '/images/ISBN41508T3-M-AC.png';
    if (type.includes('isn41508t3-m') || type.includes('isbn41508t3-m')) return '/images/ISBN41508T3-M.png';
    if (type.includes('isn41508t3') || type.includes('isbn41508t3')) return '/images/ISBN41508T3.png';
    if (type.includes('isn41508t4') || type.includes('isbn41508t4')) return '/images/ISBN41508T4.png';
    if (type.includes('isn50502t5')) return '/images/ISN50502T5.png';
    if (type.includes('isn42124t5c4')) return '/images/ISBN41508T3.png';
    if (type.includes('isn42124t5p5')) return '/images/ISBN41508T3-M.png';
    if (type.includes('isn42124x5')) return '/images/ISBN41508T4.png';
    
    return '/images/default.png';
}

function escapeHtml(str) {
    if (!str) return '—';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ===== УСТРОЙСТВА =====
async function loadDevices() {
    console.log('📱 loadDevices вызвана');
    const container = document.getElementById('devices-list');
    if (container) container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        const response = await apiRequest('/api/devices');
        if (response.ok) {
            AppState.devices = await response.json();
            AppState.filteredDevices = [...AppState.devices];
            console.log('✅ Устройства загружены:', AppState.devices.length);
            renderDevicesTable();
        } else {
            console.error('❌ Ошибка загрузки устройств:', response.status);
            showNotification('Ошибка загрузки устройств', 'error');
            if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки устройств:', error);
        showNotification('Ошибка загрузки устройств', 'error');
        if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
    }
}

function renderDevicesTable() {
    const container = document.getElementById('devices-list');
    if (!container) return;
    if (AppState.filteredDevices.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет устройств</div>';
        return;
    }
    
    let html = '<div class="table-container"><table class="data-table"><thead>   <tr>';
    html += '<th style="width: 80px;">Изображение</th>';
    html += '<th style="width: 150px;">Серийный номер</th>';
    html += '<th style="width: 120px;">Тип</th>';
    html += '<th style="width: 150px;">Модель</th>';
    html += '<th style="width: 100px;">Версия ОС</th>';
    html += '<th style="width: 120px;">Дата производства</th>';
    html += '<th style="width: 80px;">Статус</th>';
    html += '<th style="width: 120px;">Действия</th>';
    html += '</tr></thead><tbody>';
    
    AppState.filteredDevices.forEach(device => {
        const statusClass = device.diag ? 'success' : 'danger';
        const statusText = device.diag ? 'Готов' : 'Проблема';
        const imagePath = device.image_path || getDeviceImage(device.type);
        
        html += `<tr class="fade-in">
            <td style="text-align:center;">
                <img src="${imagePath}" 
                     alt="${escapeHtml(device.type || 'Устройство')}" 
                     class="device-image" 
                     onerror="this.src='/images/default.png'">
              </td>
              <td><strong>${escapeHtml(device.product_serial_number || '—')}</strong></td>
              <td>${escapeHtml(device.device_type_name || '—')}</td>
              <td>${escapeHtml(device.type || '—')}</td>
              <td>${escapeHtml(device.version_os || '—')}</td>
              <td>${escapeHtml(device.manufactures_date || '—')}</td>
              <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="table-actions">
                <button class="edit-btn" onclick="showDeviceDetails(${device.id})">👁️</button>`;
        
        if (AppState.currentUser?.role === 'admin' || AppState.currentUser?.role === 'user') {
            html += `<button class="edit-btn" onclick="editDevice(${device.id})">✎</button>`;
        }
        if (AppState.currentUser?.role === 'admin') {
            html += `<button class="delete-btn" onclick="deleteDevice(${device.id})">✕</button>`;
        }
        html += `</td>
            </tr>`;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function searchDevices() {
    const searchTerm = document.getElementById('deviceSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('deviceTypeFilter')?.value || '';
    
    AppState.filteredDevices = AppState.devices.filter(device => {
        const matchesSearch = searchTerm === '' || 
            (device.product_serial_number && device.product_serial_number.toLowerCase().includes(searchTerm)) ||
            (device.type && device.type.toLowerCase().includes(searchTerm)) ||
            (device.device_type_name && device.device_type_name.toLowerCase().includes(searchTerm));
        const matchesType = typeFilter === '' || (device.device_type_id && device.device_type_id.toString() === typeFilter);
        return matchesSearch && matchesType;
    });
    renderDevicesTable();
}

function filterDevicesByType() { searchDevices(); }

function updateDeviceTypeFilter() {
    const filterSelect = document.getElementById('deviceTypeFilter');
    if (!filterSelect) return;
    
    const existingTypes = {};
    AppState.devices.forEach(device => {
        if (device.device_type_id && device.device_type_name) {
            existingTypes[device.device_type_id] = {
                id: device.device_type_id,
                name: device.device_type_name,
                code: device.device_type_code
            };
        }
    });
    
    let options = '<option value="">Все типы</option>';
    Object.values(existingTypes).forEach(type => {
        options += `<option value="${type.id}">${escapeHtml(type.name)} (${escapeHtml(type.code)})</option>`;
    });
    filterSelect.innerHTML = options;
}

async function showDeviceDetails(id) {
    const device = AppState.devices.find(d => d.id === id);
    if (!device) return;
    
    let components = [];
    try {
        const response = await apiRequest(`/api/components/device/${id}`);
        if (response.ok) components = await response.json();
    } catch (error) { console.error('Ошибка загрузки комплектующих:', error); }
    
    const imagePath = device.image_path || getDeviceImage(device.type);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header"><h3>Детали устройства</h3><button class="modal-close" onclick="closeModal(this)">×</button></div>
            <div class="modal-content">
                <div style="display:flex; align-items:center; gap:2rem; margin-bottom:1.5rem;">
                    <img src="${imagePath}" style="width:120px; height:120px; object-fit:contain; background:var(--bg-soft); padding:8px; border-radius:8px;" onerror="this.src='/images/default.png'">
                    <div><h2 style="margin:0 0 0.5rem; color:var(--primary);">${escapeHtml(device.product_serial_number || 'Без номера')}</h2><p>${escapeHtml(device.type || '')}</p></div>
                </div>
                <div class="info-row"><span class="info-label">Серийный номер:</span><span class="info-value">${escapeHtml(device.product_serial_number || 'Не указан')}</span></div>
                <div class="info-row"><span class="info-label">Тип:</span><span class="info-value">${escapeHtml(device.device_type_name || 'Не указан')}</span></div>
                <div class="info-row"><span class="info-label">Модель:</span><span class="info-value">${escapeHtml(device.type || 'Не указана')}</span></div>
                <div class="info-row"><span class="info-label">Версия ОС:</span><span class="info-value">${escapeHtml(device.version_os || 'Не указана')}</span></div>
                <div class="info-row"><span class="info-label">Дата производства:</span><span class="info-value">${escapeHtml(device.manufactures_date || 'Не указана')}</span></div>
                <div class="info-row"><span class="info-label">Статус:</span><span class="info-value"><span class="status-badge ${device.diag ? 'success' : 'danger'}">${device.diag ? 'Готов' : 'Проблема'}</span></span></div>
                <h4>Комплектующие</h4>
                ${components.length > 0 ? `<div>${components.map(c => `<div style="padding:0.5rem; border-bottom:1px solid var(--border-soft);"><strong>${escapeHtml(c.type)}:</strong> ${escapeHtml(c.name)}${c.author ? `<div><small>Проверил: ${escapeHtml(c.author)}</small></div>` : ''}</div>`).join('')}</div>` : '<p class="empty-state">Нет комплектующих</p>'}
            </div>
            <div class="modal-footer"><button class="btn-cancel" onclick="closeModal(this)">Закрыть</button>
            ${(AppState.currentUser?.role === 'admin' || AppState.currentUser?.role === 'user') ? `<button class="btn-save" onclick="editDevice(${device.id}); closeModal(this);">Редактировать</button>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ===== ДОБАВЛЕНИЕ УСТРОЙСТВА =====
async function addDevice() {
    await loadReferenceData();
    const today = new Date().toISOString().split('T')[0];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Добавить устройство</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="form-group">
                    <label>Изображение устройства</label>
                    <div style="display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap;">
                        <div id="image-preview" class="image-preview" style="width: 120px; height: 120px;">
                            <span style="color: var(--text-tertiary); font-size: 12px;">Нет фото</span>
                        </div>
                        <div style="flex: 1;">
                            <input type="file" id="device-image" accept="image/*" style="display: none;">
                            <button type="button" class="btn-cancel" onclick="document.getElementById('device-image').click()" style="margin-right: 0.5rem;">📁 Выбрать файл</button>
                            <button type="button" class="btn-cancel" onclick="clearImagePreview()">🗑 Очистить</button>
                            <div style="margin-top: 8px; font-size: 12px; color: var(--text-tertiary);">
                                Поддерживаемые форматы: JPG, PNG, GIF, WEBP (макс. 5 МБ)
                            </div>
                        </div>
                    </div>
                    <input type="hidden" id="modal-image-path" value="">
                </div>
                <div class="form-group">
                    <label>Тип устройства *</label>
                    <select id="modal-device-type" required>
                        <option value="">Выберите тип</option>
                        ${AppState.deviceTypes.map(t => `<option value="${t.id}">${escapeHtml(t.name)} (${escapeHtml(t.code)})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Серийный номер *</label>
                    <input type="text" id="modal-serial-number" placeholder="Например: RS101016430001" required>
                </div>
                <div class="form-group">
                    <label>Модель/Тип</label>
                    <input type="text" id="modal-type" placeholder="Например: ISN4150873 +10n">
                </div>
                <div class="form-group">
                    <label>Версия ОС</label>
                    <input type="text" id="modal-version-os" placeholder="Например: RouterOS 6.0">
                </div>
                <div class="form-group">
                    <label>Место производства</label>
                    <select id="modal-production-place">
                        <option value="">Не выбрано</option>
                        ${AppState.productionPlaces.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.code)})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Дата производства</label>
                    <input type="date" id="modal-manufactures-date" value="${today}">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="modal-diag" checked> Диагностика пройдена
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="saveDevice()">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const fileInput = document.getElementById('device-image');
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Файл слишком большой! Максимум 5 МБ.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            showNotification('Загрузка изображения...', 'info');
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': new URLSearchParams(window.location.search).get('token')
                },
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('modal-image-path').value = data.imagePath;
                showNotification('✅ Изображение загружено', 'success');
            } else {
                const error = await response.json();
                showNotification(error.error || 'Ошибка загрузки изображения', 'error');
                const preview = document.getElementById('image-preview');
                preview.innerHTML = '<span style="color: var(--text-tertiary); font-size: 12px;">Нет фото</span>';
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showNotification('Ошибка загрузки изображения', 'error');
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '<span style="color: var(--text-tertiary); font-size: 12px;">Нет фото</span>';
        }
    });
}

function clearImagePreview() {
    document.getElementById('modal-image-path').value = '';
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '<span style="color: var(--text-tertiary); font-size: 12px;">Нет фото</span>';
    const fileInput = document.getElementById('device-image');
    if (fileInput) fileInput.value = '';
}

async function saveDevice() {
    const deviceData = {
        device_type_id: document.getElementById('modal-device-type')?.value || null,
        product_serial_number: document.getElementById('modal-serial-number')?.value,
        type: document.getElementById('modal-type')?.value,
        version_os: document.getElementById('modal-version-os')?.value,
        place_of_production_id: document.getElementById('modal-production-place')?.value || null,
        manufactures_date: document.getElementById('modal-manufactures-date')?.value,
        diag: document.getElementById('modal-diag')?.checked,
        image_path: document.getElementById('modal-image-path')?.value || null
    };
    
    if (!deviceData.product_serial_number) {
        showNotification('Введите серийный номер', 'warning');
        return;
    }
    
    if (!deviceData.device_type_id) {
        showNotification('Выберите тип устройства', 'warning');
        return;
    }
    
    const existingDevice = AppState.devices.find(d => d.product_serial_number === deviceData.product_serial_number);
    if (existingDevice) {
        showNotification('Устройство с таким серийным номером уже существует!', 'error');
        return;
    }
    
    try {
        const response = await apiRequest('/api/devices', {
            method: 'POST',
            body: JSON.stringify(deviceData)
        });
        
        if (response.ok) {
            showNotification('✅ Устройство успешно добавлено', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadDevices();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при добавлении устройства', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function editDevice(id) {
    const device = AppState.devices.find(d => d.id === id);
    if (!device) return;
    await loadReferenceData();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Редактировать устройство</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="form-group">
                    <label>Изображение устройства</label>
                    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <div id="image-preview" class="image-preview">
                            ${device.image_path ? `<img src="${device.image_path}" style="width: 100%; height: 100%; object-fit: contain;">` : '<span style="color: var(--text-tertiary);">Нет фото</span>'}
                        </div>
                        <div style="flex: 1;">
                            <input type="file" id="device-image" accept="image/*" style="display: none;">
                            <button type="button" class="btn-cancel" onclick="document.getElementById('device-image').click()" style="margin-right: 0.5rem;">Выбрать файл</button>
                            <button type="button" class="btn-cancel" onclick="clearImagePreview()">Очистить</button>
                        </div>
                    </div>
                    <input type="hidden" id="modal-image-path" value="${device.image_path || ''}">
                </div>
                <div class="form-group">
                    <label>Тип устройства</label>
                    <select id="modal-device-type">
                        <option value="">Выберите тип</option>
                        ${AppState.deviceTypes.map(t => `<option value="${t.id}" ${t.id === device.device_type_id ? 'selected' : ''}>${escapeHtml(t.name)} (${escapeHtml(t.code)})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Серийный номер</label>
                    <input type="text" id="modal-serial-number" value="${escapeHtml(device.product_serial_number || '')}">
                </div>
                <div class="form-group">
                    <label>Модель/Тип</label>
                    <input type="text" id="modal-type" value="${escapeHtml(device.type || '')}">
                </div>
                <div class="form-group">
                    <label>Версия ОС</label>
                    <input type="text" id="modal-version-os" value="${escapeHtml(device.version_os || '')}">
                </div>
                <div class="form-group">
                    <label>Место производства</label>
                    <select id="modal-production-place">
                        <option value="">Не выбрано</option>
                        ${AppState.productionPlaces.map(p => `<option value="${p.id}" ${p.id === device.place_of_production_id ? 'selected' : ''}>${escapeHtml(p.name)} (${escapeHtml(p.code)})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Дата производства</label>
                    <input type="date" id="modal-manufactures-date" value="${device.manufactures_date || ''}">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="modal-diag" ${device.diag ? 'checked' : ''}> Диагностика пройдена
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="updateDevice(${id})">Обновить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const fileInput = document.getElementById('device-image');
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await apiRequest('/api/upload-image', {
                method: 'POST',
                body: formData,
                headers: {}
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('modal-image-path').value = data.imagePath;
                const preview = document.getElementById('image-preview');
                preview.innerHTML = `<img src="${data.imagePath}" style="width: 100%; height: 100%; object-fit: contain;">`;
            } else {
                showNotification('Ошибка загрузки изображения', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка загрузки изображения', 'error');
        }
    });
}

async function updateDevice(id) {
    const deviceData = {
        device_type_id: document.getElementById('modal-device-type')?.value || null,
        product_serial_number: document.getElementById('modal-serial-number')?.value,
        type: document.getElementById('modal-type')?.value,
        version_os: document.getElementById('modal-version-os')?.value,
        place_of_production_id: document.getElementById('modal-production-place')?.value || null,
        manufactures_date: document.getElementById('modal-manufactures-date')?.value,
        diag: document.getElementById('modal-diag')?.checked,
        image_path: document.getElementById('modal-image-path')?.value || null
    };
    
    if (!deviceData.product_serial_number) {
        showNotification('Введите серийный номер', 'warning');
        return;
    }
    
    try {
        const response = await apiRequest(`/api/devices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(deviceData)
        });
        
        if (response.ok) {
            showNotification('✅ Устройство обновлено', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadDevices();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при обновлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function deleteDevice(id) {
    if (!confirm('Вы уверены, что хотите удалить это устройство?')) return;
    try {
        const response = await apiRequest(`/api/devices/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('✅ Устройство удалено', 'success');
            await loadDevices();
        } else {
            showNotification('❌ Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

// ===== ТИПЫ ИЗДЕЛИЙ =====
async function loadProductTypes() {
    console.log('📋 loadProductTypes вызвана');
    const container = document.getElementById('product-types-list');
    if (container) container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        const response = await apiRequest('/api/device-types');
        if (response.ok) {
            const types = await response.json();
            const filteredTypes = types.filter(type => type.code === 'RS' || type.code === 'SA');
            renderProductTypes(filteredTypes);
        } else {
            console.error('❌ Ошибка загрузки типов:', response.status);
            showNotification('Ошибка загрузки типов', 'error');
            if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки типов:', error);
        showNotification('Ошибка загрузки типов', 'error');
        if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
    }
}

function renderProductTypes(types) {
    const container = document.getElementById('product-types-list');
    if (!container) return;
    
    if (types.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет типов изделий</div>';
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Код</th>
                        <th style="width: 100px;">Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    types.forEach(type => {
        let icon = '';
        if (type.code === 'RS') icon = '🔄';
        else if (type.code === 'SA') icon = '🔌';
        
        html += `
            <tr>
                <td style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2rem;">${icon}</span>
                    <strong>${escapeHtml(type.name)}</strong>
                </td>
                <td><span class="status-badge info">${escapeHtml(type.code)}</span></td>
        `;
        
        if (AppState.currentUser?.role === 'admin') {
            html += `
                <td class="table-actions">
                    <button class="delete-btn" onclick="deleteProductType(${type.id})" title="Удалить тип">✕</button>
                </td>
            `;
        } else {
            html += `<td style="color: var(--text-tertiary);">—</td>`;
        }
        html += `</tr>`;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

async function addProductType() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Добавить тип изделия</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" id="modal-type-name" placeholder="Сервисный маршрутизатор">
                </div>
                <div class="form-group">
                    <label>Код *</label>
                    <input type="text" id="modal-type-code" placeholder="RS" maxlength="10">
                    <small style="color: var(--text-tertiary);">Рекомендуемые коды: RS (сервисный маршрутизатор), SA (коммутатор доступа)</small>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="saveProductType()">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveProductType() {
    const name = document.getElementById('modal-type-name')?.value;
    const code = document.getElementById('modal-type-code')?.value;
    
    if (!name || !code) {
        showNotification('Заполните все поля', 'warning');
        return;
    }
    
    if (code !== 'RS' && code !== 'SA') {
        if (!confirm(`Вы добавляете тип с кодом "${code}". В системе используются только RS и SA. Продолжить?`)) {
            return;
        }
    }
    
    try {
        const response = await apiRequest('/api/device-types', { 
            method: 'POST', 
            body: JSON.stringify({ name, code }) 
        });
        
        if (response.ok) {
            showNotification('✅ Тип добавлен', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadProductTypes();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при добавлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function deleteProductType(id) {
    const type = AppState.deviceTypes.find(t => t.id === id);
    
    if (type && (type.code === 'RS' || type.code === 'SA')) {
        showNotification('❌ Нельзя удалить базовые типы устройств (RS и SA)', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этот тип? Устройства этого типа могут быть удалены!')) return;
    
    try {
        const response = await apiRequest(`/api/device-types/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('✅ Тип удален', 'success');
            await loadProductTypes();
        } else {
            showNotification('❌ Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

// ===== КОМПЛЕКТУЮЩИЕ =====
let allComponents = [];
let deviceTypeMap = {};

async function loadComponents() {
    console.log('🔧 loadComponents вызвана');
    const container = document.getElementById('components-list');
    if (container) container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        const componentsResponse = await apiRequest('/api/components');
        if (componentsResponse.ok) {
            allComponents = await componentsResponse.json();
            console.log('✅ Комплектующие загружены:', allComponents.length);
            
            const devicesResponse = await apiRequest('/api/devices');
            if (devicesResponse.ok) {
                const devices = await devicesResponse.json();
                deviceTypeMap = {};
                devices.forEach(device => {
                    deviceTypeMap[device.id] = {
                        type: device.device_type_code || 'unknown',
                        name: device.device_type_name || 'Неизвестно'
                    };
                });
            }
            
            renderComponentsTable(allComponents, 'all');
        } else {
            console.error('❌ Ошибка загрузки комплектующих:', componentsResponse.status);
            showNotification('Ошибка загрузки комплектующих', 'error');
            if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки комплектующих:', error);
        showNotification('Ошибка загрузки комплектующих', 'error');
        if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
    }
}

function filterComponentsByType(deviceType) {
    console.log(`🔍 Фильтрация комплектующих по типу: ${deviceType}`);
    
    const tabs = document.querySelectorAll('.component-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (deviceType === 'all' && tab.textContent.toLowerCase().includes('все')) {
            tab.classList.add('active');
        } else if (deviceType === 'RS' && tab.textContent.toLowerCase().includes('сервисные')) {
            tab.classList.add('active');
        } else if (deviceType === 'SA' && tab.textContent.toLowerCase().includes('коммутаторы')) {
            tab.classList.add('active');
        }
    });
    
    if (deviceType === 'all') {
        renderComponentsTable(allComponents, 'all');
        return;
    }
    
    const filteredComponents = allComponents.filter(component => {
        if (!component.device_id) return false;
        const deviceInfo = deviceTypeMap[component.device_id];
        return deviceInfo && deviceInfo.type === deviceType;
    });
    
    renderComponentsTable(filteredComponents, deviceType);
}

function renderComponentsTable(components, filterType = 'all') {
    const container = document.getElementById('components-list');
    if (!container) return;
    
    if (components.length === 0) {
        let message = 'Нет комплектующих';
        if (filterType === 'RS') message = 'Нет комплектующих для сервисных маршрутизаторов';
        else if (filterType === 'SA') message = 'Нет комплектующих для коммутаторов доступа';
        
        container.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    let html = '';
    
    if (filterType !== 'all') {
        html += `<div class="filter-info"><p>Найдено комплектующих: ${components.length}</p></div>`;
    }
    
    html += '<div class="table-container"><table class="data-table">';
    html += `
        <thead>
            <tr>
                <th>Тип</th>
                <th>Наименование</th>
                <th>Устройство</th>
                <th>Тип устройства</th>
                <th>Проверил</th>
    `;
    
    if (AppState.currentUser?.role === 'admin') {
        html += `<th>Действия</th>`;
    }
    
    html += `</tr></thead><tbody>`;
    
    components.forEach(comp => {
        const deviceInfo = comp.device_id ? deviceTypeMap[comp.device_id] : null;
        const deviceSerial = comp.device_id ? 
            AppState.devices.find(d => d.id === comp.device_id)?.product_serial_number : null;
        
        let deviceTypeDisplay = '—';
        if (deviceInfo) {
            switch(deviceInfo.type) {
                case 'RS': deviceTypeDisplay = 'Сервисный маршрутизатор'; break;
                case 'SA': deviceTypeDisplay = 'Коммутатор доступа'; break;
                default: deviceTypeDisplay = deviceInfo.name;
            }
        }
        
        html += `
            <tr data-id="${comp.id}" data-type="${comp.type}">
                <td><span class="status-badge info">${escapeHtml(comp.type)}</span></td>
                <td><strong>${escapeHtml(comp.name)}</strong></td>
                <td>${escapeHtml(deviceSerial || '—')}</td>
                <td>${escapeHtml(deviceTypeDisplay)}</td>
                <td>${escapeHtml(comp.author || '—')}</td>
        `;
        
        if (AppState.currentUser?.role === 'admin') {
            html += `
                <td class="table-actions">
                    <button class="delete-btn" onclick="deleteComponent(${comp.id}, '${comp.type}')">✕</button>
                </td>
            `;
        } else {
            html += `<td style="color: var(--text-tertiary);">—</td>`;
        }
        
        html += `</tr>`;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function addComponent() {
    try {
        const typesResponse = await apiRequest('/api/component-types');
        const types = await typesResponse.json();
        const devicesResponse = await apiRequest('/api/devices');
        const devices = await devicesResponse.json();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header"><h3>Добавить комплектующее</h3><button class="modal-close" onclick="closeModal(this)">×</button></div>
                <div class="modal-content">
                    <div class="form-group"><label>Тип комплектующего *</label><select id="modal-component-type" required><option value="">Выберите тип</option>${types.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Серийный номер / Название *</label><input type="text" id="modal-component-name" placeholder="Введите серийный номер" required></div>
                    <div class="form-group"><label>ID устройства (необязательно)</label><select id="modal-component-device"><option value="">Не привязывать к устройству</option>${devices.map(d => `<option value="${d.id}">${escapeHtml(d.product_serial_number || 'Без номера')}</option>`).join('')}</select></div>
                    <div class="form-group" id="modal-author-group" style="display: none;"><label>Кто проверил</label><input type="text" id="modal-component-author" placeholder="ФИО проверяющего"></div>
                </div>
                <div class="modal-footer"><button class="btn-cancel" onclick="closeModal(this)">Отмена</button><button class="btn-save" onclick="saveComponent()">Сохранить</button></div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('modal-component-type').addEventListener('change', function() {
            const authorGroup = document.getElementById('modal-author-group');
            authorGroup.style.display = this.value === 'board' ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Ошибка загрузки данных для формы:', error);
        showNotification('Ошибка загрузки данных', 'error');
    }
}

async function saveComponent() {
    const type = document.getElementById('modal-component-type')?.value;
    const name = document.getElementById('modal-component-name')?.value;
    const deviceId = document.getElementById('modal-component-device')?.value;
    const author = document.getElementById('modal-component-author')?.value;
    
    if (!type) { showNotification('Выберите тип комплектующего', 'warning'); return; }
    if (!name) { showNotification('Введите серийный номер', 'warning'); return; }
    
    try {
        const response = await apiRequest('/api/components', {
            method: 'POST',
            body: JSON.stringify({ type, name, device_id: deviceId || null, author: author || null })
        });
        if (response.ok) {
            showNotification('✅ Комплектующее добавлено', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadComponents();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при добавлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function deleteComponent(id, type) {
    if (!confirm('Вы уверены, что хотите удалить это комплектующее?')) return;
    try {
        const response = await apiRequest(`/api/components/${id}?type=${type}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('✅ Комплектующее удалено', 'success');
            await loadComponents();
        } else {
            showNotification('❌ Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

// ===== МЕСТА ПРОИЗВОДСТВА =====
async function loadProductionPlaces() {
    console.log('🏭 loadProductionPlaces вызвана');
    const container = document.getElementById('production-places-list');
    if (container) container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        const response = await apiRequest('/api/production-places');
        if (response.ok) {
            const places = await response.json();
            renderProductionPlacesTable(places);
        } else {
            console.error('❌ Ошибка загрузки мест:', response.status);
            showNotification('Ошибка загрузки мест производства', 'error');
            if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки мест:', error);
        showNotification('Ошибка загрузки мест производства', 'error');
        if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
    }
}

function renderProductionPlacesTable(places) {
    const container = document.getElementById('production-places-list');
    if (!container) return;
    if (places.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет мест производства</div>';
        return;
    }
    
    let html = '<div class="table-container"><table class="data-table"><thead><tr><th>Название</th><th>Код</th><th>Действия</th></tr></thead><tbody>';
    places.forEach(place => {
        html += `<tr><td><strong>${escapeHtml(place.name)}</strong></td><td>${escapeHtml(place.code)}</td>`;
        if (AppState.currentUser?.role === 'admin') {
            html += `<td class="table-actions"><button class="delete-btn" onclick="deleteProductionPlace(${place.id})">✕</button></td>`;
        } else {
            html += `<td style="color: var(--text-tertiary);">—</td>`;
        }
        html += `</tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function addProductionPlace() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header"><h3>Добавить место производства</h3><button class="modal-close" onclick="closeModal(this)">×</button></div>
            <div class="modal-content">
                <div class="form-group"><label>Название *</label><input type="text" id="modal-place-name" placeholder="АО НПП Исток"></div>
                <div class="form-group"><label>Код *</label><input type="text" id="modal-place-code" placeholder="01" maxlength="10"></div>
            </div>
            <div class="modal-footer"><button class="btn-cancel" onclick="closeModal(this)">Отмена</button><button class="btn-save" onclick="saveProductionPlace()">Сохранить</button></div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveProductionPlace() {
    const name = document.getElementById('modal-place-name')?.value;
    const code = document.getElementById('modal-place-code')?.value;
    if (!name || !code) { showNotification('Заполните все поля', 'warning'); return; }
    
    try {
        const response = await apiRequest('/api/production-places', { method: 'POST', body: JSON.stringify({ name, code }) });
        if (response.ok) {
            showNotification('✅ Место добавлено', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadProductionPlaces();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при добавлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function deleteProductionPlace(id) {
    if (!confirm('Вы уверены, что хотите удалить это место?')) return;
    try {
        const response = await apiRequest(`/api/production-places/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('✅ Место удалено', 'success');
            await loadProductionPlaces();
        } else {
            showNotification('❌ Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

// ===== СОТРУДНИКИ =====
async function loadEmployees() {
    console.log('👤 loadEmployees вызвана');
    const container = document.getElementById('employees-list');
    if (container) container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        const response = await apiRequest('/api/employees');
        if (response.ok) {
            AppState.employees = await response.json();
            console.log('✅ Сотрудники загружены:', AppState.employees.length);
            updateEmployeeStats();
            filterEmployees();
        } else {
            console.error('❌ Ошибка загрузки сотрудников:', response.status);
            showNotification('Ошибка загрузки сотрудников', 'error');
            if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки сотрудников:', error);
        showNotification('Ошибка загрузки сотрудников', 'error');
        if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
    }
}

function updateEmployeeStats() {
    if (!AppState.employees.length) return;
    
    const total = AppState.employees.length;
    const admins = AppState.employees.filter(e => e.role === 'admin').length;
    const operators = AppState.employees.filter(e => e.role === 'operator').length;
    const users = AppState.employees.filter(e => e.role === 'user').length;
    
    const totalEl = document.getElementById('total-employees');
    const adminEl = document.getElementById('admin-count');
    const operatorEl = document.getElementById('operator-count');
    const userEl = document.getElementById('user-count');
    
    if (totalEl) totalEl.textContent = total;
    if (adminEl) adminEl.textContent = admins;
    if (operatorEl) operatorEl.textContent = operators;
    if (userEl) userEl.textContent = users;
}

function filterEmployees() {
    const searchTerm = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    
    let filtered = [...AppState.employees];
    
    if (searchTerm) {
        filtered = filtered.filter(emp => 
            `${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}`.toLowerCase().includes(searchTerm) ||
            emp.position?.toLowerCase().includes(searchTerm) ||
            emp.username?.toLowerCase().includes(searchTerm)
        );
    }
    
    if (roleFilter) {
        filtered = filtered.filter(emp => emp.role === roleFilter);
    }
    
    const countInfo = document.getElementById('employee-count-info');
    if (countInfo) {
        countInfo.textContent = `Найдено: ${filtered.length} из ${AppState.employees.length}`;
    }
    
    renderEmployeesTableFiltered(filtered);
}

function renderEmployeesTableFiltered(employees) {
    const container = document.getElementById('employees-list');
    if (!container) return;
    
    if (employees.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 3rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                <h3 style="color: var(--text-secondary);">Нет сотрудников</h3>
                <p style="color: var(--text-tertiary);">Соответствующих критериям поиска не найдено</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="employee-card" style="overflow: hidden; background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
            <table class="employee-table">
                <thead>
                    <tr>
                        <th style="width: 60px;"></th>
                        <th>Сотрудник</th>
                        <th>Должность</th>
                        <th>Логин</th>
                        <th>Роль</th>
                        <th style="width: 100px;">Действия</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    employees.forEach(emp => {
        const fullName = `${emp.last_name} ${emp.first_name}${emp.middle_name ? ' ' + emp.middle_name : ''}`;
        const initials = `${emp.last_name?.charAt(0)}${emp.first_name?.charAt(0)}`;
        const roleClass = emp.role === 'admin' ? 'admin' : emp.role === 'operator' ? 'operator' : 'user';
        const roleText = emp.role === 'admin' ? 'Администратор' : emp.role === 'operator' ? 'Оператор' : 'Пользователь';
        
        html += `
            <tr>
                <td>
                    <div class="employee-avatar">
                        ${initials}
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600;">${escapeHtml(fullName)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-tertiary);">ID: ${emp.id}</div>
                </td>
                <td>${escapeHtml(emp.position || '—')}</td>
                <td><code style="background: var(--bg-soft); padding: 0.2rem 0.5rem; border-radius: 4px;">${escapeHtml(emp.username)}</code></td>
                <td><span class="role-badge ${roleClass}">${roleText}</span></td>
        `;
        
        if (AppState.currentUser?.role === 'admin') {
            html += `
                <td class="table-actions">
                    <button class="edit-btn" onclick="editEmployee(${emp.id})" style="padding: 0.4rem 0.8rem;" title="Редактировать">✎</button>
                    <button class="delete-btn" onclick="deleteEmployee(${emp.id})" style="padding: 0.4rem 0.8rem;" title="Удалить">✕</button>
                 </td>
            `;
        } else {
            html += `<td style="color: var(--text-tertiary);">—</td>`;
        }
        html += `</tr>`;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

async function addEmployee() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header"><h3>Добавить сотрудника</h3><button class="modal-close" onclick="closeModal(this)">×</button></div>
            <div class="modal-content">
                <div class="grid-2"><div class="form-group"><label>Фамилия *</label><input type="text" id="modal-last-name" placeholder="Иванов" required></div><div class="form-group"><label>Имя *</label><input type="text" id="modal-first-name" placeholder="Иван" required></div></div>
                <div class="form-group"><label>Отчество</label><input type="text" id="modal-middle-name" placeholder="Иванович"></div>
                <div class="form-group"><label>Должность *</label><input type="text" id="modal-position" placeholder="Инженер" required></div>
                <div class="form-group"><label>Логин *</label><input type="text" id="modal-username" placeholder="ivanov" required></div>
                <div class="form-group"><label>Пароль *</label><input type="password" id="modal-password" placeholder="••••••" required></div>
                <div class="form-group"><label>Роль</label><select id="modal-role"><option value="user">Пользователь</option><option value="admin">Администратор</option><option value="operator">Оператор</option></select></div>
            </div>
            <div class="modal-footer"><button class="btn-cancel" onclick="closeModal(this)">Отмена</button><button class="btn-save" onclick="saveEmployee()">Сохранить</button></div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveEmployee() {
    const password = document.getElementById('modal-password')?.value;
    if (!password) { showNotification('Введите пароль', 'warning'); return; }
    
    const empData = {
        last_name: document.getElementById('modal-last-name')?.value,
        first_name: document.getElementById('modal-first-name')?.value,
        middle_name: document.getElementById('modal-middle-name')?.value,
        position: document.getElementById('modal-position')?.value,
        username: document.getElementById('modal-username')?.value,
        password: password,
        role: document.getElementById('modal-role')?.value
    };
    if (!empData.last_name || !empData.first_name || !empData.position || !empData.username) {
        showNotification('Заполните все обязательные поля', 'warning');
        return;
    }
    
    try {
        const response = await apiRequest('/api/employees', { method: 'POST', body: JSON.stringify(empData) });
        if (response.ok) {
            showNotification('✅ Сотрудник добавлен', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadEmployees();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при добавлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function editEmployee(id) {
    const employee = AppState.employees.find(e => e.id === id);
    if (!employee) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Редактировать сотрудника</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="grid-2">
                    <div class="form-group"><label>Фамилия *</label><input type="text" id="modal-last-name" value="${escapeHtml(employee.last_name)}" required></div>
                    <div class="form-group"><label>Имя *</label><input type="text" id="modal-first-name" value="${escapeHtml(employee.first_name)}" required></div>
                </div>
                <div class="form-group"><label>Отчество</label><input type="text" id="modal-middle-name" value="${escapeHtml(employee.middle_name || '')}"></div>
                <div class="form-group"><label>Должность *</label><input type="text" id="modal-position" value="${escapeHtml(employee.position)}" required></div>
                <div class="form-group"><label>Логин *</label><input type="text" id="modal-username" value="${escapeHtml(employee.username)}" required></div>
                <div class="form-group"><label>Новый пароль (оставьте пустым, чтобы не менять)</label><input type="password" id="modal-password" placeholder="••••••"></div>
                <div class="form-group"><label>Роль</label>
                    <select id="modal-role">
                        <option value="user" ${employee.role === 'user' ? 'selected' : ''}>Пользователь</option>
                        <option value="admin" ${employee.role === 'admin' ? 'selected' : ''}>Администратор</option>
                        <option value="operator" ${employee.role === 'operator' ? 'selected' : ''}>Оператор</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="updateEmployee(${id})">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function updateEmployee(id) {
    const empData = {
        last_name: document.getElementById('modal-last-name')?.value,
        first_name: document.getElementById('modal-first-name')?.value,
        middle_name: document.getElementById('modal-middle-name')?.value,
        position: document.getElementById('modal-position')?.value,
        username: document.getElementById('modal-username')?.value,
        password: document.getElementById('modal-password')?.value,
        role: document.getElementById('modal-role')?.value
    };
    
    if (!empData.last_name || !empData.first_name || !empData.position || !empData.username) {
        showNotification('Заполните все обязательные поля', 'warning');
        return;
    }
    
    try {
        const response = await apiRequest(`/api/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(empData)
        });
        
        if (response.ok) {
            showNotification('✅ Сотрудник обновлен', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadEmployees();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при обновлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function deleteEmployee(id) {
    if (!confirm('Вы уверены, что хотите удалить сотрудника?')) return;
    try {
        const response = await apiRequest(`/api/employees/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showNotification('✅ Сотрудник удален', 'success');
            await loadEmployees();
        } else {
            showNotification('❌ Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

// ===== СТАТИСТИКА =====
async function loadStatistics() {
    console.log('📊 loadStatistics вызвана');
    const container = document.getElementById('statistics-content');
    if (container) container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    try {
        const response = await apiRequest('/api/statistics');
        if (response.ok) {
            const stats = await response.json();
            renderStatistics(stats);
        } else {
            console.error('❌ Ошибка загрузки статистики:', response.status);
            showNotification('Ошибка загрузки статистики', 'error');
            if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки статистики:', error);
        showNotification('Ошибка загрузки статистики', 'error');
        if (container) container.innerHTML = '<div class="empty-state">Ошибка загрузки данных</div>';
    }
}

function renderStatistics(stats) {
    const container = document.getElementById('statistics-content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="stats-section">
                <div class="section-header"><h2>ОБЩАЯ СТАТИСТИКА</h2></div>
                <div style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div class="stat-item"><div class="stat-value">${stats.devices.total}</div><div class="stat-label">Всего устройств</div></div>
                        <div class="stat-item"><div class="stat-value">${stats.devices.ready}</div><div class="stat-label">Готово</div></div>
                        <div class="stat-item"><div class="stat-value">${stats.devices.problems}</div><div class="stat-label">С проблемами</div></div>
                        <div class="stat-item"><div class="stat-value">${stats.devices.ready_percentage}%</div><div class="stat-label">Готовность</div></div>
                    </div>
                </div>
            </div>
            <div class="stats-section">
                <div class="section-header"><h2>ПО ТИПАМ УСТРОЙСТВ</h2></div>
                <div style="padding: 1.5rem;">
                    ${stats.byType.map(type => `<div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border-soft);"><span style="font-weight: 600;">${escapeHtml(type.name)}</span><span>${type.count} шт.</span></div>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) modal.remove();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#8B9A7A' : type === 'error' ? '#C46B6B' : type === 'warning' ? '#C49A8C' : '#B7A187'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ===== ОСНОВНАЯ ФУНКЦИЯ ОТОБРАЖЕНИЯ КОНТЕНТА =====
async function showContent(contentType) {
    console.log('🔄 Переключение на вкладку:', contentType);
    
    if (AppState.currentUser?.role === 'operator') {
        if (contentType !== 'devices' && contentType !== 'statistic') {
            showNotification('Доступ запрещен. Оператор может только просматривать устройства и статистику.', 'warning');
            return;
        }
    }
    
    if (AppState.currentUser?.role === 'user') {
        if (contentType === 'product-types' || contentType === 'production-places') {
            showNotification('Доступ запрещен. Пользователь не может управлять типами изделий и местами производства.', 'warning');
            return;
        }
    }
    
    AppState.currentContent = contentType;
    const contentArea = document.getElementById('content-area');
    let content = '';

    switch(contentType) {
        case 'devices':
            content = `
                <div class="devices-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>УСТРОЙСТВА</h1>
                        ${(AppState.currentUser?.role === 'admin' || AppState.currentUser?.role === 'user') ? '<button class="add-button" onclick="addDevice()">+ Добавить устройство</button>' : ''}
                    </div>
                    <div class="search-panel">
                        <div class="search-input"><input type="text" id="deviceSearch" placeholder="Поиск по серийному номеру или модели..."><button onclick="searchDevices()">Найти</button></div>
                        <select class="filter-select" id="deviceTypeFilter" onchange="filterDevicesByType()"><option value="">Все типы</option></select>
                    </div>
                    <div class="page-content"><div id="devices-list"></div></div>
                </div>
            `;
            break;
        case 'product-types':
            content = `
                <div class="product-types-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <h1>ТИПЫ ИЗДЕЛИЙ</h1>
                            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Управление типами устройств (Сервисные маршрутизаторы и Коммутаторы доступа)</p>
                        </div>
                        ${AppState.currentUser?.role === 'admin' ? '<button class="add-button" onclick="addProductType()">+ Добавить тип</button>' : ''}
                    </div>
                    <div class="page-content">
                        <div id="product-types-list"></div>
                    </div>
                </div>
            `;
            break;
        case 'components':
            content = `
                <div class="components-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>КОМПЛЕКТУЮЩИЕ</h1>
                        ${(AppState.currentUser?.role === 'admin' || AppState.currentUser?.role === 'user') ? '<button class="add-button" onclick="addComponent()">+ Добавить комплектующее</button>' : ''}
                    </div>
                    <div class="components-tabs">
                        <button class="component-tab active" onclick="filterComponentsByType('all')">Все</button>
                        <button class="component-tab" onclick="filterComponentsByType('RS')">Сервисные маршрутизаторы</button>
                        <button class="component-tab" onclick="filterComponentsByType('SA')">Коммутаторы доступа</button>
                    </div>
                    <div class="page-content"><div id="components-list"></div></div>
                </div>
            `;
            break;
        case 'production-places':
            content = `
                <div class="production-places-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>МЕСТА ПРОИЗВОДСТВА</h1>
                        ${AppState.currentUser?.role === 'admin' ? '<button class="add-button" onclick="addProductionPlace()">+ Добавить место</button>' : ''}
                    </div>
                    <div class="page-content"><div id="production-places-list"></div></div>
                </div>
            `;
            break;
        case 'serial-structure':
            content = `
                <div class="serial-structure">
                    <div class="page-header"><h1>СТРУКТУРА СЕРИЙНЫХ НОМЕРОВ</h1></div>
                    <div class="page-content">
                        <div class="current-format" style="background: var(--bg-soft); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; text-align: center;">
                            <h3>ТЕКУЩИЙ ФОРМАТ:</h3>
                            <div style="font-family: monospace; font-size: 1.8rem; color: var(--primary);">RS 10 10 16 03 0001</div>
                        </div>
                        <div class="explanation"><h4>Расшифровка структуры:</h4>
                            <div style="display: grid; gap: 0.8rem;">
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Тип устройства</span><span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">RS</span><span>2 буквы, тип устройства</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Тип конфигурации</span><span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">10</span><span>2 цифры, конфигурация</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Код производства</span><span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">10</span><span>2 цифры, код цеха</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Год выпуска</span><span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">16</span><span>2 цифры, год</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Месяц выпуска</span><span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">03</span><span>2 цифры, месяц</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Порядковый номер</span><span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">0001</span><span>4 цифры, номер</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'statistic':
            content = `
                <div class="statistics-page">
                    <div class="page-header"><h1>СТАТИСТИКА</h1></div>
                    <div class="page-content" id="statistics-content"></div>
                </div>
            `;
            break;
        default:
            content = `<h3>Добро пожаловать</h3><p>Выберите раздел в боковом меню для работы с системой.</p>`;
    }

    contentArea.innerHTML = content;
    
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(contentType.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });

    setTimeout(() => {
        switch(contentType) {
            case 'devices':
                loadDevices();
                setTimeout(() => updateDeviceTypeFilter(), 500);
                break;
            case 'product-types':
                loadProductTypes();
                break;
            case 'components':
                loadComponents();
                break;
            case 'production-places':
                loadProductionPlaces();
                break;
            case 'statistic':
                loadStatistics();
                break;
        }
    }, 100);
}

// ===== ФУНКЦИИ ДЛЯ ПРОФИЛЯ =====
async function showTopContent(contentType) {
    console.log('🔄 Переключение на верхнюю вкладку:', contentType);
    
    if (AppState.currentUser?.role === 'user') {
        if (contentType === 'employees') {
            showNotification('Доступ запрещен. Пользователь не может управлять сотрудниками.', 'warning');
            return;
        }
    }
    
    if (AppState.currentUser?.role === 'operator') {
        if (contentType !== 'profile' && contentType !== 'about') {
            showNotification('Доступ запрещен. Оператор может только просматривать свой профиль.', 'warning');
            return;
        }
    }
    
    const contentArea = document.getElementById('content-area');
    let content = '';

    switch(contentType) {
        case 'profile':
            content = `
                <div class="profile-page">
                    <div class="page-header"><h1>ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</h1></div>
                    <div class="page-content">
                        <div class="profile-card">
                            <div class="profile-header">
                                <div class="profile-avatar">${AppState.currentUser?.fullName?.charAt(0) || 'А'}</div>
                                <h2>${AppState.currentUser?.fullName || 'Пользователь'}</h2>
                                <p>${AppState.currentUser?.position || 'Должность не указана'}</p>
                            </div>
                            <div class="profile-body">
                                <div class="profile-section">
                                    <h3>Личная информация</h3>
                                    <div class="profile-row"><span class="profile-label">ФИО:</span><span class="profile-value">${AppState.currentUser?.fullName || 'Не указано'}</span></div>
                                    <div class="profile-row"><span class="profile-label">Должность:</span><span class="profile-value">${AppState.currentUser?.position || 'Не указана'}</span></div>
                                    <div class="profile-row"><span class="profile-label">Логин:</span><span class="profile-value">${AppState.currentUser?.username || 'Не указан'}</span></div>
                                    <div class="profile-row"><span class="profile-label">Роль:</span><span class="profile-value">${AppState.currentUser?.role === 'admin' ? 'Администратор' : AppState.currentUser?.role === 'user' ? 'Пользователь' : 'Оператор'}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'employees':
            content = `
                <div class="employees-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <h1 style="font-size: 1.8rem; font-weight: 600; color: var(--primary);">СОТРУДНИКИ</h1>
                            <p style="color: var(--text-secondary); margin-top: 0.5rem;">Управление персоналом предприятия</p>
                        </div>
                        ${AppState.currentUser?.role === 'admin' ? `
                        <button class="add-button" onclick="addEmployee()" style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">+</span> Добавить сотрудника
                        </button>
                        ` : ''}
                    </div>
                    
                    <div id="employees-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="stat-card" style="background: var(--bg-white); border-radius: var(--radius-lg); padding: 1rem; border: 1px solid var(--border-light); text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: var(--primary);" id="total-employees">0</div>
                            <div style="font-size: 0.85rem; color: var(--text-tertiary);">Всего сотрудников</div>
                        </div>
                        <div class="stat-card" style="background: var(--bg-white); border-radius: var(--radius-lg); padding: 1rem; border: 1px solid var(--border-light); text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #8B9A7A;" id="admin-count">0</div>
                            <div style="font-size: 0.85rem; color: var(--text-tertiary);">Администраторы</div>
                        </div>
                        <div class="stat-card" style="background: var(--bg-white); border-radius: var(--radius-lg); padding: 1rem; border: 1px solid var(--border-light); text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #C49A8C;" id="operator-count">0</div>
                            <div style="font-size: 0.85rem; color: var(--text-tertiary);">Операторы</div>
                        </div>
                        <div class="stat-card" style="background: var(--bg-white); border-radius: var(--radius-lg); padding: 1rem; border: 1px solid var(--border-light); text-align: center;">
                            <div style="font-size: 2rem; font-weight: 700; color: #7A9AB7;" id="user-count">0</div>
                            <div style="font-size: 0.85rem; color: var(--text-tertiary);">Пользователи</div>
                        </div>
                    </div>
                    
                    <div class="search-panel" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                        <div style="display: flex; gap: 1rem; flex: 1;">
                            <div class="search-input" style="flex: 1;">
                                <input type="text" id="employeeSearch" placeholder="Поиск по ФИО, должности или логину..." onkeyup="filterEmployees()">
                                <button onclick="filterEmployees()">🔍 Найти</button>
                            </div>
                            <select id="roleFilter" class="filter-select" onchange="filterEmployees()" style="width: 150px;">
                                <option value="">Все роли</option>
                                <option value="admin">Администраторы</option>
                                <option value="user">Пользователи</option>
                                <option value="operator">Операторы</option>
                            </select>
                        </div>
                        <div style="color: var(--text-tertiary); font-size: 0.85rem;" id="employee-count-info"></div>
                    </div>
                    
                    <div class="page-content">
                        <div id="employees-list"></div>
                    </div>
                </div>
            `;
            setTimeout(() => {
                loadEmployees();
            }, 100);
            break;
        case 'about':
            content = `
                <div class="about-page">
                    <div class="page-header"><h1>О ПРОГРАММЕ</h1></div>
                    <div class="page-content">
                        <div class="profile-card">
                            <div class="profile-header"><div class="profile-avatar">Д</div><h2>Дипломный проект</h2><p>Курбатова Мария Владимировна</p></div>
                            <div class="profile-body"><p>Система управления производственным процессом на предприятии.</p><p>© 2026 Курбатова Мария Владимировна</p></div>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'settings':
            content = `
                <div class="settings-page">
                    <div class="page-header"><h1>НАСТРОЙКИ СИСТЕМЫ</h1></div>
                    <div class="page-content">
                        <div class="profile-card">
                            <div class="profile-body">
                                <div class="profile-section">
                                    <h3>Тема оформления</h3>
                                    <div class="profile-row"><span class="profile-label">Темная тема</span><span class="profile-value"><input type="checkbox" onchange="toggleTheme()" ${document.body.classList.contains('theme-dark') ? 'checked' : ''}></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }

    contentArea.innerHTML = content;
    
    const topTabs = document.querySelectorAll('.top-tab');
    topTabs.forEach(tab => tab.classList.remove('active'));
    topTabs.forEach(tab => {
        if (tab.textContent.trim().toLowerCase() === contentType) {
            tab.classList.add('active');
        }
    });
}

function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('theme-dark');
        localStorage.setItem('theme', 'dark');
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        window.location.href = '/';
    }
}

// ===== ЭКСПОРТ ФУНКЦИЙ =====
window.showContent = showContent;
window.showTopContent = showTopContent;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.addDevice = addDevice;
window.editDevice = editDevice;
window.deleteDevice = deleteDevice;
window.showDeviceDetails = showDeviceDetails;
window.saveDevice = saveDevice;
window.updateDevice = updateDevice;
window.searchDevices = searchDevices;
window.filterDevicesByType = filterDevicesByType;
window.updateDeviceTypeFilter = updateDeviceTypeFilter;
window.loadDevices = loadDevices;
window.addProductType = addProductType;
window.deleteProductType = deleteProductType;
window.saveProductType = saveProductType;
window.loadProductTypes = loadProductTypes;
window.loadComponents = loadComponents;
window.filterComponentsByType = filterComponentsByType;
window.addComponent = addComponent;
window.deleteComponent = deleteComponent;
window.loadProductionPlaces = loadProductionPlaces;
window.addProductionPlace = addProductionPlace;
window.deleteProductionPlace = deleteProductionPlace;
window.loadEmployees = loadEmployees;
window.addEmployee = addEmployee;
window.deleteEmployee = deleteEmployee;
window.editEmployee = editEmployee;
window.updateEmployee = updateEmployee;
window.filterEmployees = filterEmployees;
window.updateEmployeeStats = updateEmployeeStats;
window.loadStatistics = loadStatistics;
window.clearImagePreview = clearImagePreview;