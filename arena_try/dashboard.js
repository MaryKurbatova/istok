// ======== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ========
const AppState = {
    currentUser: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    devices: [],
    filteredDevices: [],
    employees: [],
    deviceTypes: [],
    productionPlaces: [],
    productionMonths: [],
    productionYears: [],
    productionStages: [],
    locations: [],
    bmcList: [],
    ubootList: [],
    isoList: [],
    statistics: null,
    currentSection: 'devices'
};

// ======== УПРАВЛЕНИЕ МАСШТАБОМ ========
let currentZoom = 100;

function addZoomControls() {
    const controls = document.createElement('div');
    controls.className = 'zoom-controls';
    controls.innerHTML = `
        <button class="zoom-btn" onclick="zoomOut()">−</button>
        <span class="zoom-value" id="zoomValue">100%</span>
        <button class="zoom-btn" onclick="zoomIn()">+</button>
        <button class="zoom-btn" onclick="resetZoom()" style="font-size:14px;">↺</button>
    `;
    document.body.appendChild(controls);
}

function zoomIn() {
    if (currentZoom < 150) {
        currentZoom += 10;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > 70) {
        currentZoom -= 10;
        applyZoom();
    }
}

function resetZoom() {
    currentZoom = 100;
    applyZoom();
}

function applyZoom() {
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
        appLayout.style.transform = `scale(${currentZoom / 100})`;
        appLayout.style.transformOrigin = 'top left';
        appLayout.style.width = `${10000 / currentZoom}%`;
        const zoomValue = document.getElementById('zoomValue');
        if (zoomValue) zoomValue.textContent = `${currentZoom}%`;
        
        // Сохраняем настройку масштаба
        localStorage.setItem('pageZoom', currentZoom);
    }
}

// Загружаем сохраненный масштаб
function loadZoomSetting() {
    const savedZoom = localStorage.getItem('pageZoom');
    if (savedZoom) {
        currentZoom = parseInt(savedZoom);
        applyZoom();
    }
}

// ======== ИНИЦИАЛИЗАЦИЯ ========
document.addEventListener('DOMContentLoaded', async () => {
    applyTheme();
    addZoomControls();
    loadZoomSetting();
    
    const token = getToken();
    if (!token) {
        window.location.href = '/';
        return;
    }
    try {
        AppState.currentUser = await apiRequest('/api/current-user');
        setupUI();
        await loadAllData();
        showContent('devices');
    } catch (err) {
        console.error('Init error:', err);
        window.location.href = '/';
    }
});

// ======== УТИЛИТЫ ========
function getToken() {
    return new URLSearchParams(window.location.search).get('token') || localStorage.getItem('token');
}

async function apiRequest(url, options = {}) {
    const token = getToken();
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        },
        ...options
    };
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    const resp = await fetch(url, config);
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(err.error || 'Ошибка запроса');
    }
    return resp.json();
}

function notify(message, type = 'info') {
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ======== ТЕМА ========
function applyTheme() {
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = AppState.currentTheme === 'dark' ? '☀' : '🌙';
}

function toggleTheme() {
    AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', AppState.currentTheme);
    applyTheme();
}

// ======== UI SETUP ========
function setupUI() {
    const user = AppState.currentUser;
    if (user.role === 'admin') {
        const employeesLink = document.getElementById('employeesLink');
        if (employeesLink) employeesLink.style.display = '';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        sidebar.classList.toggle('collapsed');
    }
}

// ======== ЗАГРУЗКА ДАННЫХ ========
async function loadAllData() {
    try {
        const [types, places, months, years, stages, locations, bmc, uboot, iso] = await Promise.all([
            apiRequest('/api/device-types'),
            apiRequest('/api/production-places'),
            apiRequest('/api/production-months'),
            apiRequest('/api/production-years'),
            apiRequest('/api/production-stages'),
            apiRequest('/api/locations'),
            apiRequest('/api/bmc'),
            apiRequest('/api/uboot'),
            apiRequest('/api/iso')
        ]);
        AppState.deviceTypes = types;
        AppState.productionPlaces = places;
        AppState.productionMonths = months;
        AppState.productionYears = years;
        AppState.productionStages = stages;
        AppState.locations = locations;
        AppState.bmcList = bmc;
        AppState.ubootList = uboot;
        AppState.isoList = iso;
    } catch (err) {
        console.error('Load data error:', err);
    }
}

// ======== НАВИГАЦИЯ ========
function showContent(section, event) {
    if (event) event.preventDefault();
    AppState.currentSection = section;

    // Обновляем активный пункт навигации
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    const titles = {
        'devices': 'Устройства',
        'device-types': 'Типы изделий',
        'components': 'Комплектующие',
        'production-places': 'Места производства',
        'serial-structure': 'Структура серийного номера',
        'statistics': 'Статистика'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[section] || section;

    switch (section) {
        case 'devices': loadDevices(); break;
        case 'device-types': renderDeviceTypes(); break;
        case 'components': loadComponents(); break;
        case 'production-places': renderProductionPlaces(); break;
        case 'serial-structure': renderSerialStructure(); break;
        case 'statistics': loadStatistics(); break;
    }

    // Скрываем сайдбар на мобильных
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
}

function showTopContent(section, event) {
    if (event) event.preventDefault();
    const titles = {
        'profile': 'Профиль',
        'employees': 'Сотрудники',
        'about': 'О программе',
        'settings': 'Настройки'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[section] || section;

    // Убираем active с боковых
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    switch (section) {
        case 'profile': renderProfile(); break;
        case 'employees': loadEmployees(); break;
        case 'about': renderAbout(); break;
        case 'settings': renderSettings(); break;
    }
}

// ======== УСТРОЙСТВА ========
async function loadDevices() {
    const content = document.getElementById('contentArea');
    if (content) {
        content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка устройств...</p></div>';
    }

    try {
        AppState.devices = await apiRequest('/api/devices');
        AppState.filteredDevices = [...AppState.devices];
        renderDevicesPage();
    } catch (err) {
        if (content) {
            content.innerHTML = `<div class="empty-state"><h3>Ошибка загрузки</h3><p>${err.message}</p></div>`;
        }
    }
}

function renderDevicesPage() {
    const content = document.getElementById('contentArea');
    const user = AppState.currentUser;
    const canEdit = user && (user.role === 'admin' || user.role === 'user');

    if (!content) return;

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📱</div>
                <div class="stat-label">Всего устройств</div>
                <div class="stat-value">${AppState.devices.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔌</div>
                <div class="stat-label">Маршрутизаторы (RS)</div>
                <div class="stat-value">${AppState.devices.filter(d => d.device_type_code === 'RS').length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔀</div>
                <div class="stat-label">Коммутаторы (SA)</div>
                <div class="stat-value">${AppState.devices.filter(d => d.device_type_code === 'SA').length}</div>
            </div>
        </div>

        <div class="search-panel">
            <input type="text" id="searchInput" placeholder="Поиск по серийному номеру, типу..." oninput="searchDevices()">
            <select id="filterType" onchange="searchDevices()">
                <option value="">Все типы</option>
                ${AppState.deviceTypes.map(t => `<option value="${t.code}">${t.name}</option>`).join('')}
            </select>
            <select id="filterLocation" onchange="searchDevices()">
                <option value="">Все местоположения</option>
                ${AppState.locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
            </select>
            ${canEdit ? '<button class="btn btn-primary" onclick="addDevice()">+ Добавить</button>' : ''}
        </div>

        <div class="table-wrapper">
            <table class="data-table" id="devicesTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Серийный номер</th>
                        <th>Тип</th>
                        <th>Модификация</th>
                        <th>Дата производства</th>
                        <th>Местоположение</th>
                        <th>Диагностика</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody id="devicesTableBody"></tbody>
            </table>
        </div>
    `;
    renderDevicesTable();
}

function renderDevicesTable() {
    const tbody = document.getElementById('devicesTableBody');
    if (!tbody) return;
    const user = AppState.currentUser;
    const canEditFlag = user && (user.role === 'admin' || user.role === 'user');
    const isAdmin = user && user.role === 'admin';

    if (AppState.filteredDevices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">Устройства не найдены</td></tr>';
        return;
    }

    tbody.innerHTML = AppState.filteredDevices.map(d => `
        <tr class="clickable-row" ondblclick="showDeviceDetails(${d.id})">
            <td>${d.id}</td>
            <td><strong>${escapeHtml(d.product_serial_number)}</strong></td>
            <td><span class="status-badge ${d.device_type_code === 'RS' ? 'success' : 'warning'}">${escapeHtml(d.device_type_name)}</span></td>
            <td>${escapeHtml(d.type)}</td>
            <td>${escapeHtml(d.manufactures_date)}</td>
            <td>${escapeHtml(d.location_name || '—')}</td>
            <td>${d.diag ? '<span class="status-badge success">✓ Пройдена</span>' : '<span class="status-badge danger">✗ Нет</span>'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="showDeviceDetails(${d.id})" title="Подробнее">👁</button>
                    ${canEditFlag ? `<button class="action-btn edit" onclick="editDevice(${d.id})" title="Редактировать">✏️</button>` : ''}
                    ${isAdmin ? `<button class="action-btn delete" onclick="deleteDevice(${d.id})" title="Удалить">🗑</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function searchDevices() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('filterType')?.value || '';
    const locationFilter = document.getElementById('filterLocation')?.value || '';

    AppState.filteredDevices = AppState.devices.filter(d => {
        const matchQuery = !query ||
            (d.product_serial_number || '').toLowerCase().includes(query) ||
            (d.type || '').toLowerCase().includes(query) ||
            (d.device_type_name || '').toLowerCase().includes(query);
        const matchType = !typeFilter || d.device_type_code === typeFilter;
        const matchLocation = !locationFilter || String(d.actual_location_id) === locationFilter;
        return matchQuery && matchType && matchLocation;
    });
    renderDevicesTable();
}

function getDeviceImage(deviceType) {
    if (!deviceType) return '/images/default.png';
    const type = deviceType.toLowerCase();
    if (type.includes('isn41508t3-m-ac')) return '/images/ISBN41508T3-M-AC.png';
    if (type.includes('isn41508t3-m')) return '/images/ISBN41508T3-M.png';
    if (type.includes('isn41508t3')) return '/images/ISBN41508T3.png';
    if (type.includes('isn41508t4')) return '/images/ISBN41508T4.png';
    if (type.includes('isn50502t5')) return '/images/ISN50502T5.png';
    if (type.includes('isn42124t5c4')) return '/images/ISBN41508T3.png';
    if (type.includes('isn42124t5p5')) return '/images/ISBN41508T3-M.png';
    if (type.includes('isn42124x5')) return '/images/ISBN41508T4.png';
    return '/images/default.png';
}

function showDeviceDetails(id) {
    const device = AppState.devices.find(d => d.id === id);
    if (!device) return;

    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = `Устройство: ${device.product_serial_number}`;
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="text-align:center;margin-bottom:20px;">
                <img src="${getDeviceImage(device.type)}" alt="${device.type}" class="device-image"
                     onerror="this.src='/images/default.png'">
            </div>

            <div class="detail-section">
                <h3>Основная информация</h3>
                <div class="detail-row"><span class="label">Серийный номер</span><span class="value">${escapeHtml(device.product_serial_number)}</span></div>
                <div class="detail-row"><span class="label">Тип устройства</span><span class="value">${escapeHtml(device.device_type_name)}</span></div>
                <div class="detail-row"><span class="label">Модификация</span><span class="value">${escapeHtml(device.type)}</span></div>
                <div class="detail-row"><span class="label">Дата производства</span><span class="value">${escapeHtml(device.manufactures_date)}</span></div>
                <div class="detail-row"><span class="label">Место производства</span><span class="value">${escapeHtml(device.place_name || '—')}</span></div>
                <div class="detail-row"><span class="label">Месяц</span><span class="value">${escapeHtml(device.month_name || '—')}</span></div>
                <div class="detail-row"><span class="label">Год</span><span class="value">${escapeHtml(device.year_name || '—')}</span></div>
                <div class="detail-row"><span class="label">Этап</span><span class="value">${escapeHtml(device.stage_name || '—')}</span></div>
                <div class="detail-row"><span class="label">Местоположение</span><span class="value">${escapeHtml(device.location_name || '—')}</span></div>
                <div class="detail-row"><span class="label">ОС</span><span class="value">${escapeHtml(device.version_os || '—')}</span></div>
                <div class="detail-row"><span class="label">Диагностика</span><span class="value">${device.diag ? '✓ Пройдена' : '✗ Не пройдена'}</span></div>
            </div>

            <div class="detail-section">
                <h3>Прошивки</h3>
                <div class="detail-row"><span class="label">BMC</span><span class="value">${escapeHtml(device.version_bmc || '—')}</span></div>
                <div class="detail-row"><span class="label">U-Boot</span><span class="value">${escapeHtml(device.version_uboot || '—')}</span></div>
                <div class="detail-row"><span class="label">ISO</span><span class="value">${escapeHtml(device.version_iso || '—')}</span></div>
            </div>

            <div class="detail-section">
                <h3>Серийные номера компонентов</h3>
                <div class="detail-row"><span class="label">Плата</span><span class="value">${escapeHtml(device.serial_num_board || '—')}</span></div>
                <div class="detail-row"><span class="label">Печатная плата</span><span class="value">${escapeHtml(device.serial_num_pcb || '—')}</span></div>
                <div class="detail-row"><span class="label">Маршрутизатор</span><span class="value">${escapeHtml(device.serial_num_router || '—')}</span></div>
                <div class="detail-row"><span class="label">PKI модуль</span><span class="value">${escapeHtml(device.serial_num_pki || '—')}</span></div>
                <div class="detail-row"><span class="label">Блок питания</span><span class="value">${escapeHtml(device.serial_num_bp || '—')}</span></div>
                <div class="detail-row"><span class="label">Упаковка</span><span class="value">${escapeHtml(device.serial_num_package || '—')}</span></div>
                <div class="detail-row"><span class="label">Корпус</span><span class="value">${escapeHtml(device.serial_num_case || '—')}</span></div>
            </div>

            ${device.macs && device.macs.length > 0 ? `
            <div class="detail-section">
                <h3>MAC-адреса</h3>
                ${device.macs.map(m => `
                    <div class="detail-row">
                        <span class="label">${escapeHtml(m.interface_name)}</span>
                        <span class="value" style="font-family:monospace">${escapeHtml(m.mac_address)}</span>
                    </div>
                `).join('')}
            </div>` : ''}

            ${device.assemblers && device.assemblers.length > 0 ? `
            <div class="detail-section">
                <h3>Сборка</h3>
                ${device.assemblers.map(a => `
                    <div class="detail-row">
                        <span class="label">${escapeHtml(a.last_name)} ${escapeHtml(a.first_name)}</span>
                        <span class="value">${escapeHtml(a.assembly_date)}</span>
                    </div>
                `).join('')}
            </div>` : ''}

            ${device.electricians && device.electricians.length > 0 ? `
            <div class="detail-section">
                <h3>Диагностика</h3>
                ${device.electricians.map(e => `
                    <div class="detail-row">
                        <span class="label">${escapeHtml(e.last_name)} ${escapeHtml(e.first_name)} (${escapeHtml(e.diagnosis_date)})</span>
                        <span class="value">${escapeHtml(e.diagnosis_result)}</span>
                    </div>
                `).join('')}
            </div>` : ''}

            ${device.psi_tests && device.psi_tests.length > 0 ? `
            <div class="detail-section">
                <h3>ПСИ-испытания</h3>
                ${device.psi_tests.map(p => `
                    <div class="detail-row">
                        <span class="label">Протокол ${escapeHtml(p.protocol_number)} (${escapeHtml(p.test_date)})</span>
                        <span class="value">${escapeHtml(p.test_result)}</span>
                    </div>
                `).join('')}
            </div>` : ''}

            ${device.history && device.history.length > 0 ? `
            <div class="detail-section">
                <h3>История операций</h3>
                ${device.history.map(h => `
                    <div class="detail-row">
                        <span class="label">${escapeHtml(h.date_time)}</span>
                        <span class="value">${escapeHtml(h.message)}</span>
                    </div>
                `).join('')}
            </div>` : ''}

            ${device.errors && device.errors.length > 0 ? `
            <div class="detail-section">
                <h3>Ошибки</h3>
                ${device.errors.map(e => `
                    <div class="detail-row">
                        <span class="label">${escapeHtml(e.error_code)} (${escapeHtml(e.date)})</span>
                        <span class="value">${escapeHtml(e.debug_info)}</span>
                    </div>
                `).join('')}
            </div>` : ''}

            ${device.repairs && device.repairs.length > 0 ? `
            <div class="detail-section">
                <h3>Ремонты</h3>
                ${device.repairs.map(r => `
                    <div class="detail-row">
                        <span class="label">${escapeHtml(r.date_time)} → ${escapeHtml(r.date_time_repair)}</span>
                        <span class="value">${escapeHtml(r.message)}</span>
                    </div>
                `).join('')}
            </div>` : ''}
        `;
    }

    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'flex';
}

function addDevice() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = 'Добавить устройство';
    if (modalBody) modalBody.innerHTML = renderDeviceForm();
    
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'flex';
}

function editDevice(id) {
    const device = AppState.devices.find(d => d.id === id);
    if (!device) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = 'Редактировать устройство';
    if (modalBody) modalBody.innerHTML = renderDeviceForm(device);
    
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'flex';
}

function renderDeviceForm(device = null) {
    const isEdit = !!device;
    return `
        <form onsubmit="saveDevice(event, ${device ? device.id : 'null'})">
            <div class="form-grid">
                <div class="form-group">
                    <label>Тип устройства *</label>
                    <select name="device_type_id" required>
                        <option value="">Выберите тип</option>
                        ${AppState.deviceTypes.map(t =>
                            `<option value="${t.id}" ${device?.device_type_id == t.id ? 'selected' : ''}>${t.name} (${t.code})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Серийный номер *</label>
                    <input type="text" name="product_serial_number" value="${device?.product_serial_number || ''}" required>
                </div>
                <div class="form-group">
                    <label>Модификация (тип)</label>
                    <input type="text" name="type" value="${device?.type || ''}" placeholder="ISN4150873 +10n">
                </div>
                <div class="form-group">
                    <label>Порядковый номер в месяце</label>
                    <input type="text" name="monthly_sequence" value="${device?.monthly_sequence || ''}">
                </div>
                <div class="form-group">
                    <label>Место производства</label>
                    <select name="place_of_production_id">
                        <option value="">Не указано</option>
                        ${AppState.productionPlaces.map(p =>
                            `<option value="${p.id}" ${device?.place_of_production_id == p.id ? 'selected' : ''}>${p.name} (${p.code})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Месяц производства</label>
                    <select name="production_month_id">
                        <option value="">Не указан</option>
                        ${AppState.productionMonths.map(m =>
                            `<option value="${m.id}" ${device?.production_month_id == m.id ? 'selected' : ''}>${m.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Год производства</label>
                    <select name="production_year_id">
                        <option value="">Не указан</option>
                        ${AppState.productionYears.map(y =>
                            `<option value="${y.id}" ${device?.production_year_id == y.id ? 'selected' : ''}>${y.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Этап производства</label>
                    <select name="production_stage_id">
                        <option value="">Не указан</option>
                        ${AppState.productionStages.map(s =>
                            `<option value="${s.id}" ${device?.production_stage_id == s.id ? 'selected' : ''}>${s.name} (${s.description || ''})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Местоположение</label>
                    <select name="actual_location_id">
                        <option value="">Не указано</option>
                        ${AppState.locations.map(l =>
                            `<option value="${l.id}" ${device?.actual_location_id == l.id ? 'selected' : ''}>${l.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Дата производства</label>
                    <input type="date" name="manufactures_date" value="${device?.manufactures_date || ''}">
                </div>
                <div class="form-group">
                    <label>Версия ОС</label>
                    <input type="text" name="version_os" value="${device?.version_os || ''}">
                </div>
                <div class="form-group">
                    <label>BMC</label>
                    <select name="bmc_id">
                        <option value="">Не указано</option>
                        ${AppState.bmcList.map(b =>
                            `<option value="${b.id}" ${device?.bmc_id == b.id ? 'selected' : ''}>${b.version_bmc}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>U-Boot</label>
                    <select name="uboot_id">
                        <option value="">Не указано</option>
                        ${AppState.ubootList.map(u =>
                            `<option value="${u.id}" ${device?.uboot_id == u.id ? 'selected' : ''}>${u.version_uboot}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>ISO</label>
                    <select name="iso_id">
                        <option value="">Не указано</option>
                        ${AppState.isoList.map(i =>
                            `<option value="${i.id}" ${device?.iso_id == i.id ? 'selected' : ''}>${i.version_iso}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Диагностика пройдена</label>
                    <select name="diag">
                        <option value="false" ${!device?.diag ? 'selected' : ''}>Нет</option>
                        <option value="true" ${device?.diag ? 'selected' : ''}>Да</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModalForce()">Отмена</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
            </div>
        </form>
    `;
}

async function saveDevice(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => {
        data[key] = val === '' ? null : val;
    });
    data.diag = data.diag === 'true';

    try {
        if (id) {
            await apiRequest(`/api/devices/${id}`, { method: 'PUT', body: data });
            notify('Устройство обновлено', 'success');
        } else {
            await apiRequest('/api/devices', { method: 'POST', body: data });
            notify('Устройство создано', 'success');
        }
        closeModalForce();
        loadDevices();
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteDevice(id) {
    if (!confirm('Удалить устройство? Все связанные данные будут удалены.')) return;
    try {
        await apiRequest(`/api/devices/${id}`, { method: 'DELETE' });
        notify('Устройство удалено', 'success');
        loadDevices();
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ======== ТИПЫ УСТРОЙСТВ ========
function renderDeviceTypes() {
    const content = document.getElementById('contentArea');
    const isAdmin = AppState.currentUser && AppState.currentUser.role === 'admin';

    if (!content) return;

    content.innerHTML = `
        <div class="info-box">
            <h3>Типы изделий</h3>
            <p>Справочник типов выпускаемых устройств. Код типа используется в серийном номере.</p>
        </div>

        ${isAdmin ? `
        <div class="search-panel">
            <input type="text" id="newTypeName" placeholder="Название типа">
            <input type="text" id="newTypeCode" placeholder="Код (2 символа)" maxlength="10" style="max-width:150px;">
            <button class="btn btn-primary" onclick="addDeviceType()">+ Добавить тип</button>
        </div>` : ''}

        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Код</th>
                        <th>Название</th>
                        <th>Кол-во устройств</th>
                        ${isAdmin ? '<th>Действия</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${AppState.deviceTypes.map(t => {
                        const count = AppState.devices.filter(d => d.device_type_id === t.id).length;
                        return `<tr>
                            <td>${t.id}</td>
                            <td><strong>${escapeHtml(t.code)}</strong></td>
                            <td>${escapeHtml(t.name)}</td>
                            <td>${count}</td>
                            ${isAdmin ? `<td>
                                <button class="action-btn delete" onclick="deleteDeviceType(${t.id})" title="Удалить" ${count > 0 ? 'disabled style="opacity:0.3"' : ''}>🗑</button>
                             </td>` : ''}
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function addDeviceType() {
    const name = document.getElementById('newTypeName')?.value.trim();
    const code = document.getElementById('newTypeCode')?.value.trim();
    if (!name || !code) return notify('Заполните все поля', 'error');

    try {
        await apiRequest('/api/device-types', { method: 'POST', body: { name, code } });
        notify('Тип добавлен', 'success');
        await loadAllData();
        renderDeviceTypes();
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteDeviceType(id) {
    if (!confirm('Удалить тип устройства?')) return;
    try {
        await apiRequest(`/api/device-types/${id}`, { method: 'DELETE' });
        notify('Тип удалён', 'success');
        await loadAllData();
        renderDeviceTypes();
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ======== КОМПЛЕКТУЮЩИЕ ========
async function loadComponents() {
    const content = document.getElementById('contentArea');
    if (content) {
        content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка комплектующих...</p></div>';
    }

    try {
        const components = await apiRequest('/api/components');
        renderComponents(components);
    } catch (err) {
        if (content) {
            content.innerHTML = `<div class="empty-state"><h3>Ошибка</h3><p>${err.message}</p></div>`;
        }
    }
}

function renderComponents(components) {
    const content = document.getElementById('contentArea');
    const canEdit = AppState.currentUser && AppState.currentUser.role !== 'operator';
    const isAdmin = AppState.currentUser && AppState.currentUser.role === 'admin';

    if (!content) return;

    content.innerHTML = `
        <div class="info-box">
            <h3>Комплектующие</h3>
            <p>Серийные номера компонентов устройств: платы, блоки питания, корпуса и т.д.</p>
        </div>

        ${canEdit ? `
        <div class="search-panel">
            <select id="compDeviceId">
                <option value="">Выберите устройство</option>
                ${AppState.devices.map(d => `<option value="${d.id}">${d.product_serial_number}</option>`).join('')}
            </select>
            <select id="compType">
                <option value="">Тип компонента</option>
                <option value="serial_num_board">Плата</option>
                <option value="serial_num_pcb">Печатная плата</option>
                <option value="serial_num_router">Маршрутизатор</option>
                <option value="serial_num_pki">PKI модуль</option>
                <option value="serial_num_bp">Блок питания</option>
                <option value="serial_num_package">Упаковка</option>
                <option value="serial_num_case">Корпус</option>
            </select>
            <input type="text" id="compSerial" placeholder="Серийный номер">
            <button class="btn btn-primary" onclick="addComponent()">+ Добавить</button>
        </div>` : ''}

        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Тип</th>
                        <th>Серийный номер</th>
                        <th>Устройство</th>
                        ${isAdmin ? '<th>Действия</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${components.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:40px">Нет данных</td>' : ''}
                    ${components.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${escapeHtml(c.component_name)}</td>
                            <td><code>${escapeHtml(c.serial_number)}</code></td>
                            <td>${escapeHtml(c.device_serial || '—')}</td>
                            ${isAdmin ? `<td><button class="action-btn delete" onclick="deleteComponent('${c.component_type}', ${c.id})" title="Удалить">🗑</button></td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function addComponent() {
    const device_id = document.getElementById('compDeviceId')?.value;
    const component_type = document.getElementById('compType')?.value;
    const serial_number = document.getElementById('compSerial')?.value.trim();

    if (!device_id || !component_type || !serial_number) {
        return notify('Заполните все поля', 'error');
    }

    try {
        await apiRequest('/api/components', {
            method: 'POST',
            body: { device_id, component_type, serial_number }
        });
        notify('Компонент добавлен', 'success');
        loadComponents();
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteComponent(type, id) {
    if (!confirm('Удалить компонент?')) return;
    try {
        await apiRequest(`/api/components/${type}/${id}`, { method: 'DELETE' });
        notify('Компонент удалён', 'success');
        loadComponents();
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ======== МЕСТА ПРОИЗВОДСТВА ========
function renderProductionPlaces() {
    const content = document.getElementById('contentArea');
    const isAdmin = AppState.currentUser && AppState.currentUser.role === 'admin';

    if (!content) return;

    content.innerHTML = `
        <div class="info-box">
            <h3>Места производства</h3>
            <p>Справочник цехов и площадок производства. Код места используется в серийном номере устройства.</p>
        </div>

        ${isAdmin ? `
        <div class="search-panel">
            <input type="text" id="newPlaceCode" placeholder="Код (2 цифры)" maxlength="10" style="max-width:150px;">
            <input type="text" id="newPlaceName" placeholder="Название">
            <button class="btn btn-primary" onclick="addProductionPlace()">+ Добавить</button>
        </div>` : ''}

        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Код</th>
                        <th>Название</th>
                        <th>Кол-во устройств</th>
                        ${isAdmin ? '<th>Действия</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${AppState.productionPlaces.map(p => {
                        const count = AppState.devices.filter(d => d.place_of_production_id === p.id).length;
                        return `<tr>
                            <td>${p.id}</td>
                            <td><strong>${escapeHtml(p.code)}</strong></td>
                            <td>${escapeHtml(p.name)}</td>
                            <td>${count}</td>
                            ${isAdmin ? `<td>
                                <button class="action-btn delete" onclick="deleteProductionPlace(${p.id})" title="Удалить" ${count > 0 ? 'disabled style="opacity:0.3"' : ''}>🗑</button>
                             </td>` : ''}
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function addProductionPlace() {
    const code = document.getElementById('newPlaceCode')?.value.trim();
    const name = document.getElementById('newPlaceName')?.value.trim();
    if (!code || !name) return notify('Заполните все поля', 'error');
    try {
        await apiRequest('/api/production-places', { method: 'POST', body: { code, name } });
        notify('Место добавлено', 'success');
        await loadAllData();
        renderProductionPlaces();
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteProductionPlace(id) {
    if (!confirm('Удалить место производства?')) return;
    try {
        await apiRequest(`/api/production-places/${id}`, { method: 'DELETE' });
        notify('Место удалено', 'success');
        await loadAllData();
        renderProductionPlaces();
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ======== СТРУКТУРА СЕРИЙНОГО НОМЕРА ========
function renderSerialStructure() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    
    content.innerHTML = `
        <div class="info-box">
            <h3>Структура серийного номера устройства</h3>
            <p>Серийный номер формируется по определённой схеме, каждая часть несёт информацию о типе устройства, месте и времени производства.</p>
        </div>

        <div class="detail-section">
            <h3>Пример: RS101016430001</h3>
            <div class="serial-structure">
                <div class="serial-part">
                    <div class="part-value">RS</div>
                    <div class="part-desc">Тип<br>устройства</div>
                </div>
                <div class="serial-part">
                    <div class="part-value">1</div>
                    <div class="part-desc">Этап<br>производства</div>
                </div>
                <div class="serial-part">
                    <div class="part-value">01</div>
                    <div class="part-desc">Место<br>производства</div>
                </div>
                <div class="serial-part">
                    <div class="part-value">01</div>
                    <div class="part-desc">Год<br>производства</div>
                </div>
                <div class="serial-part">
                    <div class="part-value">643</div>
                    <div class="part-desc">Код<br>страны</div>
                </div>
                <div class="serial-part">
                    <div class="part-value">0001</div>
                    <div class="part-desc">Порядковый<br>номер</div>
                </div>
            </div>
        </div>

        <div class="cards-grid">
            <div class="card">
                <h3>Типы устройств</h3>
                ${AppState.deviceTypes.map(t => `<div class="detail-row"><span class="label">${t.code}</span><span class="value">${t.name}</span></div>`).join('')}
            </div>
            <div class="card">
                <h3>Этапы производства</h3>
                ${AppState.productionStages.map(s => `<div class="detail-row"><span class="label">Код ${s.code}</span><span class="value">${s.name} — ${s.description || ''}</span></div>`).join('')}
            </div>
            <div class="card">
                <h3>Места производства</h3>
                ${AppState.productionPlaces.slice(0, 8).map(p => `<div class="detail-row"><span class="label">${p.code}</span><span class="value">${p.name}</span></div>`).join('')}
            </div>
            <div class="card">
                <h3>Годы производства (код)</h3>
                ${AppState.productionYears.slice(0, 8).map(y => `<div class="detail-row"><span class="label">Код ${y.code}</span><span class="value">${y.name}</span></div>`).join('')}
            </div>
        </div>
    `;
}

// ======== СТАТИСТИКА ========
async function loadStatistics() {
    const content = document.getElementById('contentArea');
    if (content) {
        content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка статистики...</p></div>';
    }

    try {
        AppState.statistics = await apiRequest('/api/statistics');
        renderStatistics();
    } catch (err) {
        if (content) {
            content.innerHTML = `<div class="empty-state"><h3>Ошибка</h3><p>${err.message}</p></div>`;
        }
    }
}

function renderStatistics() {
    const stats = AppState.statistics;
    const content = document.getElementById('contentArea');
    if (!content || !stats) return;

    const maxByType = Math.max(...stats.byType.map(t => t.count), 1);
    const maxByLocation = Math.max(...stats.byLocation.map(l => l.count), 1);
    const maxByPlace = Math.max(...stats.byPlace.map(p => p.count), 1);

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📱</div>
                <div class="stat-label">Всего устройств</div>
                <div class="stat-value">${stats.totalDevices}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-label">Сотрудников</div>
                <div class="stat-value">${stats.totalEmployees}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⚠️</div>
                <div class="stat-label">Ошибок</div>
                <div class="stat-value">${stats.totalErrors}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔧</div>
                <div class="stat-label">Ремонтов</div>
                <div class="stat-value">${stats.totalRepairs}</div>
            </div>
        </div>

        <div class="chart-container">
            <h3>По типам устройств</h3>
            ${stats.byType.map(t => `
                <div class="chart-bar">
                    <span class="chart-bar-label">${t.name} (${t.code})</span>
                    <div class="chart-bar-fill" style="width: ${(t.count / maxByType) * 100}%">${t.count}</div>
                </div>
            `).join('')}
        </div>

        <div class="chart-container">
            <h3>По местоположению</h3>
            ${stats.byLocation.map(l => `
                <div class="chart-bar">
                    <span class="chart-bar-label">${l.name}</span>
                    <div class="chart-bar-fill" style="width: ${(l.count / maxByLocation) * 100}%">${l.count}</div>
                </div>
            `).join('')}
        </div>

        <div class="chart-container">
            <h3>По месту производства</h3>
            ${stats.byPlace.map(p => `
                <div class="chart-bar">
                    <span class="chart-bar-label">${p.name}</span>
                    <div class="chart-bar-fill" style="width: ${(p.count / maxByPlace) * 100}%">${p.count}</div>
                </div>
            `).join('')}
        </div>

        <div class="chart-container">
            <h3>Последние добавленные устройства</h3>
            <div class="table-wrapper" style="border:none;box-shadow:none;">
                <table class="data-table">
                    <thead>
                        <tr><th>Серийный номер</th><th>Тип</th><th>Модификация</th><th>Дата</th></tr>
                    </thead>
                    <tbody>
                        ${stats.recentDevices.map(d => `
                            <tr>
                                <td><strong>${escapeHtml(d.product_serial_number)}</strong></td>
                                <td>${escapeHtml(d.device_type_name)}</td>
                                <td>${escapeHtml(d.type)}</td>
                                <td>${escapeHtml(d.manufactures_date)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ======== ПРОФИЛЬ ========
function renderProfile() {
    const user = AppState.currentUser;
    const content = document.getElementById('contentArea');
    const roleNames = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };

    if (!content) return;

    content.innerHTML = `
        <div class="info-box" style="max-width:600px;">
            <h3>Профиль пользователя</h3>
            <div style="margin-top:16px;">
                <div class="detail-row"><span class="label">ФИО</span><span class="value">${escapeHtml(user.lastName)} ${escapeHtml(user.firstName)} ${escapeHtml(user.middleName || '')}</span></div>
                <div class="detail-row"><span class="label">Должность</span><span class="value">${escapeHtml(user.position)}</span></div>
                <div class="detail-row"><span class="label">Логин</span><span class="value">${escapeHtml(user.username)}</span></div>
                <div class="detail-row"><span class="label">Роль</span><span class="value"><span class="status-badge success">${roleNames[user.role] || user.role}</span></span></div>
            </div>
        </div>
    `;
}

// ======== СОТРУДНИКИ ========
async function loadEmployees() {
    if (!AppState.currentUser || AppState.currentUser.role !== 'admin') {
        const content = document.getElementById('contentArea');
        if (content) content.innerHTML = '<div class="empty-state"><h3>Доступ запрещен</h3></div>';
        return;
    }

    const content = document.getElementById('contentArea');
    if (content) {
        content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка...</p></div>';
    }

    try {
        AppState.employees = await apiRequest('/api/employees');
        renderEmployees();
    } catch (err) {
        if (content) {
            content.innerHTML = `<div class="empty-state"><h3>Ошибка</h3><p>${err.message}</p></div>`;
        }
    }
}

function renderEmployees() {
    const content = document.getElementById('contentArea');
    const roleNames = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };

    if (!content) return;

    content.innerHTML = `
        <div class="search-panel">
            <input type="text" placeholder="Поиск сотрудников..." oninput="filterEmployees(this.value)">
            <button class="btn btn-primary" onclick="addEmployee()">+ Добавить сотрудника</button>
        </div>

        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ФИО</th>
                        <th>Должность</th>
                        <th>Логин</th>
                        <th>Роль</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody id="employeesTableBody">
                    ${AppState.employees.map(e => `
                        <tr>
                            <td>${e.id}</td>
                            <td>${escapeHtml(e.last_name)} ${escapeHtml(e.first_name)} ${escapeHtml(e.middle_name || '')}</td>
                            <td>${escapeHtml(e.position)}</td>
                            <td><code>${escapeHtml(e.username)}</code></td>
                            <td><span class="status-badge ${e.role === 'admin' ? 'danger' : e.role === 'operator' ? 'warning' : 'success'}">${roleNames[e.role] || e.role}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn edit" onclick="editEmployee(${e.id})" title="Редактировать">✏️</button>
                                    <button class="action-btn delete" onclick="deleteEmployee(${e.id})" title="Удалить">🗑</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function filterEmployees(query) {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;
    const q = query.toLowerCase();
    const roleNames = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };

    const filtered = AppState.employees.filter(e =>
        `${e.last_name} ${e.first_name} ${e.middle_name || ''} ${e.position} ${e.username}`.toLowerCase().includes(q)
    );

    tbody.innerHTML = filtered.map(e => `
        <tr>
            <td>${e.id}</td>
            <td>${escapeHtml(e.last_name)} ${escapeHtml(e.first_name)} ${escapeHtml(e.middle_name || '')}</td>
            <td>${escapeHtml(e.position)}</td>
            <td><code>${escapeHtml(e.username)}</code></td>
            <td><span class="status-badge ${e.role === 'admin' ? 'danger' : e.role === 'operator' ? 'warning' : 'success'}">${roleNames[e.role] || e.role}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editEmployee(${e.id})" title="Редактировать">✏️</button>
                    <button class="action-btn delete" onclick="deleteEmployee(${e.id})" title="Удалить">🗑</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function addEmployee() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = 'Добавить сотрудника';
    if (modalBody) modalBody.innerHTML = renderEmployeeForm();
    
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'flex';
}

function editEmployee(id) {
    const emp = AppState.employees.find(e => e.id === id);
    if (!emp) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = 'Редактировать сотрудника';
    if (modalBody) modalBody.innerHTML = renderEmployeeForm(emp);
    
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'flex';
}

function renderEmployeeForm(emp = null) {
    return `
        <form onsubmit="saveEmployee(event, ${emp ? emp.id : 'null'})">
            <div class="form-grid">
                <div class="form-group">
                    <label>Фамилия *</label>
                    <input type="text" name="last_name" value="${emp?.last_name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Имя *</label>
                    <input type="text" name="first_name" value="${emp?.first_name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Отчество</label>
                    <input type="text" name="middle_name" value="${emp?.middle_name || ''}">
                </div>
                <div class="form-group">
                    <label>Должность *</label>
                    <input type="text" name="position" value="${emp?.position || ''}" required>
                </div>
                <div class="form-group">
                    <label>Логин *</label>
                    <input type="text" name="username" value="${emp?.username || ''}" required>
                </div>
                <div class="form-group">
                    <label>${emp ? 'Новый пароль (оставьте пустым)' : 'Пароль *'}</label>
                    <input type="password" name="password" ${emp ? '' : 'required'}>
                </div>
                <div class="form-group">
                    <label>Роль</label>
                    <select name="role">
                        <option value="user" ${emp?.role === 'user' ? 'selected' : ''}>Пользователь</option>
                        <option value="operator" ${emp?.role === 'operator' ? 'selected' : ''}>Оператор</option>
                        <option value="admin" ${emp?.role === 'admin' ? 'selected' : ''}>Администратор</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="closeModalForce()">Отмена</button>
                <button type="submit" class="btn btn-primary">${emp ? 'Сохранить' : 'Добавить'}</button>
            </div>
        </form>
    `;
}

async function saveEmployee(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((val, key) => { data[key] = val; });

    try {
        if (id) {
            if (!data.password) delete data.password;
            await apiRequest(`/api/employees/${id}`, { method: 'PUT', body: data });
            notify('Сотрудник обновлён', 'success');
        } else {
            await apiRequest('/api/employees', { method: 'POST', body: data });
            notify('Сотрудник добавлен', 'success');
        }
        closeModalForce();
        loadEmployees();
    } catch (err) {
        notify(err.message, 'error');
    }
}

async function deleteEmployee(id) {
    if (!confirm('Удалить сотрудника?')) return;
    try {
        await apiRequest(`/api/employees/${id}`, { method: 'DELETE' });
        notify('Сотрудник удалён', 'success');
        loadEmployees();
    } catch (err) {
        notify(err.message, 'error');
    }
}

// ======== О ПРОГРАММЕ ========
function renderAbout() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    
    content.innerHTML = `
        <div class="info-box" style="max-width:800px;">
            <h3>О программе</h3>
            <p><strong>Система управления производством</strong></p>
            <p>АО «НПП «Исток» им. Шокина, г. Фрязино</p>
            <br>
            <p>Система предназначена для учета устройств, комплектующих, сотрудников и отслеживания производственных этапов выпуска сервисных маршрутизаторов и коммутаторов доступа.</p>
            <br>
            <p><strong>Версия:</strong> 1.0.0</p>
            <p><strong>Технологии:</strong> Node.js, Express, MySQL, HTML5/CSS3/JavaScript</p>
            <p><strong>Год:</strong> 2024</p>
        </div>
    `;
}

// ======== НАСТРОЙКИ ========
function renderSettings() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    
    content.innerHTML = `
        <div class="info-box" style="max-width:600px;">
            <h3>Настройки</h3>
            <div style="margin-top:20px;">
                <div class="form-group">
                    <label>Тема оформления</label>
                    <select onchange="AppState.currentTheme = this.value; localStorage.setItem('theme', this.value); applyTheme();" style="padding:10px;border:1px solid var(--border-medium);border-radius:8px;background:var(--bg-main);color:var(--text-primary);">
                        <option value="light" ${AppState.currentTheme === 'light' ? 'selected' : ''}>Светлая</option>
                        <option value="dark" ${AppState.currentTheme === 'dark' ? 'selected' : ''}>Тёмная</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

// ======== МОДАЛЬНОЕ ОКНО ========
function closeModal(event) {
    const modalOverlay = document.getElementById('modalOverlay');
    if (event && event.target === modalOverlay) {
        if (modalOverlay) modalOverlay.style.display = 'none';
    }
}

function closeModalForce() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
}

// ======== ВЫХОД ========
async function logout(event) {
    if (event) event.preventDefault();
    try {
        await apiRequest('/api/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Экспорт глобальных функций для HTML
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.showContent = showContent;
window.showTopContent = showTopContent;
window.searchDevices = searchDevices;
window.showDeviceDetails = showDeviceDetails;
window.addDevice = addDevice;
window.editDevice = editDevice;
window.saveDevice = saveDevice;
window.deleteDevice = deleteDevice;
window.addDeviceType = addDeviceType;
window.deleteDeviceType = deleteDeviceType;
window.addComponent = addComponent;
window.deleteComponent = deleteComponent;
window.addProductionPlace = addProductionPlace;
window.deleteProductionPlace = deleteProductionPlace;
window.loadStatistics = loadStatistics;
window.filterEmployees = filterEmployees;
window.addEmployee = addEmployee;
window.editEmployee = editEmployee;
window.saveEmployee = saveEmployee;
window.deleteEmployee = deleteEmployee;
window.closeModal = closeModal;
window.closeModalForce = closeModalForce;
window.logout = logout;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;