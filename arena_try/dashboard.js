// ============ STATE ============
const S = {
    user: null,
    token: null,
    devices: [],
    filteredDevices: [],
    boards: [],
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
    boardTypes: [],
    statistics: null,
    section: 'devices',
    repairDevices: [],
    repairBoards: [],
    availableBoardsForVisual: [],
    availableBoardsForDiag: [],
    availableDevicesForPSI: []
};

// ============ Error Dialog ============
function showError(message, title = 'Ошибка') {
    const dialog = document.getElementById('errorDialog');
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    dialog.classList.add('active');
}

function closeErrorDialog() {
    document.getElementById('errorDialog').classList.remove('active');
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    S.token = new URLSearchParams(location.search).get('token') || localStorage.getItem('token');
    if (!S.token) {
        location.href = '/';
        return;
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    loadUser();
});

// ============ API - with proper error handling ============
async function api(url, opt = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + S.token
    };

    if (opt.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(url, {
            ...opt,
            headers: { ...headers, ...opt.headers }
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response from', url, ':', text.substring(0, 200));
            throw new Error('Сервер вернул не JSON. URL: ' + url);
        }

        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            location.href = '/';
            return null;
        }

        if (!response.ok) {
            throw new Error(data.error || 'Ошибка сервера');
        }

        return data;
    } catch (e) {
        console.error('API Error:', url, e);
        showError(e.message);
        throw e;
    }
}

// ============ USER ============
async function loadUser() {
    try {
        S.user = await api('/api/current-user');
        if (!S.user) return;

        const initials = (S.user.first_name?.[0] || '') + (S.user.last_name?.[0] || '');
        document.getElementById('userAvatar').textContent = initials.toUpperCase();
        document.getElementById('sidebarUserName').textContent = S.user.last_name + ' ' + (S.user.first_name?.[0] || '') + '.';

        const roleMap = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };
        document.getElementById('sidebarUserRole').textContent = roleMap[S.user.role] || S.user.role;

        if (S.user.role === 'admin') {
            document.getElementById('employeesBtn').style.display = '';
        }

        showContent('devices');
    } catch (e) {
        console.error('loadUser failed:', e);
        document.getElementById('contentArea').innerHTML =
            '<div class="empty-state"><p>Ошибка загрузки пользователя: ' + e.message + '</p></div>';
    }
}

function logout() {
    api('/api/logout', { method: 'POST' }).catch(() => { });
    localStorage.removeItem('token');
    location.href = '/';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ============ TOAST ============
function toast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span class="toast-icon">' + (icons[type] || 'ℹ') + '</span><span>' + msg + '</span>';
    c.appendChild(t);
    setTimeout(() => {
        t.classList.add('toast-out');
        setTimeout(() => t.remove(), 300);
    }, 4000);
}

// ============ MODAL ============
function openModal(title, html) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('modalOverlay').classList.remove('active');
}

// ============ NAVIGATION ============
function showContent(section) {
    S.section = section;

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector('[data-section="' + section + '"]');
    if (navItem) navItem.classList.add('active');

    document.getElementById('sidebar').classList.remove('open');

    const titles = {
        'devices': 'Устройства',
        'boards': 'Платы',
        'stand-visual': 'Стенд визуального осмотра',
        'stand-diag': 'Стенд диагностики',
        'stand-assembly': 'Стенд сборки',
        'stand-psi': 'Стенд ПСИ',
        'stand-packaging': 'Стенд упаковки',
        'repair': 'Ремонт',
        'types': 'Типы изделий',
        'places': 'Места производства',
        'serial-structure': 'Структура серийного номера',
        'statistics': 'Статистика',
        'profile': 'Профиль',
        'employees': 'Сотрудники'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;

    switch (section) {
        case 'devices': loadDevices(); break;
        case 'boards': loadBoards(); break;
        case 'types': loadDeviceTypes(); break;
        case 'places': loadProductionPlaces(); break;
        case 'serial-structure': renderSerialStructure(); break;
        case 'statistics': loadStatistics(); break;
        case 'profile': renderProfile(); break;
        case 'employees': loadEmployees(); break;
        case 'stand-visual': renderStandVisual(); break;
        case 'stand-diag': renderStandDiag(); break;
        case 'stand-assembly': renderStandAssembly(); break;
        case 'stand-psi': renderStandPSI(); break;
        case 'stand-packaging': renderStandPackaging(); break;
        case 'repair': loadRepairItems(); break;
        default:
            document.getElementById('contentArea').innerHTML =
                '<div class="empty-state"><p>Раздел в разработке</p></div>';
    }
}

// ============ HELPERS ============
function getDeviceImage(type) {
    if (!type) return '/images/ISN41508T3.png';
    var t = type.toLowerCase();
    if (t.indexOf('isn41508t3-m-ac') !== -1) return '/images/ISN41508T3-M-AC.png';
    if (t.indexOf('isn41508t3-m') !== -1) return '/images/ISN41508T3-M.png';
    if (t.indexOf('isn41508t4') !== -1) return '/images/ISN41508T4.png';
    if (t.indexOf('isn41508t3') !== -1) return '/images/ISN41508T3.png';
    return '/images/ISN41508T3.png';
}

function stageLabel(s) {
    var m = {
        'new': 'Новое',
        'visual_ok': 'Осмотр пройден',
        'visual_fail': 'Осмотр не пройден',
        'diagnostics_ok': 'Диагностика пройдена',
        'diagnostics_fail': 'Диагностика не пройдена',
        'assembled': 'Собрано',
        'psi_ok': 'ПСИ пройден',
        'psi_fail': 'ПСИ не пройден',
        'packaged': 'Упаковано',
        'repair': 'В ремонте'
    };
    return m[s] || s || '—';
}

function stageBadge(s) {
    var m = {
        'new': 'badge-neutral',
        'visual_ok': 'badge-info',
        'visual_fail': 'badge-error',
        'diagnostics_ok': 'badge-warning',
        'diagnostics_fail': 'badge-error',
        'assembled': 'badge-info',
        'psi_ok': 'badge-success',
        'psi_fail': 'badge-error',
        'packaged': 'badge-success',
        'repair': 'badge-error'
    };
    return m[s] || 'badge-neutral';
}

function renderPipeline(currentStage, isBoard) {
    var stages;
    if (isBoard) {
        stages = [
            { k: 'new', l: 'Новая' },
            { k: 'visual_ok', l: 'Осмотр' },
            { k: 'diagnostics_ok', l: 'Диагностика' },
            { k: 'assembled', l: 'В составе' }
        ];
    } else {
        stages = [
            { k: 'assembled', l: 'Собрано' },
            { k: 'psi_ok', l: 'ПСИ' },
            { k: 'packaged', l: 'Упаковано' }
        ];
    }

    var passed = true;
    var html = '<div class="pipeline">';
    for (var i = 0; i < stages.length; i++) {
        var s = stages[i];
        var cls = 'pending';
        if (s.k === currentStage) {
            cls = 'current';
            passed = false;
        } else if (passed) {
            cls = 'done';
        }
        if (i > 0) html += '<span class="pipeline-arrow">→</span>';
        var prefix = (cls === 'done') ? '✓ ' : '';
        html += '<span class="pipeline-step ' + cls + '">' + prefix + s.l + '</span>';
    }
    html += '</div>';
    return html;
}

// ============ DEVICES ============
async function loadDevices() {
    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка устройств...</p></div>';

    try {
        var results = await Promise.all([
            api('/api/devices'),
            api('/api/device-types')
        ]);

        S.devices = results[0] || [];
        S.deviceTypes = results[1] || [];
        S.filteredDevices = S.devices.slice();
        renderDevicesPage();
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка загрузки устройств: ' + e.message + '</p><button class="btn btn-primary" onclick="loadDevices()" style="margin-top:16px">Повторить</button></div>';
    }
}

function renderDevicesPage() {
    var content = document.getElementById('contentArea');
    var canEditFlag = S.user && S.user.role !== 'operator';

    var typeOptions = '';
    for (var i = 0; i < S.deviceTypes.length; i++) {
        var t = S.deviceTypes[i];
        typeOptions += '<option value="' + t.code + '">' + t.name + ' (' + t.code + ')</option>';
    }

    var rsCount = 0, saCount = 0, packagedCount = 0;
    for (var i = 0; i < S.devices.length; i++) {
        if (S.devices[i].device_type_code === 'RS') rsCount++;
        if (S.devices[i].device_type_code === 'SA') saCount++;
        if (S.devices[i].current_stage === 'packaged') packagedCount++;
    }

    var html = '';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-icon blue"></div><div class="stat-info"><span class="stat-value">' + S.devices.length + '</span><span class="stat-label">Всего</span></div></div>';
    html += '<div class="stat-card"><div class="stat-icon green"></div><div class="stat-info"><span class="stat-value">' + rsCount + '</span><span class="stat-label">Маршрутизаторов</span></div></div>';
    html += '<div class="stat-card"><div class="stat-icon purple"></div><div class="stat-info"><span class="stat-value">' + saCount + '</span><span class="stat-label">Коммутаторов</span></div></div>';
    html += '<div class="stat-card"><div class="stat-icon orange"></div><div class="stat-info"><span class="stat-value">' + packagedCount + '</span><span class="stat-label">Упаковано</span></div></div>';
    html += '</div>';

    html += '<div class="action-panel">';
    html += '<div class="search-input-wrap">';
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    html += '<input type="text" class="search-input" placeholder="Поиск..." oninput="filterDevices()" id="searchInput">';
    html += '</div>';
    html += '<select class="filter-select" onchange="filterDevices()" id="typeFilter"><option value="">Все типы</option>' + typeOptions + '</select>';
    if (canEditFlag) {
        html += '<button class="btn btn-primary" onclick="showAddDevice()">+ Добавить</button>';
    }
    html += '</div>';

    html += '<div class="device-card-grid" id="deviceCards"></div>';

    content.innerHTML = html;
    renderDeviceCards();
}

function renderDeviceCards() {
    var el = document.getElementById('deviceCards');
    if (!el) return;

    var devs = S.filteredDevices;
    if (!devs.length) {
        el.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>Устройства не найдены</p></div>';
        return;
    }

    var isAdmin = S.user && S.user.role === 'admin';
    var canEditFlag = S.user && S.user.role !== 'operator';
    var html = '';

    for (var i = 0; i < devs.length; i++) {
        var d = devs[i];
        var img = d.image_path || getDeviceImage(d.type);
        var typeBadge = d.device_type_code === 'RS' ? 'badge-info' : 'badge-success';

        html += '<div class="device-card" onclick="showDeviceDetails(' + d.id + ')">';
        html += '<img class="device-card-img" src="' + img + '" alt="' + (d.type || '') + '" onerror="this.src=\'/images/ISN41508T3.png\'">';
        html += '<div class="device-card-body">';
        html += '<div class="device-card-title">' + (d.product_serial_number || '—') + '</div>';
        html += '<div class="device-card-sub">' + (d.type || '—') + '</div>';
        html += '<div class="device-card-meta">';
        html += '<span class="badge ' + typeBadge + '">' + (d.device_type_code || '—') + '</span>';
        html += '<span class="badge ' + stageBadge(d.current_stage) + '">' + stageLabel(d.current_stage) + '</span>';
        html += '</div>';
        html += renderPipeline(d.current_stage, false);
        html += '<div class="device-card-footer">';
        html += '<span style="font-size:12px;color:var(--text-muted)">' + (d.manufactures_date || '—') + '</span>';
        html += '<div class="cell-actions" onclick="event.stopPropagation()">';
        if (canEditFlag) {
            html += '<button class="btn-icon" onclick="editDevice(' + d.id + ')" title="Редактировать"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>';
        }
        if (isAdmin) {
            html += '<button class="btn-icon danger" onclick="deleteDevice(' + d.id + ')" title="Удалить"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>';
        }
        html += '</div></div></div></div>';
    }

    el.innerHTML = html;
}

function filterDevices() {
    var search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    var typeFilter = document.getElementById('typeFilter')?.value || '';

    S.filteredDevices = S.devices.filter(function (d) {
        var matchSearch = !search ||
            (d.product_serial_number || '').toLowerCase().indexOf(search) !== -1 ||
            (d.type || '').toLowerCase().indexOf(search) !== -1 ||
            (d.location_name || '').toLowerCase().indexOf(search) !== -1;
        var matchType = !typeFilter || d.device_type_code === typeFilter;
        return matchSearch && matchType;
    });

    renderDeviceCards();
}

// ============ DEVICE DETAILS ============
async function showDeviceDetails(id) {
    try {
        var d = await api('/api/devices/' + id);
        if (!d) return;

        var img = d.image_path || getDeviceImage(d.type);

        var boardsHtml = '';
        if (d.boards && d.boards.length) {
            for (var i = 0; i < d.boards.length; i++) {
                var b = d.boards[i];
                boardsHtml += '<div class="detail-row"><span class="detail-label">' + (b.board_type_name || '') + ' (' + b.serial_number + ')</span><span class="detail-value"><span class="badge ' + stageBadge(b.current_stage) + '">' + stageLabel(b.current_stage) + '</span></span></div>';
            }
        } else {
            boardsHtml = '<p style="color:var(--text-muted)">Нет привязанных плат</p>';
        }

        var macHtml = '';
        if (d.macs && d.macs.length) {
            for (var i = 0; i < d.macs.length; i++) {
                var m = d.macs[i];
                macHtml += '<div class="detail-row"><span class="detail-label">' + m.interface_name + '</span><span class="detail-value">' + m.mac_address + '</span></div>';
            }
        } else {
            macHtml = '<p style="color:var(--text-muted)">Нет</p>';
        }

        var historyHtml = '';
        if (d.history && d.history.length) {
            for (var i = 0; i < d.history.length; i++) {
                var h = d.history[i];
                historyHtml += '<div class="recent-item"><div class="recent-item-icon"></div><div class="recent-item-info"><div class="recent-item-title">' + (h.message || '—') + '</div><div class="recent-item-sub">' + (h.date_time || '') + (h.emp_name ? ' — ' + h.emp_name : '') + '</div></div></div>';
            }
        } else {
            historyHtml = '<p style="color:var(--text-muted)">Нет записей</p>';
        }

        var html = '';
        html += '<div style="text-align:center;margin-bottom:20px">';
        html += '<img src="' + img + '" alt="' + (d.type || '') + '" style="max-height:200px;object-fit:contain;border-radius:var(--radius-md)" onerror="this.src=\'/images/ISN41508T3.png\'">';
        html += '</div>';
        html += renderPipeline(d.current_stage, false);

        html += '<div class="detail-grid">';

        html += '<div class="detail-group"><div class="detail-group-title">Основная информация</div>';
        html += '<div class="detail-row"><span class="detail-label">Серийный номер</span><span class="detail-value">' + (d.product_serial_number || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Тип</span><span class="detail-value">' + (d.device_type_name || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Модификация</span><span class="detail-value">' + (d.type || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Дата</span><span class="detail-value">' + (d.manufactures_date || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">ОС</span><span class="detail-value">' + (d.version_os || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Стадия</span><span class="detail-value"><span class="badge ' + stageBadge(d.current_stage) + '">' + stageLabel(d.current_stage) + '</span></span></div>';
        html += '</div>';

        html += '<div class="detail-group"><div class="detail-group-title">Стенды</div>';
        html += '<div class="detail-row"><span class="detail-label">Сборка</span><span class="detail-value">' + (d.assembly_passed ? 'Пройдена ' + (d.assembly_employee_full || '') : 'Не пройдена') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">ПСИ</span><span class="detail-value">' + (d.psi_passed ? 'Пройден ' + (d.psi_protocol_number || '') : 'Не пройден') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Упаковка</span><span class="detail-value">' + (d.packaging_passed ? 'Пройдена' : 'Не пройдена') + '</span></div>';
        html += '</div>';

        html += '<div class="detail-group"><div class="detail-group-title">Платы</div>' + boardsHtml + '</div>';
        html += '<div class="detail-group"><div class="detail-group-title">MAC-адреса</div>' + macHtml + '</div>';
        html += '</div>';

        html += '<div class="section-card" style="margin-top:20px"><h3>История</h3><div class="recent-list">' + historyHtml + '</div></div>';

        openModal('Устройство: ' + (d.product_serial_number || ''), html);
    } catch (e) {
        showError(e.message);
    }
}

// ============ ADD/EDIT DEVICE ============
async function loadFormData() {
    var promises = [];
    if (!S.productionPlaces.length) promises.push(api('/api/production-places').then(function (r) { S.productionPlaces = r || []; }));
    if (!S.productionMonths.length) promises.push(api('/api/production-months').then(function (r) { S.productionMonths = r || []; }));
    if (!S.productionYears.length) promises.push(api('/api/production-years').then(function (r) { S.productionYears = r || []; }));
    if (!S.productionStages.length) promises.push(api('/api/production-stages').then(function (r) { S.productionStages = r || []; }));
    if (!S.locations.length) promises.push(api('/api/locations').then(function (r) { S.locations = r || []; }));
    if (!S.deviceTypes.length) promises.push(api('/api/device-types').then(function (r) { S.deviceTypes = r || []; }));
    if (!S.boardTypes.length) promises.push(api('/api/board-types').then(function (r) { S.boardTypes = r || []; }));
    await Promise.all(promises);
}

function makeSelectOptions(arr, codeField, labelField, selectedId) {
    var html = '';
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        var sel = item.id == selectedId ? ' selected' : '';
        var extra = item[codeField] ? ' (' + item[codeField] + ')' : '';
        html += '<option value="' + item.id + '"' + sel + '>' + item[labelField] + extra + '</option>';
    }
    return html;
}

async function showAddDevice(data) {
    await loadFormData();
    var d = data || {};
    var title = d.id ? 'Редактировать' : 'Новое устройство';

    var html = '<form onsubmit="saveDevice(event,' + (d.id || 'null') + ')">';
    html += '<div class="form-grid">';
    html += '<div class="form-group"><label class="form-label">Тип *</label><select class="form-select" name="device_type_id" required><option value="">Выберите</option>' + makeSelectOptions(S.deviceTypes, 'code', 'name', d.device_type_id) + '</select></div>';
    html += '<div class="form-group"><label class="form-label">Серийный номер *</label><input class="form-input" name="product_serial_number" value="' + (d.product_serial_number || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Модификация</label><input class="form-input" name="type" value="' + (d.type || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Дата производства</label><input class="form-input" type="date" name="manufactures_date" value="' + (d.manufactures_date || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Место</label><select class="form-select" name="place_of_production_id"><option value="">—</option>' + makeSelectOptions(S.productionPlaces, 'code', 'name', d.place_of_production_id) + '</select></div>';
    html += '<div class="form-group"><label class="form-label">Расположение</label><select class="form-select" name="actual_location_id"><option value="">—</option>' + makeSelectOptions(S.locations, '', 'name', d.actual_location_id) + '</select></div>';
    html += '<div class="form-group"><label class="form-label">Версия ОС</label><input class="form-input" name="version_os" value="' + (d.version_os || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Изображение</label><input class="form-input" name="image_path" value="' + (d.image_path || '') + '" placeholder="/images/ISN41508T3.png"></div>';
    html += '</div>';
    html += '<div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button><button type="submit" class="btn btn-primary">' + (d.id ? 'Сохранить' : 'Создать') + '</button></div>';
    html += '</form>';

    openModal(title, html);
}

async function saveDevice(event, deviceId) {
    event.preventDefault();
    var formData = new FormData(event.target);
    var data = {};
    formData.forEach(function (value, key) { data[key] = value; });
    data.diag = false;

    var nullFields = ['place_of_production_id', 'production_month_id', 'production_year_id', 'production_stage_id', 'actual_location_id', 'bmc_id', 'uboot_id', 'iso_id'];
    for (var i = 0; i < nullFields.length; i++) {
        if (!data[nullFields[i]]) data[nullFields[i]] = null;
    }

    try {
        if (deviceId) {
            await api('/api/devices/' + deviceId, { method: 'PUT', body: JSON.stringify(data) });
            toast('Обновлено', 'success');
        } else {
            await api('/api/devices', { method: 'POST', body: JSON.stringify(data) });
            toast('Создано', 'success');
        }
        closeModal();
        loadDevices();
    } catch (e) {
        showError(e.message);
    }
}

async function editDevice(id) {
    var d = null;
    for (var i = 0; i < S.devices.length; i++) {
        if (S.devices[i].id === id) { d = S.devices[i]; break; }
    }
    if (d) showAddDevice(d);
}

async function deleteDevice(id) {
    if (!confirm('Удалить устройство?')) return;
    try {
        await api('/api/devices/' + id, { method: 'DELETE' });
        toast('Удалено', 'success');
        loadDevices();
    } catch (e) {
        showError(e.message);
    }
}

// ============ REPAIR ============
async function loadRepairItems() {
    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка...</p></div>';

    try {
        var devices = await api('/api/devices');
        var boards = await api('/api/boards');
        
        S.repairDevices = (devices || []).filter(function(d) {
            var failedStages = ['visual_fail', 'diagnostics_fail', 'psi_fail'];
            return failedStages.includes(d.current_stage);
        });
        
        S.repairBoards = (boards || []).filter(function(b) {
            var failedStages = ['visual_fail', 'diagnostics_fail'];
            return failedStages.includes(b.current_stage);
        });

        if (S.repairDevices.length === 0 && S.repairBoards.length === 0) {
            content.innerHTML = '<div class="empty-state"><p>Нет устройств или плат в ремонте</p></div>';
            return;
        }

        var html = '<div class="repair-list">';
        
        if (S.repairBoards.length > 0) {
            html += '<h3 style="margin-bottom:16px;color:var(--primary)">Платы в ремонте</h3>';
            for (var i = 0; i < S.repairBoards.length; i++) {
                var b = S.repairBoards[i];
                html += '<div class="repair-item" data-board-id="' + b.id + '">';
                html += '<div class="repair-header">';
                html += '<span class="repair-sn">' + (b.serial_number || '—') + '</span>';
                html += '<span class="repair-stage failed">' + stageLabel(b.current_stage) + '</span>';
                html += '</div>';
                html += '<div class="repair-details">Тип платы: ' + (b.board_type_name || '—') + '</div>';
                var reason = '';
                if (b.current_stage === 'visual_fail') reason = 'Не пройден визуальный осмотр';
                else if (b.current_stage === 'diagnostics_fail') reason = 'Не пройдена диагностика';
                html += '<div class="repair-error">Причина: ' + reason + '</div>';
                html += '<div class="repair-actions">';
                html += '<button class="repair-btn repair-btn-resume" onclick="resumeRepairBoard(' + b.id + ', \'' + b.current_stage + '\')">Возобновить проверку</button>';
                if (S.user && S.user.role === 'admin') {
                    html += '<button class="repair-btn repair-btn-delete" onclick="deleteRepairBoard(' + b.id + ')">Удалить</button>';
                }
                html += '</div></div>';
            }
        }
        
        if (S.repairDevices.length > 0) {
            html += '<h3 style="margin:24px 0 16px;color:var(--primary)">Устройства в ремонте</h3>';
            for (var i = 0; i < S.repairDevices.length; i++) {
                var d = S.repairDevices[i];
                html += '<div class="repair-item" data-device-id="' + d.id + '">';
                html += '<div class="repair-header">';
                html += '<span class="repair-sn">' + (d.product_serial_number || '—') + '</span>';
                html += '<span class="repair-stage failed">' + stageLabel(d.current_stage) + '</span>';
                html += '</div>';
                html += '<div class="repair-details">Тип: ' + (d.device_type_name || '—') + '</div>';
                var reason = '';
                if (d.current_stage === 'psi_fail') reason = 'Не пройден ПСИ';
                html += '<div class="repair-error">Причина: ' + reason + '</div>';
                html += '<div class="repair-actions">';
                html += '<button class="repair-btn repair-btn-resume" onclick="resumeRepairDevice(' + d.id + ')">Возобновить проверку</button>';
                if (S.user && S.user.role === 'admin') {
                    html += '<button class="repair-btn repair-btn-delete" onclick="deleteRepairDevice(' + d.id + ')">Удалить</button>';
                }
                html += '</div></div>';
            }
        }
        
        html += '</div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка загрузки: ' + e.message + '</p></div>';
    }
}

async function resumeRepairBoard(boardId, currentStage) {
    try {
        var targetStand = null;
        if (currentStage === 'visual_fail') targetStand = 'stand-visual';
        else if (currentStage === 'diagnostics_fail') targetStand = 'stand-diag';
        else {
            showError('Эта плата не требует ремонта');
            return;
        }

        toast('Переход к стенду', 'info');
        showContent(targetStand);

        setTimeout(function() {
            var formInput = document.querySelector('.stand-form input[name="serial_number"]');
            if (formInput) {
                var board = S.repairBoards.find(function(b) { return b.id === boardId; });
                if (board) formInput.value = board.serial_number;
            }
        }, 100);
    } catch (e) {
        showError(e.message);
    }
}

async function resumeRepairDevice(deviceId) {
    try {
        var device = await api('/api/devices/' + deviceId);
        if (!device) return;

        if (device.current_stage !== 'psi_fail') {
            showError('Это устройство не требует ремонта');
            return;
        }

        toast('Переход к стенду ПСИ', 'info');
        showContent('stand-psi');

        setTimeout(function() {
            var psiInput = document.querySelector('.stand-form input[name="device_serial_number"]');
            if (psiInput) psiInput.value = device.product_serial_number;
        }, 100);
    } catch (e) {
        showError(e.message);
    }
}

async function deleteRepairBoard(id) {
    if (!confirm('Удалить плату из ремонта?')) return;
    try {
        await api('/api/boards/' + id, { method: 'DELETE' });
        toast('Удалено', 'success');
        loadRepairItems();
        loadBoards();
    } catch (e) {
        showError(e.message);
    }
}

async function deleteRepairDevice(id) {
    if (!confirm('Удалить устройство из ремонта?')) return;
    try {
        await api('/api/devices/' + id, { method: 'DELETE' });
        toast('Удалено', 'success');
        loadRepairItems();
        loadDevices();
    } catch (e) {
        showError(e.message);
    }
}

// ============ BOARDS ============
async function loadBoards() {
    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка...</p></div>';

    try {
        var results = await Promise.all([
            api('/api/boards'),
            api('/api/board-types')
        ]);
        S.boards = results[0] || [];
        S.boardTypes = results[1] || [];

        var canEditFlag = S.user && S.user.role !== 'operator';

        var viCount = 0, diagCount = 0, asmCount = 0;
        for (var i = 0; i < S.boards.length; i++) {
            if (S.boards[i].visual_inspection_passed) viCount++;
            if (S.boards[i].diagnostics_passed) diagCount++;
            if (S.boards[i].assembly_passed) asmCount++;
        }

        var html = '';
        html += '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-icon blue"></div><div class="stat-info"><span class="stat-value">' + S.boards.length + '</span><span class="stat-label">Всего плат</span></div></div>';
        html += '<div class="stat-card"><div class="stat-icon green"></div><div class="stat-info"><span class="stat-value">' + viCount + '</span><span class="stat-label">Осмотрено</span></div></div>';
        html += '<div class="stat-card"><div class="stat-icon orange"></div><div class="stat-info"><span class="stat-value">' + diagCount + '</span><span class="stat-label">Диагностировано</span></div></div>';
        html += '<div class="stat-card"><div class="stat-icon purple"></div><div class="stat-info"><span class="stat-value">' + asmCount + '</span><span class="stat-label">В изделиях</span></div></div>';
        html += '</div>';

        html += '<div class="action-panel">';
        html += '<div class="search-input-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        html += '<input type="text" class="search-input" placeholder="Поиск..." oninput="filterBoardsTable(this.value)" id="boardSearch"></div>';
        if (canEditFlag) {
            html += '<button class="btn btn-primary" onclick="showAddBoard()">+ Новая плата</button>';
        }
        html += '</div>';

        html += '<div class="table-card"><div class="table-wrapper"><table class="data-table"><thead><tr>';
        html += '<th>Серийный номер</th><th>Тип</th><th>Стадия</th><th>Устройство</th><th>Осмотр</th><th>Диагностика</th>';
        html += '</tr></thead><tbody id="boardsBody">';

        for (var i = 0; i < S.boards.length; i++) {
            var b = S.boards[i];
            html += '<tr>';
            html += '<td><strong style="color:var(--primary);cursor:pointer" onclick="showBoardDetails(' + b.id + ')">' + b.serial_number + '</strong></td>';
            html += '<td><span class="badge badge-neutral">' + (b.board_type_name || '—') + '</span></td>';
            html += '<td><span class="badge ' + stageBadge(b.current_stage) + '">' + stageLabel(b.current_stage) + '</span></td>';
            html += '<td>' + (b.device_serial || '—') + '</td>';
            html += '<td>' + (b.visual_inspection_passed ? '<span class="badge badge-success">Пройден</span>' : '<span class="badge badge-neutral">—</span>') + '</td>';
            html += '<td>' + (b.diagnostics_passed ? '<span class="badge badge-success">Пройдена</span>' : '<span class="badge badge-neutral">—</span>') + '</td>';
            html += '</tr>';
        }

        html += '</tbody></table></div></div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка: ' + e.message + '</p></div>';
    }
}

function filterBoardsTable(val) {
    var search = val.toLowerCase();
    var rows = document.querySelectorAll('#boardsBody tr');
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = rows[i].textContent.toLowerCase().indexOf(search) !== -1 ? '' : 'none';
    }
}

function showAddBoard() {
    var typeOpts = '';
    for (var i = 0; i < S.boardTypes.length; i++) {
        var t = S.boardTypes[i];
        typeOpts += '<option value="' + t.id + '">' + t.name + ' (' + t.code + ')</option>';
    }

    openModal('Новая плата',
        '<form onsubmit="saveBoard(event)">' +
        '<div class="form-grid">' +
        '<div class="form-group"><label class="form-label">Тип *</label><select class="form-select" name="board_type_id" required><option value="">Выберите</option>' + typeOpts + '</select></div>' +
        '<div class="form-group"><label class="form-label">Серийный номер *</label><input class="form-input" name="serial_number" required placeholder="MB-RS-2024-XXX"></div>' +
        '</div>' +
        '<div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button><button type="submit" class="btn btn-primary">Создать</button></div>' +
        '</form>'
    );
}

async function saveBoard(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var data = {};
    fd.forEach(function (v, k) { data[k] = v; });

    try {
        await api('/api/boards', { method: 'POST', body: JSON.stringify(data) });
        toast('Плата создана', 'success');
        closeModal();
        loadBoards();
    } catch (e) {
        showError(e.message);
    }
}

async function showBoardDetails(id) {
    try {
        var b = await api('/api/boards/' + id);
        if (!b) return;

        var viHtml = '';
        if (b.vi_records && b.vi_records.length) {
            for (var i = 0; i < b.vi_records.length; i++) {
                var r = b.vi_records[i];
                viHtml += '<div class="detail-row"><span class="detail-label">' + (r.inspection_date || '') + '</span><span class="detail-value">' + (r.result ? 'Пройден' : 'Не пройден') + ' ' + (r.comment || '') + '</span></div>';
            }
        } else {
            viHtml = '<p style="color:var(--text-muted)">Нет</p>';
        }

        var diagHtml = '';
        if (b.diag_records && b.diag_records.length) {
            for (var i = 0; i < b.diag_records.length; i++) {
                var r = b.diag_records[i];
                diagHtml += '<div class="detail-row"><span class="detail-label">' + (r.diagnostics_date || '') + '</span><span class="detail-value">' + (r.result ? 'Пройдена' : 'Не пройдена') + ' Порты:' + (r.ports_ok ? '+' : '-') + ' ОС:' + (r.os_installed ? '+' : '-') + '</span></div>';
            }
        } else {
            diagHtml = '<p style="color:var(--text-muted)">Нет</p>';
        }

        var html = renderPipeline(b.current_stage, true);
        html += '<div class="detail-grid">';
        html += '<div class="detail-group"><div class="detail-group-title">Информация</div>';
        html += '<div class="detail-row"><span class="detail-label">Серийный номер</span><span class="detail-value">' + b.serial_number + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Тип</span><span class="detail-value">' + (b.board_type_name || '') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Стадия</span><span class="detail-value"><span class="badge ' + stageBadge(b.current_stage) + '">' + stageLabel(b.current_stage) + '</span></span></div>';
        html += '<div class="detail-row"><span class="detail-label">Устройство</span><span class="detail-value">' + (b.device_serial || 'Не привязана') + '</span></div>';
        html += '</div>';
        html += '<div class="detail-group"><div class="detail-group-title">Визуальный осмотр</div>' + viHtml + '</div>';
        html += '<div class="detail-group"><div class="detail-group-title">Диагностика</div>' + diagHtml + '</div>';
        html += '</div>';

        openModal('Плата: ' + b.serial_number, html);
    } catch (e) {
        showError(e.message);
    }
}

// ============ STANDS with autocomplete ============

async function loadAvailableBoardsForVisual() {
    try {
        var boards = await api('/api/boards');
        S.availableBoardsForVisual = boards.filter(function(b) {
            return b.current_stage === 'new';
        });
        return S.availableBoardsForVisual;
    } catch (e) {
        return [];
    }
}

async function loadAvailableBoardsForDiag() {
    try {
        var boards = await api('/api/boards');
        S.availableBoardsForDiag = boards.filter(function(b) {
            return b.current_stage === 'visual_ok' && b.visual_inspection_passed === 1;
        });
        return S.availableBoardsForDiag;
    } catch (e) {
        return [];
    }
}

async function loadAvailableDevicesForPSI() {
    try {
        var devices = await api('/api/devices');
        S.availableDevicesForPSI = devices.filter(function(d) {
            return d.current_stage === 'assembled' && d.assembly_passed === 1;
        });
        return S.availableDevicesForPSI;
    } catch (e) {
        return [];
    }
}

function createDatalist(id, options, valueField, labelField) {
    var datalist = document.getElementById(id);
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = id;
        document.body.appendChild(datalist);
    }
    datalist.innerHTML = '';
    for (var i = 0; i < options.length; i++) {
        var opt = document.createElement('option');
        opt.value = options[i][valueField];
        if (labelField && options[i][labelField]) {
            opt.textContent = options[i][labelField];
        }
        datalist.appendChild(opt);
    }
    return datalist;
}

function renderStandVisual() {
    loadAvailableBoardsForVisual().then(function(boards) {
        createDatalist('visual-boards-list', boards, 'serial_number', 'serial_number');
        
        document.getElementById('contentArea').innerHTML =
            '<div class="stand-form"><div class="section-card">' +
            '<h3>Стенд визуального осмотра</h3>' +
            '<p style="color:var(--text-secondary);margin-bottom:20px">Выберите или отсканируйте плату. Только новые платы.</p>' +
            '<form onsubmit="submitVisualInspection(event)">' +
            '<div class="form-grid">' +
            '<div class="form-group full-width"><label class="form-label">Серийный номер платы *</label>' +
            '<input class="form-input" name="serial_number" list="visual-boards-list" required placeholder="Начните вводить или отсканируйте" autofocus autocomplete="off"></div>' +
            '<div class="form-group full-width"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment" placeholder="Результаты..."></textarea></div>' +
            '</div>' +
            '<div class="form-actions" style="justify-content:center;gap:16px">' +
            '<button type="submit" name="resultBtn" value="ok" class="btn btn-primary" style="background:var(--success)">ОК</button>' +
            '<button type="submit" name="resultBtn" value="fail" class="btn btn-danger">Брак</button>' +
            '</div></form>' +
            '<div id="standResult"></div>' +
            '</div></div>';
    });
}

async function submitVisualInspection(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var isOk = event.submitter && event.submitter.value === 'ok';

    try {
        var r = await api('/api/stands/visual-inspection', {
            method: 'POST',
            body: JSON.stringify({
                serial_number: fd.get('serial_number'),
                result: isOk,
                comment: fd.get('comment')
            })
        });
        document.getElementById('standResult').innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4></div>';
        event.target.reset();
        toast(r.message, 'success');
        if (!isOk) {
            toast('Плата отправлена в ремонт', 'warning');
            loadRepairItems();
        }
        loadAvailableBoardsForVisual();
        renderStandVisual();
    } catch (e) {
        document.getElementById('standResult').innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

function renderStandDiag() {
    loadAvailableBoardsForDiag().then(function(boards) {
        createDatalist('diag-boards-list', boards, 'serial_number', 'serial_number');
        
        document.getElementById('contentArea').innerHTML =
            '<div class="stand-form"><div class="section-card">' +
            '<h3>Стенд диагностики</h3>' +
            '<p style="color:var(--text-secondary);margin-bottom:20px">Плата должна пройти визуальный осмотр.</p>' +
            '<form onsubmit="submitDiagnostics(event)">' +
            '<div class="form-grid">' +
            '<div class="form-group full-width"><label class="form-label">Серийный номер *</label>' +
            '<input class="form-input" name="serial_number" list="diag-boards-list" required placeholder="Начните вводить или отсканируйте" autofocus autocomplete="off"></div>' +
            '<div class="form-group"><label class="form-label">IP-адрес</label><input class="form-input" name="ip_address" placeholder="192.168.1.xxx"></div>' +
            '<div class="form-group"><label class="form-label">Стенд</label><input class="form-input" name="stand_name" placeholder="Стенд Д-1"></div>' +
            '</div>' +
            '<div class="form-group full-width" style="margin-top:16px"><label class="form-label">Проверки</label>' +
            '<div class="checkbox-group">' +
            '<label class="checkbox-item"><input type="checkbox" name="ports_ok" checked> Порты</label>' +
            '<label class="checkbox-item"><input type="checkbox" name="os_installed" checked> ОС</label>' +
            '<label class="checkbox-item"><input type="checkbox" name="disks_ok" checked> Диски</label>' +
            '<label class="checkbox-item"><input type="checkbox" name="memory_ok" checked> Память</label>' +
            '</div></div>' +
            '<div class="form-group full-width" style="margin-top:16px"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment"></textarea></div>' +
            '<div class="form-actions" style="justify-content:center;gap:16px">' +
            '<button type="submit" name="resultBtn" value="ok" class="btn btn-primary" style="background:var(--success)">Пройдена</button>' +
            '<button type="submit" name="resultBtn" value="fail" class="btn btn-danger">Не пройдена</button>' +
            '</div></form>' +
            '<div id="standResult"></div>' +
            '</div></div>';
    });
}

async function submitDiagnostics(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var isOk = event.submitter && event.submitter.value === 'ok';

    try {
        var r = await api('/api/stands/diagnostics', {
            method: 'POST',
            body: JSON.stringify({
                serial_number: fd.get('serial_number'),
                result: isOk,
                comment: fd.get('comment'),
                ip_address: fd.get('ip_address'),
                stand_name: fd.get('stand_name'),
                ports_ok: fd.has('ports_ok'),
                os_installed: fd.has('os_installed'),
                disks_ok: fd.has('disks_ok'),
                memory_ok: fd.has('memory_ok')
            })
        });
        document.getElementById('standResult').innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4></div>';
        event.target.reset();
        toast(r.message, 'success');
        if (!isOk) {
            toast('Плата отправлена в ремонт', 'warning');
            loadRepairItems();
        }
        loadAvailableBoardsForDiag();
        renderStandDiag();
    } catch (e) {
        document.getElementById('standResult').innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

function renderStandAssembly() {
    document.getElementById('contentArea').innerHTML =
        '<div class="stand-form"><div class="section-card">' +
        '<h3>Стенд сборки</h3>' +
        '<p style="color:var(--text-secondary);margin-bottom:20px">Все платы должны пройти диагностику.</p>' +
        '<form onsubmit="submitAssembly(event)">' +
        '<div class="form-grid">' +
        '<div class="form-group full-width"><label class="form-label">Серийный номер изделия *</label><input class="form-input" name="device_serial_number" required placeholder="RS501175220XXX"></div>' +
        '<div class="form-group full-width"><label class="form-label">Серийный номер корпуса *</label><input class="form-input" name="case_serial_number" required placeholder="CASE-RS-2024-XXX"></div>' +
        '<div class="form-group"><label class="form-label">Тип</label><select class="form-select" name="device_type_id"><option value="1">RS</option><option value="2">SA</option></select></div>' +
        '</div>' +
        '<div class="form-group full-width" style="margin-top:16px">' +
        '<label class="form-label">Серийные номера плат (по строкам) *</label>' +
        '<textarea class="form-textarea" name="board_serials" required placeholder="MB-RS-2024-010&#10;PB-RS-2024-010" style="min-height:120px"></textarea>' +
        '</div>' +
        '<div class="form-actions" style="justify-content:center">' +
        '<button type="submit" class="btn btn-primary">Собрать</button>' +
        '</div></form>' +
        '<div id="standResult"></div>' +
        '</div></div>';
}

async function submitAssembly(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var serials = fd.get('board_serials').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);

    if (!serials.length) { toast('Введите серийные номера', 'warning'); return; }

    try {
        var r = await api('/api/stands/assembly', {
            method: 'POST',
            body: JSON.stringify({
                board_serial_numbers: serials,
                case_serial_number: fd.get('case_serial_number'),
                device_serial_number: fd.get('device_serial_number'),
                device_type_id: fd.get('device_type_id')
            })
        });
        document.getElementById('standResult').innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4><p>ID: ' + r.device_id + '</p></div>';
        event.target.reset();
        toast(r.message, 'success');
    } catch (e) {
        document.getElementById('standResult').innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

function renderStandPSI() {
    loadAvailableDevicesForPSI().then(function(devices) {
        createDatalist('psi-devices-list', devices, 'product_serial_number', 'product_serial_number');
        
        document.getElementById('contentArea').innerHTML =
            '<div class="stand-form"><div class="section-card">' +
            '<h3>Стенд ПСИ</h3>' +
            '<p style="color:var(--text-secondary);margin-bottom:20px">Устройство должно пройти сборку.</p>' +
            '<form onsubmit="submitPSI(event)">' +
            '<div class="form-grid">' +
            '<div class="form-group full-width"><label class="form-label">Серийный номер изделия *</label>' +
            '<input class="form-input" name="device_serial_number" list="psi-devices-list" required placeholder="Начните вводить" autofocus autocomplete="off"></div>' +
            '<div class="form-group"><label class="form-label">Протокол *</label><input class="form-input" name="protocol_number" required placeholder="PSI-2024-XXX"></div>' +
            '<div class="form-group"><label class="form-label">Прошивка *</label><input class="form-input" name="firmware_version" required placeholder="router_6.4"></div>' +
            '</div>' +
            '<div class="form-group full-width" style="margin-top:16px"><label class="form-label">Проверки</label>' +
            '<div class="checkbox-group">' +
            '<label class="checkbox-item"><input type="checkbox" name="ports_ok" checked> Порты</label>' +
            '<label class="checkbox-item"><input type="checkbox" name="os_installed" checked> ОС</label>' +
            '<label class="checkbox-item"><input type="checkbox" name="disks_ok" checked> Диски</label>' +
            '<label class="checkbox-item"><input type="checkbox" name="memory_ok" checked> Память</label>' +
            '</div></div>' +
            '<div class="form-group full-width" style="margin-top:16px"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment"></textarea></div>' +
            '<div class="form-actions" style="justify-content:center;gap:16px">' +
            '<button type="submit" name="resultBtn" value="ok" class="btn btn-primary" style="background:var(--success)">ПСИ пройден</button>' +
            '<button type="submit" name="resultBtn" value="fail" class="btn btn-danger">Не пройден</button>' +
            '</div></form>' +
            '<div id="standResult"></div>' +
            '</div></div>';
    });
}

async function submitPSI(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var isOk = event.submitter && event.submitter.value === 'ok';

    try {
        var r = await api('/api/stands/psi', {
            method: 'POST',
            body: JSON.stringify({
                device_serial_number: fd.get('device_serial_number'),
                result: isOk,
                comment: fd.get('comment'),
                protocol_number: fd.get('protocol_number'),
                firmware_version: fd.get('firmware_version'),
                ports_ok: fd.has('ports_ok'),
                os_installed: fd.has('os_installed'),
                disks_ok: fd.has('disks_ok'),
                memory_ok: fd.has('memory_ok')
            })
        });
        document.getElementById('standResult').innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4></div>';
        event.target.reset();
        toast(r.message, 'success');
        if (!isOk) {
            toast('Устройство отправлено в ремонт', 'warning');
            loadRepairItems();
        }
        loadAvailableDevicesForPSI();
        renderStandPSI();
    } catch (e) {
        document.getElementById('standResult').innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

function renderStandPackaging() {
    document.getElementById('contentArea').innerHTML =
        '<div class="stand-form"><div class="section-card">' +
        '<h3>Стенд упаковки</h3>' +
        '<p style="color:var(--text-secondary);margin-bottom:20px">Устройство должно пройти ПСИ. Печать паспорта и этикетки.</p>' +
        '<form onsubmit="submitPackaging(event)">' +
        '<div class="form-grid">' +
        '<div class="form-group full-width"><label class="form-label">Серийный номер изделия *</label><input class="form-input" name="device_serial_number" required autofocus></div>' +
        '<div class="form-group full-width"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment"></textarea></div>' +
        '</div>' +
        '<div class="form-actions" style="justify-content:center">' +
        '<button type="submit" class="btn btn-primary">Упаковать</button>' +
        '</div></form>' +
        '<div id="standResult"></div>' +
        '</div></div>';
}

async function submitPackaging(event) {
    event.preventDefault();
    var fd = new FormData(event.target);

    try {
        var r = await api('/api/stands/packaging', {
            method: 'POST',
            body: JSON.stringify({
                device_serial_number: fd.get('device_serial_number'),
                comment: fd.get('comment')
            })
        });
        var dateStr = r.passport && r.passport.date ? new Date(r.passport.date).toLocaleString('ru') : '';
        document.getElementById('standResult').innerHTML =
            '<div class="stand-result success">' +
            '<h4>' + r.message + '</h4>' +
            '<p style="margin-top:12px">Паспорт: ' + (r.passport ? r.passport.serial_number : '') + '</p>' +
            '<p>Этикетка: ' + (r.label ? r.label.serial_number : '') + '</p>' +
            '<p style="font-size:12px;color:var(--text-muted);margin-top:8px">' + dateStr + '</p>' +
            '</div>';
        event.target.reset();
        toast(r.message, 'success');
    } catch (e) {
        document.getElementById('standResult').innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

// ============ REFERENCES ============

async function loadDeviceTypes() {
    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        var types = await api('/api/device-types');
        S.deviceTypes = types || [];
        var isAdmin = S.user && S.user.role === 'admin';

        var html = '<div class="action-panel">';
        if (isAdmin) html += '<button class="btn btn-primary" onclick="showAddType()">+ Добавить</button>';
        html += '</div>';

        html += '<div class="table-card"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Код</th><th>Название</th>';
        if (isAdmin) html += '<th>Действия</th>';
        html += '</tr></thead><tbody>';

        for (var i = 0; i < S.deviceTypes.length; i++) {
            var t = S.deviceTypes[i];
            html += '<tr><td><span class="badge badge-info">' + t.code + '</span></td><td>' + t.name + '</td>';
            if (isAdmin) html += '<td><button class="btn-icon danger" onclick="deleteType(' + t.id + ')">✕</button></td>';
            html += '</tr>';
        }

        html += '</tbody></table></div></div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка</p></div>';
    }
}

function showAddType() {
    openModal('Новый тип',
        '<form onsubmit="saveType(event)"><div class="form-grid">' +
        '<div class="form-group"><label class="form-label">Код *</label><input class="form-input" name="code" required maxlength="10"></div>' +
        '<div class="form-group"><label class="form-label">Название *</label><input class="form-input" name="name" required></div>' +
        '</div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button><button type="submit" class="btn btn-primary">Создать</button></div></form>'
    );
}

async function saveType(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
        await api('/api/device-types', { method: 'POST', body: JSON.stringify({ name: fd.get('name'), code: fd.get('code') }) });
        toast('Добавлено', 'success');
        closeModal();
        loadDeviceTypes();
    } catch (err) { showError(err.message); }
}

async function deleteType(id) {
    if (!confirm('Удалить?')) return;
    try { await api('/api/device-types/' + id, { method: 'DELETE' }); toast('Удалено', 'success'); loadDeviceTypes(); }
    catch (e) { showError(e.message); }
}

async function loadProductionPlaces() {
    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        var places = await api('/api/production-places');
        S.productionPlaces = places || [];
        var isAdmin = S.user && S.user.role === 'admin';

        var html = '<div class="action-panel">';
        if (isAdmin) html += '<button class="btn btn-primary" onclick="showAddPlace()">+ Добавить</button>';
        html += '</div>';

        html += '<div class="table-card"><div class="table-wrapper"><table class="data-table"><thead><tr><th>Код</th><th>Название</th>';
        if (isAdmin) html += '<th>Действия</th>';
        html += '</tr></thead><tbody>';

        for (var i = 0; i < S.productionPlaces.length; i++) {
            var p = S.productionPlaces[i];
            html += '<tr><td><span class="badge badge-neutral">' + p.code + '</span></td><td>' + p.name + '</td>';
            if (isAdmin) html += '<td><button class="btn-icon danger" onclick="deletePlace(' + p.id + ')">✕</button></td>';
            html += '</tr>';
        }

        html += '</tbody></table></div></div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка</p></div>';
    }
}

function showAddPlace() {
    openModal('Новое место',
        '<form onsubmit="savePlace(event)"><div class="form-grid">' +
        '<div class="form-group"><label class="form-label">Код *</label><input class="form-input" name="code" required></div>' +
        '<div class="form-group"><label class="form-label">Название *</label><input class="form-input" name="name" required></div>' +
        '</div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button><button type="submit" class="btn btn-primary">Создать</button></div></form>'
    );
}

async function savePlace(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
        await api('/api/production-places', { method: 'POST', body: JSON.stringify({ name: fd.get('name'), code: fd.get('code') }) });
        toast('Добавлено', 'success');
        closeModal();
        loadProductionPlaces();
    } catch (err) { showError(err.message); }
}

async function deletePlace(id) {
    if (!confirm('Удалить?')) return;
    try { await api('/api/production-places/' + id, { method: 'DELETE' }); toast('Удалено', 'success'); loadProductionPlaces(); }
    catch (e) { showError(e.message); }
}

function renderSerialStructure() {
    document.getElementById('contentArea').innerHTML =
        '<div class="section-card"><h3>Формат серийного номера</h3>' +
        '<p style="color:var(--text-secondary);margin-bottom:24px">Пример: <strong>RS501175220001</strong></p>' +
        '<div style="text-align:center;margin-bottom:40px"><div class="serial-structure">' +
        '<div class="serial-segment seg-type" data-label="Тип">RS</div>' +
        '<div class="serial-segment seg-stage" data-label="Этап">5</div>' +
        '<div class="serial-segment seg-place" data-label="Место">01</div>' +
        '<div class="serial-segment seg-prod" data-label="Код">17</div>' +
        '<div class="serial-segment seg-year" data-label="Год">52</div>' +
        '<div class="serial-segment seg-month" data-label="Месяц">20</div>' +
        '<div class="serial-segment seg-seq" data-label="Последовательный">001</div>' +
        '</div></div></div>' +
        '<div class="detail-grid">' +
        '<div class="section-card"><h3>Тип</h3><div class="detail-row"><span class="detail-label">RS</span><span class="detail-value">Маршрутизатор</span></div><div class="detail-row"><span class="detail-label">SA</span><span class="detail-value">Коммутатор</span></div></div>' +
        '<div class="section-card"><h3>Этап</h3><div class="detail-row"><span class="detail-label">1-2</span><span class="detail-value">Опытный образец</span></div><div class="detail-row"><span class="detail-label">3-4</span><span class="detail-value">Отладка</span></div><div class="detail-row"><span class="detail-label">5</span><span class="detail-value">Серийное</span></div></div>' +
        '</div>';
}

// ============ STATISTICS ============
async function loadStatistics() {
    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        var s = await api('/api/statistics');
        if (!s) return;

        var stageLabelsMap = { 'new': 'Новое', 'visual_ok': 'Осмотр', 'diagnostics_ok': 'Диагностика', 'assembled': 'Собрано', 'psi_ok': 'ПСИ', 'packaged': 'Упаковано' };

        var html = '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-icon blue"></div><div class="stat-info"><span class="stat-value">' + s.totalDevices + '</span><span class="stat-label">Устройств</span></div></div>';
        html += '<div class="stat-card"><div class="stat-icon green"></div><div class="stat-info"><span class="stat-value">' + s.totalBoards + '</span><span class="stat-label">Плат</span></div></div>';
        html += '<div class="stat-card"><div class="stat-icon purple"></div><div class="stat-info"><span class="stat-value">' + s.totalEmployees + '</span><span class="stat-label">Сотрудников</span></div></div>';
        html += '</div>';

        html += '<div class="chart-grid">';

        if (s.byType && s.byType.length) {
            var maxT = 1;
            for (var i = 0; i < s.byType.length; i++) { if (s.byType[i].count > maxT) maxT = s.byType[i].count; }
            html += '<div class="chart-card"><h4>По типу</h4><div class="bar-chart">';
            for (var i = 0; i < s.byType.length; i++) {
                var t = s.byType[i];
                html += '<div class="bar-item"><span class="bar-label">' + t.name + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (t.count / maxT * 100) + '%"></div></div><span class="bar-value">' + t.count + '</span></div>';
            }
            html += '</div></div>';
        }

        if (s.byStage && s.byStage.length) {
            var maxDS = 1;
            for (var i = 0; i < s.byStage.length; i++) { if (s.byStage[i].count > maxDS) maxDS = s.byStage[i].count; }
            html += '<div class="chart-card"><h4>Устройства по стадии</h4><div class="bar-chart">';
            for (var i = 0; i < s.byStage.length; i++) {
                var x = s.byStage[i];
                html += '<div class="bar-item"><span class="bar-label">' + (stageLabelsMap[x.current_stage] || x.current_stage) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (x.count / maxDS * 100) + '%"></div></div><span class="bar-value">' + x.count + '</span></div>';
            }
            html += '</div></div>';
        }

        if (s.boardsByStage && s.boardsByStage.length) {
            var maxBS = 1;
            for (var i = 0; i < s.boardsByStage.length; i++) { if (s.boardsByStage[i].count > maxBS) maxBS = s.boardsByStage[i].count; }
            html += '<div class="chart-card"><h4>Платы по стадии</h4><div class="bar-chart">';
            for (var i = 0; i < s.boardsByStage.length; i++) {
                var x = s.boardsByStage[i];
                html += '<div class="bar-item"><span class="bar-label">' + (stageLabelsMap[x.current_stage] || x.current_stage) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + (x.count / maxBS * 100) + '%"></div></div><span class="bar-value">' + x.count + '</span></div>';
            }
            html += '</div></div>';
        }

        if (s.recentDevices && s.recentDevices.length) {
            html += '<div class="chart-card"><h4>Последние устройства</h4><div class="recent-list">';
            for (var i = 0; i < s.recentDevices.length; i++) {
                var d = s.recentDevices[i];
                html += '<div class="recent-item"><div class="recent-item-icon"></div><div class="recent-item-info"><div class="recent-item-title">' + (d.product_serial_number || '—') + '</div><div class="recent-item-sub">' + (d.dtn || '') + ' • ' + (stageLabelsMap[d.current_stage] || d.current_stage || '') + '</div></div></div>';
            }
            html += '</div></div>';
        }

        html += '</div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка</p></div>';
    }
}

// ============ EMPLOYEES ============
async function loadEmployees() {
    if (!S.user || S.user.role !== 'admin') {
        document.getElementById('contentArea').innerHTML = '<div class="empty-state"><p>Недостаточно прав</p></div>';
        return;
    }

    var content = document.getElementById('contentArea');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        var emps = await api('/api/employees');
        S.employees = emps || [];

        var roleLabels = { admin: 'Админ', user: 'Пользователь', operator: 'Оператор' };
        var roleBadges = { admin: 'badge-error', user: 'badge-info', operator: 'badge-warning' };

        var html = '<div class="action-panel"><button class="btn btn-primary" onclick="showAddEmp()">+ Добавить</button></div>';
        html += '<div class="table-card"><div class="table-wrapper"><table class="data-table"><thead><tr><th>ФИО</th><th>Должность</th><th>Логин</th><th>Роль</th><th>Действия</th></tr></thead><tbody>';

        for (var i = 0; i < S.employees.length; i++) {
            var e = S.employees[i];
            html += '<tr>';
            html += '<td><strong>' + e.last_name + ' ' + e.first_name + ' ' + (e.middle_name || '') + '</strong></td>';
            html += '<td>' + e.position + '</td>';
            html += '<td><code style="background:var(--bg-input);padding:2px 8px;border-radius:4px">' + e.username + '</code></td>';
            html += '<td><span class="badge ' + (roleBadges[e.role] || 'badge-neutral') + '">' + (roleLabels[e.role] || e.role) + '</span></td>';
            html += '<td><div class="cell-actions">';
            html += '<button class="btn-icon" onclick="showEditEmp(' + e.id + ')">✎</button>';
            html += '<button class="btn-icon danger" onclick="deleteEmp(' + e.id + ')">✕</button>';
            html += '</div></td></tr>';
        }

        html += '</tbody></table></div></div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка</p></div>';
    }
}

function showAddEmp(data) {
    var e = data || {};
    var title = e.id ? 'Редактировать' : 'Новый сотрудник';

    var html = '<form onsubmit="saveEmp(event,' + (e.id || 'null') + ')"><div class="form-grid">';
    html += '<div class="form-group"><label class="form-label">Фамилия *</label><input class="form-input" name="last_name" value="' + (e.last_name || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Имя *</label><input class="form-input" name="first_name" value="' + (e.first_name || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Отчество</label><input class="form-input" name="middle_name" value="' + (e.middle_name || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Должность *</label><input class="form-input" name="position" value="' + (e.position || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Логин *</label><input class="form-input" name="username" value="' + (e.username || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">' + (e.id ? 'Новый пароль' : 'Пароль *') + '</label><input class="form-input" type="password" name="password" ' + (e.id ? '' : 'required') + '></div>';
    html += '<div class="form-group"><label class="form-label">Роль</label><select class="form-select" name="role">';
    html += '<option value="user"' + (e.role === 'user' ? ' selected' : '') + '>Пользователь</option>';
    html += '<option value="admin"' + (e.role === 'admin' ? ' selected' : '') + '>Админ</option>';
    html += '<option value="operator"' + (e.role === 'operator' ? ' selected' : '') + '>Оператор</option>';
    html += '</select></div>';
    html += '</div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button><button type="submit" class="btn btn-primary">' + (e.id ? 'Сохранить' : 'Создать') + '</button></div></form>';

    openModal(title, html);
}

async function showEditEmp(id) {
    try {
        var e = await api('/api/employees/' + id);
        if (e) showAddEmp(e);
    } catch (err) { showError(err.message); }
}

async function saveEmp(event, id) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var data = {};
    fd.forEach(function (v, k) { data[k] = v; });
    if (!data.password) delete data.password;

    try {
        if (id) {
            await api('/api/employees/' + id, { method: 'PUT', body: JSON.stringify(data) });
            toast('Обновлено', 'success');
        } else {
            await api('/api/employees', { method: 'POST', body: JSON.stringify(data) });
            toast('Создано', 'success');
        }
        closeModal();
        loadEmployees();
    } catch (e) { showError(e.message); }
}

async function deleteEmp(id) {
    if (!confirm('Удалить?')) return;
    try { await api('/api/employees/' + id, { method: 'DELETE' }); toast('Удалено', 'success'); loadEmployees(); }
    catch (e) { showError(e.message); }
}

// ============ PROFILE ============
function renderProfile() {
    if (!S.user) return;
    var u = S.user;
    var roleMap = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };
    var roleBadges = { admin: 'badge-error', user: 'badge-info', operator: 'badge-warning' };
    var initials = (u.first_name?.[0] || '') + (u.last_name?.[0] || '');

    // Формируем ФИО полностью
    var fullName = u.last_name + ' ' + u.first_name;
    if (u.middle_name) fullName += ' ' + u.middle_name;
    
    // Получаем дату регистрации из localStorage или формируем
    var registeredAt = localStorage.getItem('user_registered');
    if (!registeredAt) {
        registeredAt = new Date().toLocaleDateString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        localStorage.setItem('user_registered', registeredAt);
    }
    
    // Получаем последний вход из localStorage
    var lastLogin = localStorage.getItem('last_login');
    if (!lastLogin) {
        lastLogin = new Date().toLocaleString('ru');
        localStorage.setItem('last_login', lastLogin);
    }

    var html = `
        <div class="profile-card section-card">
            <div class="profile-header">
                <div class="profile-avatar-lg">${initials.toUpperCase()}</div>
                <div class="profile-name">${fullName}</div>
                <div class="profile-position">${u.position || '—'}</div>
                <span class="badge ${roleBadges[u.role] || ''}" style="margin-top:8px">${roleMap[u.role] || u.role}</span>
            </div>
            
            <div style="padding: 0 24px 24px">
                <div class="detail-group" style="margin-bottom: 20px">
                    <div class="detail-group-title">Учётные данные</div>
                    <div class="detail-row">
                        <span class="detail-label">Логин</span>
                        <span class="detail-value">${u.username}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ID сотрудника</span>
                        <span class="detail-value">${u.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Роль</span>
                        <span class="detail-value">${roleMap[u.role] || u.role}</span>
                    </div>
                </div>
                
                <div class="detail-group" style="margin-bottom: 20px">
                    <div class="detail-group-title">Личная информация</div>
                    <div class="detail-row">
                        <span class="detail-label">Фамилия</span>
                        <span class="detail-value">${u.last_name || '—'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Имя</span>
                        <span class="detail-value">${u.first_name || '—'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Отчество</span>
                        <span class="detail-value">${u.middle_name || '—'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Должность</span>
                        <span class="detail-value">${u.position || '—'}</span>
                    </div>
                </div>
                
                <div class="detail-group" style="margin-bottom: 20px">
                    <div class="detail-group-title">Активность</div>
                    <div class="detail-row">
                        <span class="detail-label">Последний вход</span>
                        <span class="detail-value" id="lastLoginValue">${lastLogin}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Дата регистрации</span>
                        <span class="detail-value">${registeredAt}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Текущая сессия</span>
                        <span class="detail-value" id="sessionTime">--:--:--</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <div class="detail-group-title">Права доступа</div>
                    <div class="detail-row">
                        <span class="detail-label">${u.role === 'admin' ? '✓ Полный доступ' : (u.role === 'user' ? '✓ Редактирование' : '✓ Только стенды')}</span>
                    </div>
                    ${u.role === 'admin' ? '<div class="detail-row"><span class="detail-label">• Управление сотрудниками</span></div>' : ''}
                    ${u.role === 'admin' ? '<div class="detail-row"><span class="detail-label">• Удаление записей</span></div>' : ''}
                    ${u.role !== 'operator' ? '<div class="detail-row"><span class="detail-label">• Редактирование справочников</span></div>' : ''}
                    <div class="detail-row"><span class="detail-label">• Прохождение стендов</span></div>
                </div>
                
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); text-align: center">
                    <button class="btn btn-secondary" onclick="showChangePassword()" style="margin-right: 12px">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Сменить пароль
                    </button>
                    <button class="btn btn-primary" onclick="showContent('devices')">
                        Перейти к работе
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = html;
    
    // Запускаем таймер для отображения длительности сессии
    startSessionTimer();
}

// Глобальная переменная для времени начала сессии
var sessionStartTime = null;

// Функция для обновления времени последнего входа
function updateLastLogin() {
    var now = new Date();
    var nowStr = now.toLocaleString('ru', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    localStorage.setItem('last_login', nowStr);
    
    var lastLoginEl = document.getElementById('lastLoginValue');
    if (lastLoginEl) {
        lastLoginEl.textContent = nowStr;
    }
}

// Функция для запуска таймера сессии
function startSessionTimer() {
    if (!sessionStartTime) {
        sessionStartTime = new Date();
    }
    
    var sessionEl = document.getElementById('sessionTime');
    if (!sessionEl) return;
    
    function updateTimer() {
        if (!sessionStartTime) return;
        var now = new Date();
        var diff = Math.floor((now - sessionStartTime) / 1000);
        var hours = Math.floor(diff / 3600);
        var minutes = Math.floor((diff % 3600) / 60);
        var seconds = diff % 60;
        
        var timeStr = '';
        if (hours > 0) timeStr += hours + 'ч ';
        timeStr += minutes + 'м ' + seconds + 'с';
        
        var sessionEl_ = document.getElementById('sessionTime');
        if (sessionEl_) sessionEl_.textContent = timeStr;
    }
    
    updateTimer();
    // Обновляем каждую секунду
    if (window.sessionInterval) clearInterval(window.sessionInterval);
    window.sessionInterval = setInterval(updateTimer, 1000);
}

// Функция для обновления последнего входа при загрузке страницы
function updateLastLoginOnLoad() {
    var now = new Date();
    var nowStr = now.toLocaleString('ru', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    localStorage.setItem('last_login', nowStr);
}

// Вызываем обновление при загрузке страницы (после успешной авторизации)
// Добавьте эту строку в функцию loadUser() после получения данных пользователя

// ============ USER ============
async function loadUser() {
    try {
        S.user = await api('/api/current-user');
        if (!S.user) return;

        // Обновляем время последнего входа при каждом входе в систему
        var now = new Date();
        var nowStr = now.toLocaleString('ru', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        localStorage.setItem('last_login', nowStr);
        
        // Устанавливаем время начала сессии
        sessionStartTime = new Date();

        const initials = (S.user.first_name?.[0] || '') + (S.user.last_name?.[0] || '');
        document.getElementById('userAvatar').textContent = initials.toUpperCase();
        document.getElementById('sidebarUserName').textContent = S.user.last_name + ' ' + (S.user.first_name?.[0] || '') + '.';

        const roleMap = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };
        const roleColors = { admin: '#e03131', user: '#e03131', operator: '#e03131' };
        
        const userRoleEl = document.getElementById('sidebarUserRole');
        userRoleEl.textContent = roleMap[S.user.role] || S.user.role;
        userRoleEl.style.color = roleColors[S.user.role] || '#e03131';
        
        // Разные права доступа в зависимости от роли
        if (S.user.role === 'admin') {
            document.getElementById('employeesBtn').style.display = '';
        } else if (S.user.role === 'user') {
            document.getElementById('employeesBtn').style.display = 'none';
        } else { // operator
            document.getElementById('employeesBtn').style.display = 'none';
            toast('Вы вошли как оператор. Доступно только прохождение стендов.', 'info');
        }

        showContent('devices');
    } catch (e) {
        console.error('loadUser failed:', e);
        document.getElementById('contentArea').innerHTML =
            '<div class="empty-state"><p>Ошибка загрузки пользователя: ' + e.message + '</p></div>';
    }
}