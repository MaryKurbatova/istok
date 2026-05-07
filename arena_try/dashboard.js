
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

// ============ ЗАГРУЗКА ИЗОБРАЖЕНИЯ (глобальная функция) ============
async function previewDeviceImage() {
    const input = document.getElementById('deviceImageInput');
    const preview = document.getElementById('imagePreview');
    const hiddenInput = document.getElementById('uploadedImagePath');
    
    if (!input || !preview || !hiddenInput) {
        console.error('Элементы не найдены');
        return;
    }
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (file.size > 5 * 1024 * 1024) {
            toast('Файл слишком большой (макс. 5MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = '<img src="' + e.target.result + '" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:8px;">';
        };
        reader.readAsDataURL(file);
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + S.token
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Ошибка загрузки: ' + response.status);
            }
            
            const data = await response.json();
            if (data.path) {
                hiddenInput.value = data.path;
                toast('Изображение загружено', 'success');
            } else {
                throw new Error('Путь не получен');
            }
        } catch (e) {
            console.error('Upload error:', e);
            toast('Ошибка загрузки: ' + e.message, 'error');
        }
    }
}

// ============ Error Dialog ============
function showError(message, title = 'Ошибка') {
    const dialog = document.getElementById('errorDialog');
    if (!dialog) return;
    const titleEl = document.getElementById('errorTitle');
    const messageEl = document.getElementById('errorMessage');
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    dialog.classList.add('active');
}

function closeErrorDialog() {
    const dialog = document.getElementById('errorDialog');
    if (dialog) dialog.classList.remove('active');
}

// ============ ESCAPE HTML ============
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes';
        document.head.appendChild(viewport);
    }
    
    loadUser();
});

// ============ API ============
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
        
        window.sessionStartTime = new Date();

        const initials = (S.user.first_name?.[0] || '') + (S.user.last_name?.[0] || '');
        const userAvatar = document.getElementById('userAvatar');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserRole = document.getElementById('sidebarUserRole');
        
        if (userAvatar) userAvatar.textContent = initials.toUpperCase();
        if (sidebarUserName) sidebarUserName.textContent = S.user.last_name + ' ' + (S.user.first_name?.[0] || '') + '.';

        const roleMap = { admin: 'Администратор', user: 'Пользователь', operator: 'Оператор' };
        const roleColors = { admin: '#e03131', user: '#e03131', operator: '#e03131' };
        
        if (sidebarUserRole) {
            sidebarUserRole.textContent = roleMap[S.user.role] || S.user.role;
            sidebarUserRole.style.color = roleColors[S.user.role] || '#e03131';
        }
        
        const employeesBtn = document.getElementById('employeesBtn');
        if (employeesBtn) {
            if (S.user.role === 'admin') {
                employeesBtn.style.display = '';
            } else {
                employeesBtn.style.display = 'none';
            }
        }
        
        if (S.user.role === 'operator') {
            toast('Вы вошли как оператор. Доступно только прохождение стендов.', 'info');
        }

        showContent('devices');
    } catch (e) {
        console.error('loadUser failed:', e);
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = '<div class="empty-state"><p>Ошибка загрузки пользователя: ' + e.message + '</p></div>';
        }
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
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

// ============ TOAST ============
function toast(msg, type = 'info') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
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
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = html;
    if (modalOverlay) modalOverlay.classList.add('active');
}

function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

// ============ УПРАВЛЕНИЕ СКАНЕРОМ ============
function handleScannerKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        focusNextField(event.target);
    }
}

function focusNextField(currentElement) {
    const form = currentElement.closest('form');
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll('input:not([type="submit"]):not([type="button"]), textarea, select'));
    const index = inputs.indexOf(currentElement);
    if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
    }
}

// ============ NAVIGATION ============
function showContent(section) {
    S.section = section;

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector('[data-section="' + section + '"]');
    if (navItem) navItem.classList.add('active');

    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }

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
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[section] || section;

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
            const contentArea = document.getElementById('contentArea');
            if (contentArea) {
                contentArea.innerHTML = '<div class="empty-state"><p>Раздел в разработке</p></div>';
            }
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

function getPlaceIcon(name) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>`;
}

// ============ DEVICES ============
async function loadDevices() {
    var content = document.getElementById('contentArea');
    if (!content) return;
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
    if (!content) return;
    var canEditFlag = S.user && S.user.role !== 'operator';

    var typeOptions = '';
    for (var i = 0; i < S.deviceTypes.length; i++) {
        var t = S.deviceTypes[i];
        typeOptions += '<option value="' + t.code + '">' + escapeHtml(t.name) + ' (' + t.code + ')</option>';
    }

    var rsCount = 0, saCount = 0, packagedCount = 0;
    for (var i = 0; i < S.devices.length; i++) {
        if (S.devices[i].device_type_code === 'RS') rsCount++;
        if (S.devices[i].device_type_code === 'SA') saCount++;
        if (S.devices[i].current_stage === 'packaged') packagedCount++;
    }

    var html = '';
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + S.devices.length + '</span><span class="stat-label">Всего</span></div></div>';
    html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + rsCount + '</span><span class="stat-label">Маршрутизаторов</span></div></div>';
    html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + saCount + '</span><span class="stat-label">Коммутаторов</span></div></div>';
    html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + packagedCount + '</span><span class="stat-label">Упаковано</span></div></div>';
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
        html += '<img class="device-card-img" src="' + img + '" alt="' + escapeHtml(d.type || '') + '" onerror="this.src=\'/images/ISN41508T3.png\'">';
        html += '<div class="device-card-body">';
        html += '<div class="device-card-title">' + escapeHtml(d.product_serial_number || '—') + '</div>';
        html += '<div class="device-card-sub">' + escapeHtml(d.type || '—') + '</div>';
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

async function showDeviceDetails(id) {
    try {
        var d = await api('/api/devices/' + id);
        if (!d) return;

        var img = d.image_path || getDeviceImage(d.type);

        var boardsHtml = '';
        if (d.boards && d.boards.length) {
            for (var i = 0; i < d.boards.length; i++) {
                var b = d.boards[i];
                boardsHtml += '<div class="detail-row"><span class="detail-label">' + escapeHtml(b.board_type_name || '') + ' (' + escapeHtml(b.serial_number) + ')</span><span class="detail-value"><span class="badge ' + stageBadge(b.current_stage) + '">' + stageLabel(b.current_stage) + '</span></span></div>';
            }
        } else {
            boardsHtml = '<p style="color:var(--text-muted)">Нет привязанных плат</p>';
        }

        var macHtml = '';
        if (d.macs && d.macs.length) {
            for (var i = 0; i < d.macs.length; i++) {
                var m = d.macs[i];
                macHtml += '<div class="detail-row"><span class="detail-label">' + escapeHtml(m.interface_name) + '</span><span class="detail-value">' + escapeHtml(m.mac_address) + '</span></div>';
            }
        } else {
            macHtml = '<p style="color:var(--text-muted)">Нет</p>';
        }

        var historyHtml = '';
        if (d.history && d.history.length) {
            for (var i = 0; i < d.history.length; i++) {
                var h = d.history[i];
                historyHtml += '<div class="recent-item"><div class="recent-item-icon"></div><div class="recent-item-info"><div class="recent-item-title">' + escapeHtml(h.message || '—') + '</div><div class="recent-item-sub">' + (h.date_time || '') + (h.emp_name ? ' — ' + escapeHtml(h.emp_name) : '') + '</div></div></div>';
            }
        } else {
            historyHtml = '<p style="color:var(--text-muted)">Нет записей</p>';
        }

        var html = '';
        html += '<div style="text-align:center;margin-bottom:20px">';
        html += '<img src="' + img + '" alt="' + escapeHtml(d.type || '') + '" style="max-height:200px;object-fit:contain;border-radius:var(--radius-md)" onerror="this.src=\'/images/ISN41508T3.png\'">';
        html += '</div>';
        html += renderPipeline(d.current_stage, false);

        html += '<div class="detail-grid">';
        html += '<div class="detail-group"><div class="detail-group-title">Основная информация</div>';
        html += '<div class="detail-row"><span class="detail-label">Серийный номер</span><span class="detail-value">' + escapeHtml(d.product_serial_number || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Тип</span><span class="detail-value">' + escapeHtml(d.device_type_name || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Модификация</span><span class="detail-value">' + escapeHtml(d.type || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Дата</span><span class="detail-value">' + (d.manufactures_date || '—') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">ОС</span><span class="detail-value">' + escapeHtml(d.version_os || '—') + '</span></div>';
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
        html += '<option value="' + item.id + '"' + sel + '>' + escapeHtml(item[labelField]) + extra + '</option>';
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
    html += '<div class="form-group"><label class="form-label">Серийный номер *</label><input class="form-input" name="product_serial_number" value="' + escapeHtml(d.product_serial_number || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Модификация</label><input class="form-input" name="type" value="' + escapeHtml(d.type || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Дата производства</label><input class="form-input" type="date" name="manufactures_date" value="' + (d.manufactures_date || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Место</label><select class="form-select" name="place_of_production_id"><option value="">—</option>' + makeSelectOptions(S.productionPlaces, 'code', 'name', d.place_of_production_id) + '</select></div>';
    html += '<div class="form-group"><label class="form-label">Расположениые</label><select class="form-select" name="actual_location_id"><option value="">—</option>' + makeSelectOptions(S.locations, '', 'name', d.actual_location_id) + '</select></div>';
    html += '<div class="form-group"><label class="form-label">Версия ОС</label><input class="form-input" name="version_os" value="' + escapeHtml(d.version_os || '') + '"></div>';
    html += ' <div class="form-group"> <label class="form-label">Изображение</label> <input type="file" id="deviceImageInput" class="form-input" accept="image/*" onchange="previewDeviceImage()"> </div>';
    html += ' <div id="imagePreview" style="margin-top:10px;text-align:center"> </div>';
    html += ' <input type="hidden" id="uploadedImagePath" name="image_path" value="' + escapeHtml(d.image_path || '') + '">';
    html += '<div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button><button type="submit" class="btn btn-primary">' + (d.id ? 'Сохранить' : 'Создать') + '</button></div>';
    html += '</form>';

    openModal(title, html);
    if (d.image_path) {
        setTimeout(function() {
            const uploadedPath = document.getElementById('uploadedImagePath');
            const imagePreview = document.getElementById('imagePreview');
            if (uploadedPath) uploadedPath.value = d.image_path;
            if (imagePreview) {
                imagePreview.innerHTML = '<img src="' + d.image_path + '" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:8px;"><p style="font-size:12px;color:var(--text-muted);margin-top:8px;">Текущее изображение</p>';
            }
        }, 100);
    }
}

async function saveDevice(event, deviceId) {
    event.preventDefault();
    var formData = new FormData(event.target);
    var data = {};
    formData.forEach(function (value, key) { 
        if (value) data[key] = value; 
    });
    
    const uploadedPath = document.getElementById('uploadedImagePath')?.value;
    if (uploadedPath) {
        data.image_path = uploadedPath;
    }
    
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

// ============ BOARDS ============
async function loadBoards() {
    var content = document.getElementById('contentArea');
    if (!content) return;
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
        html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + S.boards.length + '</span><span class="stat-label">Всего плат</span></div></div>';
        html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + viCount + '</span><span class="stat-label">Осмотрено</span></div></div>';
        html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + diagCount + '</span><span class="stat-label">Диагностировано</span></div></div>';
        html += '<div class="stat-card"><div class="stat-info"><span class="stat-value">' + asmCount + '</span><span class="stat-label">В изделиях</span></div></div>';
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
            html += '<td><strong style="color:var(--primary);cursor:pointer" onclick="showBoardDetails(' + b.id + ')">' + escapeHtml(b.serial_number) + '</strong></td>';
            html += '<td><span class="badge badge-neutral">' + escapeHtml(b.board_type_name || '—') + '</span></td>';
            html += '<td><span class="badge ' + stageBadge(b.current_stage) + '">' + stageLabel(b.current_stage) + '</span></td>';
            html += '<td>' + escapeHtml(b.device_serial || '—') + '</td>';
            html += '<td>' + (b.visual_inspection_passed ? '<span class="badge badge-success">Пройден</span>' : '<span class="badge badge-neutral">—</span>') + '</td>';
            html += '<td>' + (b.diagnostics_passed ? '<span class="badge badge-success">Пройдена</span>' : '<span class="badge badge-neutral">—</span>') + '</td>';
            html += '</tr>';
        }

        html += '</tbody></div></div>';
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
        typeOpts += '<option value="' + t.id + '">' + escapeHtml(t.name) + ' (' + t.code + ')</option>';
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
                viHtml += '<div class="detail-row"><span class="detail-label">' + (r.inspection_date || '') + '</span><span class="detail-value">' + (r.result ? 'Пройден' : 'Не пройден') + ' ' + escapeHtml(r.comment || '') + '</span></div>';
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
        html += '<div class="detail-row"><span class="detail-label">Серийный номер</span><span class="detail-value">' + escapeHtml(b.serial_number) + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Тип</span><span class="detail-value">' + escapeHtml(b.board_type_name || '') + '</span></div>';
        html += '<div class="detail-row"><span class="detail-label">Стадия</span><span class="detail-value"><span class="badge ' + stageBadge(b.current_stage) + '">' + stageLabel(b.current_stage) + '</span></span></div>';
        html += '<div class="detail-row"><span class="detail-label">Устройство</span><span class="detail-value">' + escapeHtml(b.device_serial || 'Не привязана') + '</span></div>';
        html += '</div>';
        html += '<div class="detail-group"><div class="detail-group-title">Визуальный осмотр</div>' + viHtml + '</div>';
        html += '<div class="detail-group"><div class="detail-group-title">Диагностика</div>' + diagHtml + '</div>';
        html += '</div>';

        openModal('Плата: ' + b.serial_number, html);
    } catch (e) {
        showError(e.message);
    }
}

// ============ STANDS ============
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

// ============ СТЕНД ВИЗУАЛЬНОГО ОСМОТРА ============
function renderStandVisual() {
    loadAvailableBoardsForVisual().then(function(boards) {
        createDatalist('visual-boards-list', boards, 'serial_number', 'serial_number');
        
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="stand-form"><div class="section-card">
                <h3>Стенд визуального осмотра</h3>
                <p style="color:var(--text-secondary);margin-bottom:20px">Выберите или отсканируйте плату. Только новые платы.</p>
                <form onsubmit="submitVisualInspection(event)">
                    <div class="form-grid">
                        <div class="form-group full-width"><label class="form-label">Серийный номер платы *</label>
                        <input class="form-input" name="serial_number" list="visual-boards-list" required placeholder="Начните вводить или отсканируйте" autofocus autocomplete="off" onkeydown="handleScannerKey(event)"></div>
                        <div class="form-group full-width"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment" placeholder="Результаты..." onkeydown="handleScannerKey(event)"></textarea></div>
                    </div>
                    <div class="form-actions" style="justify-content:center;gap:16px">
                        <button type="submit" name="resultBtn" value="ok" class="btn btn-primary" style="background:var(--success)">ОК</button>
                        <button type="submit" name="resultBtn" value="fail" class="btn btn-danger">Брак</button>
                    </div>
                </form>
                <div id="standResult"></div>
            </div></div>
        `;
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
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4></div>';
        event.target.reset();
        toast(r.message, 'success');
        if (!isOk) {
            toast('Плата отправлена в ремонт', 'warning');
            loadRepairItems();
        }
        loadAvailableBoardsForVisual();
        renderStandVisual();
    } catch (e) {
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

// ============ СТЕНД ДИАГНОСТИКИ ============
function renderStandDiag() {
    loadAvailableBoardsForDiag().then(function(boards) {
        createDatalist('diag-boards-list', boards, 'serial_number', 'serial_number');
        
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="stand-form"><div class="section-card">
                <h3>Стенд диагностики</h3>
                <p style="color:var(--text-secondary);margin-bottom:20px">Плата должна пройти визуальный осмотр.</p>
                <form onsubmit="submitDiagnostics(event)">
                    <div class="form-grid">
                        <div class="form-group full-width"><label class="form-label">Серийный номер *</label>
                        <input class="form-input" name="serial_number" list="diag-boards-list" required placeholder="Начните вводить или отсканируйте" autofocus autocomplete="off" onkeydown="handleScannerKey(event)"></div>
                        <div class="form-group"><label class="form-label">IP-адрес</label><input class="form-input" name="ip_address" placeholder="192.168.1.xxx" onkeydown="handleScannerKey(event)"></div>
                        <div class="form-group"><label class="form-label">Стенд</label><input class="form-input" name="stand_name" placeholder="Стенд Д-1" onkeydown="handleScannerKey(event)"></div>
                    </div>
                    <div class="form-group full-width" style="margin-top:16px"><label class="form-label">Проверки</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item"><input type="checkbox" name="ports_ok" checked> Порты</label>
                            <label class="checkbox-item"><input type="checkbox" name="os_installed" checked> ОС</label>
                            <label class="checkbox-item"><input type="checkbox" name="disks_ok" checked> Диски</label>
                            <label class="checkbox-item"><input type="checkbox" name="memory_ok" checked> Память</label>
                        </div>
                    </div>
                    <div class="form-group full-width" style="margin-top:16px"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment" onkeydown="handleScannerKey(event)"></textarea></div>
                    <div class="form-actions" style="justify-content:center;gap:16px">
                        <button type="submit" name="resultBtn" value="ok" class="btn btn-primary" style="background:var(--success)">Пройдена</button>
                        <button type="submit" name="resultBtn" value="fail" class="btn btn-danger">Не пройдена</button>
                    </div>
                </form>
                <div id="standResult"></div>
            </div></div>
        `;
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
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4></div>';
        event.target.reset();
        toast(r.message, 'success');
        if (!isOk) {
            toast('Плата отправлена в ремонт', 'warning');
            loadRepairItems();
        }
        loadAvailableBoardsForDiag();
        renderStandDiag();
    } catch (e) {
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

// ============ СТЕНД СБОРКИ ============
function renderStandAssembly() {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    contentArea.innerHTML = `
        <div class="stand-form"><div class="section-card">
            <h3>Стенд сборки</h3>
            <p style="color:var(--text-secondary);margin-bottom:20px">Все платы должны пройти диагностику.</p>
            <form onsubmit="submitAssembly(event)">
                <div class="form-grid">
                    <div class="form-group full-width"><label class="form-label">Серийный номер изделия *</label><input class="form-input" name="device_serial_number" required placeholder="RS501175220XXX" onkeydown="handleScannerKey(event)"></div>
                    <div class="form-group full-width"><label class="form-label">Серийный номер корпуса *</label><input class="form-input" name="case_serial_number" required placeholder="CASE-RS-2024-XXX" onkeydown="handleScannerKey(event)"></div>
                    <div class="form-group"><label class="form-label">Тип</label><select class="form-select" name="device_type_id" onkeydown="handleScannerKey(event)"><option value="1">RS</option><option value="2">SA</option></select></div>
                </div>
                <div class="form-group full-width" style="margin-top:16px">
                    <label class="form-label">Серийные номера плат (по строкам) *</label>
                    <textarea class="form-textarea" name="board_serials" required placeholder="MB-RS-2024-010&#10;PB-RS-2024-010" style="min-height:120px" onkeydown="handleScannerKey(event)"></textarea>
                </div>
                <div class="form-actions" style="justify-content:center">
                    <button type="submit" class="btn btn-primary">Собрать</button>
                </div>
            </form>
            <div id="standResult"></div>
        </div></div>
    `;
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
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4><p>ID: ' + r.device_id + '</p></div>';
        event.target.reset();
        toast(r.message, 'success');
    } catch (e) {
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

// ============ СТЕНД ПСИ ============
function renderStandPSI() {
    loadAvailableDevicesForPSI().then(function(devices) {
        createDatalist('psi-devices-list', devices, 'product_serial_number', 'product_serial_number');
        
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="stand-form"><div class="section-card">
                <h3>Стенд ПСИ</h3>
                <p style="color:var(--text-secondary);margin-bottom:20px">Устройство должно пройти сборку.</p>
                <form onsubmit="submitPSI(event)">
                    <div class="form-grid">
                        <div class="form-group full-width"><label class="form-label">Серийный номер изделия *</label>
                        <input class="form-input" name="device_serial_number" list="psi-devices-list" required placeholder="Начните вводить" autofocus autocomplete="off" onkeydown="handleScannerKey(event)"></div>
                        <div class="form-group"><label class="form-label">Протокол *</label><input class="form-input" name="protocol_number" required placeholder="PSI-2024-XXX" onkeydown="handleScannerKey(event)"></div>
                        <div class="form-group"><label class="form-label">Прошивка *</label><input class="form-input" name="firmware_version" required placeholder="router_6.4" onkeydown="handleScannerKey(event)"></div>
                    </div>
                    <div class="form-group full-width" style="margin-top:16px"><label class="form-label">Проверки</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item"><input type="checkbox" name="ports_ok" checked> Порты</label>
                            <label class="checkbox-item"><input type="checkbox" name="os_installed" checked> ОС</label>
                            <label class="checkbox-item"><input type="checkbox" name="disks_ok" checked> Диски</label>
                            <label class="checkbox-item"><input type="checkbox" name="memory_ok" checked> Память</label>
                        </div>
                    </div>
                    <div class="form-group full-width" style="margin-top:16px"><label class="form-label">Комментарий</label><textarea class="form-textarea" name="comment" onkeydown="handleScannerKey(event)"></textarea></div>
                    <div class="form-actions" style="justify-content:center;gap:16px">
                        <button type="submit" name="resultBtn" value="ok" class="btn btn-primary" style="background:var(--success)">ПСИ пройден</button>
                        <button type="submit" name="resultBtn" value="fail" class="btn btn-danger">Не пройден</button>
                    </div>
                </form>
                <div id="standResult"></div>
            </div></div>
        `;
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
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result success"><h4>' + r.message + '</h4></div>';
        event.target.reset();
        toast(r.message, 'success');
        if (!isOk) {
            toast('Устройство отправлено в ремонт', 'warning');
            loadRepairItems();
        }
        loadAvailableDevicesForPSI();
        renderStandPSI();
    } catch (e) {
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = '<div class="stand-result error"><h4>' + e.message + '</h4></div>';
    }
}

// ============ СТЕНД УПАКОВКИ ============
function renderStandPackaging() {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    contentArea.innerHTML = `
        <div class="stand-form">
            <div class="section-card">
                <h3>Стенд упаковки</h3>
                <p style="color:var(--text-secondary);margin-bottom:20px">
                    Устройство должно пройти ПСИ. После упаковки наклейка скачается автоматически.
                </p>
                <form onsubmit="submitPackaging(event)">
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label class="form-label">Серийный номер изделия *</label>
                            <input class="form-input" name="device_serial_number" required autofocus 
                                   placeholder="Например: RS501175220002" onkeydown="handleScannerKey(event)">
                        </div>
                        <div class="form-group full-width">
                            <label class="form-label">Комментарий</label>
                            <textarea class="form-textarea" name="comment" rows="3" 
                                      placeholder="Дополнительная информация..." onkeydown="handleScannerKey(event)"></textarea>
                        </div>
                    </div>
                    <div class="form-actions" style="justify-content:center">
                        <button type="submit" class="btn btn-primary" style="min-width: 200px;">
                            Упаковать
                        </button>
                    </div>
                </form>
                <div id="standResult"></div>
            </div>
        </div>
    `;
}

async function submitPackaging(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Упаковка...';
    submitBtn.disabled = true;
    
    try {
        var r = await api('/api/stands/packaging', {
            method: 'POST',
            body: JSON.stringify({
                device_serial_number: fd.get('device_serial_number'),
                comment: fd.get('comment')
            })
        });
        
        var deviceSn = fd.get('device_serial_number');
        var dateStr = new Date().toLocaleString('ru');
        
        var resultHtml = `
            <div class="stand-result success">
                <h4>${r.message}</h4>
                <p style="margin-top:12px">Серийный номер: <strong>${escapeHtml(deviceSn)}</strong></p>
                <p>Дата упаковки: ${dateStr}</p>
        `;
        
        if (r.sticker_url) {
            resultHtml += `
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-light);">
                    <p style="color: var(--success); margin-bottom: 8px;">✅ Наклейка сгенерирована и автоматически скачивается...</p>
                </div>
            `;
            
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = r.sticker_url;
                link.download = `sticker_${deviceSn}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast('Наклейка скачана!', 'success');
            }, 500);
        } else {
            resultHtml += `
                <div style="margin-top: 16px; padding: 12px; background: var(--primary-light); border-radius: var(--radius-sm);">
                    <p>⚠️ Наклейка не сгенерирована. Проверьте настройки сервера.</p>
                    <p style="font-size: 12px; margin-top: 8px;">Убедитесь, что установлены пакеты: pdfkit, qrcode</p>
                    <p style="font-size: 12px;">И что в папке проекта есть файл: Roboto-Regular.ttf</p>
                </div>
            `;
        }
        
        resultHtml += `</div>`;
        
        const standResult = document.getElementById('standResult');
        if (standResult) standResult.innerHTML = resultHtml;
        event.target.reset();
        toast(r.message, 'success');
        
        if (typeof loadStatistics === 'function') {
            setTimeout(() => loadStatistics(), 1000);
        }
        
    } catch (e) {
        const standResult = document.getElementById('standResult');
        if (standResult) {
            standResult.innerHTML = `
                <div class="stand-result error">
                    <h4>Ошибка упаковки</h4>
                    <p>${e.message}</p>
                </div>
            `;
        }
        toast(e.message, 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ============ REPAIR ============
async function loadRepairItems() {
    var content = document.getElementById('contentArea');
    if (!content) return;
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
                html += '<span class="repair-sn">' + escapeHtml(b.serial_number || '—') + '</span>';
                html += '<span class="repair-stage failed">' + stageLabel(b.current_stage) + '</span>';
                html += '</div>';
                html += '<div class="repair-details">Тип платы: ' + escapeHtml(b.board_type_name || '—') + '</div>';
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
                html += '<span class="repair-sn">' + escapeHtml(d.product_serial_number || '—') + '</span>';
                html += '<span class="repair-stage failed">' + stageLabel(d.current_stage) + '</span>';
                html += '</div>';
                html += '<div class="repair-details">Тип: ' + escapeHtml(d.device_type_name || '—') + '</div>';
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

// ============ TYPES ============
async function loadDeviceTypes() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка типов...</p></div>';

    try {
        const types = await api('/api/device-types');
        S.deviceTypes = types || [];
        const isAdmin = S.user && S.user.role === 'admin';

        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info"><span class="stat-value">${types.length}</span><span class="stat-label">Типов изделий</span></div>
                </div>
            </div>

            <div class="action-panel">
                <div class="search-input-wrap" style="flex:1;max-width:400px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="search-input" placeholder="Поиск по коду или названию..." oninput="filterTypes(this.value)" id="typeSearch">
                </div>
                ${isAdmin ? '<button class="btn btn-primary" onclick="showAddType()">+ Добавить тип</button>' : ''}
            </div>

            <div class="types-grid" id="typesGrid">
                ${types.map(t => `
                    <div class="type-card" data-code="${escapeHtml(t.code)}" data-name="${escapeHtml(t.name)}">
                        <div class="type-code-display"><h3>${escapeHtml(t.code)}</h3></div>
                        <div class="type-info"><p>${escapeHtml(t.name)}</p></div>
                        ${isAdmin ? `<div class="type-actions"><button class="btn-icon danger" onclick="deleteType(${t.id})" title="Удалить">✕</button></div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        if (!types.length) {
            html = `
                <div class="places-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    <h3>Типы изделий не найдены</h3>
                    <p>Добавьте первый тип устройства, чтобы начать работу</p>
                    ${isAdmin ? '<button class="btn btn-primary" onclick="showAddType()">+ Создать тип</button>' : ''}
                </div>
            `;
        }

        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = `<div class="empty-state"><p>Ошибка загрузки: ${e.message}</p><button class="btn btn-primary" onclick="loadDeviceTypes()">Повторить</button></div>`;
    }
}

function filterTypes(val) {
    const search = (val || '').toLowerCase();
    document.querySelectorAll('.type-card').forEach(card => {
        const code = card.getAttribute('data-code') || '';
        const name = card.getAttribute('data-name') || '';
        const match = code.toLowerCase().includes(search) || name.toLowerCase().includes(search);
        card.style.display = match ? '' : 'none';
    });
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

// ============ МЕСТА ПРОИЗВОДСТВА ============
async function loadProductionPlaces() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Загрузка мест...</p></div>';

    try {
        const places = await api('/api/production-places');
        let devices = [];
        try { 
            devices = await api('/api/devices') || []; 
        } catch(e) { 
            console.warn('Не удалось загрузить устройства для статистики:', e); 
        }
        
        S.productionPlaces = places || [];
        
        const placeStats = {};
        devices.forEach(d => {
            if (d.place_of_production_id) {
                placeStats[d.place_of_production_id] = (placeStats[d.place_of_production_id] || 0) + 1;
            }
        });

        const isAdmin = S.user && S.user.role === 'admin';
        
        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <span class="stat-value">${places.length}</span>
                        <span class="stat-label">Всего мест</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <span class="stat-value">${Object.keys(placeStats).length}</span>
                        <span class="stat-label">Активных</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <span class="stat-value">${devices.length}</span>
                        <span class="stat-label">Всего устройств</span>
                    </div>
                </div>
            </div>
            
            <div class="action-panel">
                <div class="search-input-wrap" style="flex:1;max-width:400px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" class="search-input" placeholder="Поиск по названию или коду..." 
                           oninput="filterPlaces(this.value)" id="placeSearch" autocomplete="off">
                </div>
                ${isAdmin ? '<button class="btn btn-primary" onclick="showAddPlace()">+ Добавить место</button>' : ''}
            </div>
            
            <div class="places-grid" id="placesGrid">
                ${renderPlaceCards(places, placeStats, isAdmin)}
            </div>
        `;

        if (!places.length) {
            html = `
                <div class="places-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <h3>Места производства не найдены</h3>
                    <p>Добавьте первое производственное место, чтобы начать работу</p>
                    ${isAdmin ? '<button class="btn btn-primary" onclick="showAddPlace()">+ Создать место</button>' : ''}
                </div>
            `;
        }
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = `
            <div class="empty-state">
                <p>Ошибка загрузки: ${e.message}</p>
                <button class="btn btn-primary" onclick="loadProductionPlaces()">Повторить</button>
            </div>
        `;
    }
}

function renderPlaceCards(places, stats, isAdmin) {
    if (!places.length) return '';
    
    return places.map(p => {
        const count = stats[p.id] || 0;
        const isActive = count > 0;
        
        return `
            <div class="place-card" data-id="${p.id}" data-name="${escapeHtml(p.name)}" data-code="${escapeHtml(p.code || '')}">
                <div class="place-header">
                    <div class="place-icon-wrap">
                        ${getPlaceIcon(p.name)}
                    </div>
                    <div class="place-info">
                        <span class="place-code">${escapeHtml(p.code || '—')}</span>
                        <span class="place-name">${escapeHtml(p.name || 'Без названия')}</span>
                    </div>
                    <div class="place-status-dot ${isActive ? 'active' : ''}" 
                         title="${isActive ? 'Активно' : 'Не активно'}">
                    </div>
                </div>
                
                <div class="place-body">
                    <div class="stat-box">
                        <span class="stat-value">${count}</span>
                        <span class="stat-label">Устройств</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${isActive ? '100%' : '0%'}</span>
                        <span class="stat-label">Загрузка</span>
                    </div>
                </div>
                
                ${isAdmin ? `
                <div class="place-footer">
                    <button class="btn-icon" onclick="showEditPlace(${p.id})" title="Редактировать">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon danger" onclick="deletePlace(${p.id})" title="Удалить">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function filterPlaces(val) {
    const search = (val || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.place-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const code = (card.getAttribute('data-code') || '').toLowerCase();
        const match = name.includes(search) || code.includes(search);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
    });
    
    const grid = document.getElementById('placesGrid');
    const existingMsg = document.getElementById('noSearchResults');
    
    if (visibleCount === 0 && cards.length > 0) {
        if (!existingMsg) {
            const msg = document.createElement('div');
            msg.id = 'noSearchResults';
            msg.className = 'empty-state';
            msg.style.gridColumn = '1/-1';
            msg.style.padding = '40px';
            msg.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p style="margin-top:12px">Ничего не найдено для "${escapeHtml(search)}"</p>
            `;
            if (grid) grid.appendChild(msg);
        }
    } else if (existingMsg) {
        existingMsg.remove();
    }
}

function showAddPlace() {
    openModal('Новое место производства', `
        <form onsubmit="savePlace(event)" style="padding:20px;">
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label">Код *</label>
                <input class="form-input" name="code" required placeholder="Например: 01" 
                       pattern="[0-9]{2}" maxlength="2" style="text-transform:uppercase">
                <small style="color:var(--text-muted);margin-top:4px;display:block;">2 цифры</small>
            </div>
            <div class="form-group" style="margin-bottom:20px;">
                <label class="form-label">Название *</label>
                <input class="form-input" name="name" required placeholder="Полное наименование">
            </div>
            <div class="form-actions" style="margin-top:0;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">Создать</button>
            </div>
        </form>
    `);
}

function showEditPlace(id) {
    const place = S.productionPlaces.find(p => p.id === id);
    if (!place) return;
    
    openModal('Редактировать место', `
        <form onsubmit="savePlace(event, ${id})" style="padding:20px;">
            <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label">Код *</label>
                <input class="form-input" name="code" required value="${escapeHtml(place.code || '')}" 
                       pattern="[0-9]{2}" maxlength="2" style="text-transform:uppercase">
            </div>
            <div class="form-group" style="margin-bottom:20px;">
                <label class="form-label">Название *</label>
                <input class="form-input" name="name" required value="${escapeHtml(place.name)}">
            </div>
            <div class="form-actions" style="margin-top:0;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
    `);
}

async function savePlace(e, id = null) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { 
        name: fd.get('name').trim(), 
        code: fd.get('code').trim().toUpperCase()
    };
    
    if (!data.name || !data.code) {
        showError('Заполните все поля');
        return;
    }
    
    if (!/^\d{2}$/.test(data.code)) {
        showError('Код должен состоять из 2 цифр');
        return;
    }
    
    try {
        if (id) {
            await api('/api/production-places/' + id, { method: 'PUT', body: JSON.stringify(data) });
            toast('Место обновлено', 'success');
        } else {
            await api('/api/production-places', { method: 'POST', body: JSON.stringify(data) });
            toast('Место добавлено', 'success');
        }
        closeModal();
        loadProductionPlaces();
    } catch (err) { 
        showError(err.message); 
    }
}

async function deletePlace(id) {
    const place = S.productionPlaces.find(p => p.id === id);
    if (!place) return;
    
    if (!confirm(`Удалить место "${place.name}"?\nЭто действие нельзя отменить.`)) return;
    
    try { 
        await api('/api/production-places/' + id, { method: 'DELETE' }); 
        toast('Место удалено', 'success'); 
        loadProductionPlaces(); 
    } catch (e) { 
        showError(e.message); 
    }
}

// ============ SERIAL STRUCTURE ============
function renderSerialStructure() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    
    const iconHash = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
    const iconCalendar = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    const iconLayers = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`;
    const iconMap = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>`;

    content.innerHTML = `
        <div class="serial-header">
            <h3>Формат серийного номера</h3>
            <div class="serial-example-badge">RS501175220001</div>
        </div>

        <div class="serial-structure-visual">
            <div class="serial-segment">
                <div class="serial-segment-box">RS</div>
                <div class="serial-segment-label">Тип</div>
            </div>
            <div class="serial-segment">
                <div class="serial-segment-box">5</div>
                <div class="serial-segment-label">Этап</div>
            </div>
            <div class="serial-segment">
                <div class="serial-segment-box">01</div>
                <div class="serial-segment-label">Место</div>
            </div>
            <div class="serial-segment">
                <div class="serial-segment-box">17</div>
                <div class="serial-segment-label">Код</div>
            </div>
            <div class="serial-segment">
                <div class="serial-segment-box">52</div>
                <div class="serial-segment-label">Год</div>
            </div>
            <div class="serial-segment">
                <div class="serial-segment-box">20</div>
                <div class="serial-segment-label">Месяц</div>
            </div>
            <div class="serial-segment">
                <div class="serial-segment-box">001</div>
                <div class="serial-segment-label">Номер</div>
            </div>
        </div>

        <div class="serial-info-grid">
            <div class="serial-info-card">
                <h4>${iconHash} Тип устройства</h4>
                <div class="serial-info-row">
                    <span class="info-code">RS</span>
                    <span class="info-desc">Маршрутизатор</span>
                </div>
                <div class="serial-info-row">
                    <span class="info-code">SA</span>
                    <span class="info-desc">Коммутатор</span>
                </div>
            </div>

            <div class="serial-info-card">
                <h4>${iconLayers} Этап производства</h4>
                <div class="serial-info-row">
                    <span class="info-code">1-2</span>
                    <span class="info-desc">Опытный образец</span>
                </div>
                <div class="serial-info-row">
                    <span class="info-code">3-4</span>
                    <span class="info-desc">Отладка</span>
                </div>
                <div class="serial-info-row">
                    <span class="info-code">5</span>
                    <span class="info-desc">Серийное производство</span>
                </div>
            </div>

            <div class="serial-info-card">
                <h4>${iconMap} Место производства</h4>
                <div class="serial-info-row">
                    <span class="info-code">01</span>
                    <span class="info-desc">АО «НПП «Исток»</span>
                </div>
                <div class="serial-info-row">
                    <span class="info-code">02</span>
                    <span class="info-desc">Другой филиал</span>
                </div>
            </div>

            <div class="serial-info-card">
                <h4>${iconCalendar} Дата выпуска</h4>
                <div class="serial-info-row">
                    <span class="info-code">Год</span>
                    <span class="info-desc">Неделя производства (52)</span>
                </div>
                <div class="serial-info-row">
                    <span class="info-code">Месяц</span>
                    <span class="info-desc">Месяц (20)</span>
                </div>
            </div>
        </div>
    `;
}

// ============ STATISTICS (УЛУЧШЕННАЯ) ============
async function loadStatistics() {
    const content = document.getElementById('contentArea');
    if (!content) return;
    
    content.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Загрузка статистики...</p>
        </div>
    `;

    try {
        const s = await api('/api/statistics');
        if (!s) return;

        const stageLabelsMap = { 
            new: 'Новое', 
            visual_ok: 'Осмотр', 
            diagnostics_ok: 'Диагностика', 
            assembled: 'Собрано', 
            psi_ok: 'ПСИ', 
            packaged: 'Упаковано' 
        };

        const maxByType = s.byType?.length ? Math.max(...s.byType.map(t => t.count)) : 1;
        const maxByStage = s.byStage?.length ? Math.max(...s.byStage.map(s => s.count)) : 1;
        const maxByPlace = s.byPlace?.length ? Math.max(...s.byPlace.map(p => p.count)) : 1;

        let html = `
            <div class="stats-container">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                        </div>
                        <div class="metric-info">
                            <span class="metric-value">${s.totalDevices || 0}</span>
                            <span class="metric-label">Устройств</span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="4" y="4" width="16" height="16" rx="2"/>
                                <path d="M9 9h6v6H9z"/>
                            </svg>
                        </div>
                        <div class="metric-info">
                            <span class="metric-value">${s.totalBoards || 0}</span>
                            <span class="metric-label">Плат</span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div class="metric-info">
                            <span class="metric-value">${s.totalEmployees || 0}</span>
                            <span class="metric-label">Сотрудников</span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                        </div>
                        <div class="metric-info">
                            <span class="metric-value">${s.recentDevices?.length || 0}</span>
                            <span class="metric-label">Последние операции</span>
                        </div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            По типам устройств
                        </h3>
                        <div class="bar-chart">
                            ${s.byType?.map(t => `
                                <div class="bar-item">
                                    <span class="bar-label">${t.name || '—'}</span>
                                    <div class="bar-track">
                                        <div class="bar-fill" style="width: ${Math.round((t.count / maxByType) * 100)}%"></div>
                                    </div>
                                    <span class="bar-value">${t.count}</span>
                                </div>
                            `).join('') || '<p style="color:var(--text-muted);text-align:center;padding:20px;">Нет данных</p>'}
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                            По стадиям производства
                        </h3>
                        <div class="bar-chart">
                            ${s.byStage?.map(st => `
                                <div class="bar-item">
                                    <span class="bar-label">${stageLabelsMap[st.current_stage] || st.current_stage || '—'}</span>
                                    <div class="bar-track">
                                        <div class="bar-fill" style="width: ${Math.round((st.count / maxByStage) * 100)}%"></div>
                                    </div>
                                    <span class="bar-value">${st.count}</span>
                                </div>
                            `).join('') || '<p style="color:var(--text-muted);text-align:center;padding:20px;">Нет данных</p>'}
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            По местам производства
                        </h3>
                        <div class="bar-chart">
                            ${s.byPlace?.map(p => `
                                <div class="bar-item">
                                    <span class="bar-label">${p.name || '—'}</span>
                                    <div class="bar-track">
                                        <div class="bar-fill" style="width: ${Math.round((p.count / maxByPlace) * 100)}%"></div>
                                    </div>
                                    <span class="bar-value">${p.count}</span>
                                </div>
                            `).join('') || '<p style="color:var(--text-muted);text-align:center;padding:20px;">Нет данных</p>'}
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Последние операции
                        </h3>
                        ${s.recentDevices?.length ? `
                            <table class="recent-table">
                                <thead>
                                    <tr>
                                        <th>Серийный номер</th>
                                        <th>Тип</th>
                                        <th>Стадия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${s.recentDevices.map(d => `
                                        <tr>
                                            <td>${escapeHtml(d.product_serial_number) || '—'}</td>
                                            <td>${escapeHtml(d.dtn) || '—'}</td>
                                            <td>${stageLabelsMap[d.current_stage] || d.current_stage || '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="color:var(--text-muted);text-align:center;padding:20px;">Нет данных</p>'}
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = html;

        setTimeout(() => {
            document.querySelectorAll('.bar-fill').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 100);

    } catch (e) {
        content.innerHTML = `
            <div class="empty-state">
                <p>Ошибка загрузки статистики: ${e.message}</p>
                <button class="btn btn-primary" onclick="loadStatistics()">Повторить</button>
            </div>
        `;
    }
}

// ============ EMPLOYEES ============
async function loadEmployees() {
    if (!S.user || S.user.role !== 'admin') {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) contentArea.innerHTML = '<div class="empty-state"><p>Недостаточно прав</p></div>';
        return;
    }

    var content = document.getElementById('contentArea');
    if (!content) return;
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
            html += '<td><strong>' + escapeHtml(e.last_name + ' ' + e.first_name + ' ' + (e.middle_name || '')) + '</strong></td>';
            html += '<td>' + escapeHtml(e.position) + '</td>';
            html += '<td><code style="background:var(--bg-input);padding:2px 8px;border-radius:4px">' + escapeHtml(e.username) + '</code></td>';
            html += '<td><span class="badge ' + (roleBadges[e.role] || 'badge-neutral') + '">' + (roleLabels[e.role] || e.role) + '</span></td>';
            html += '<td><div class="cell-actions">';
            html += '<button class="btn-icon" onclick="showEditEmp(' + e.id + ')">✎</button>';
            html += '<button class="btn-icon danger" onclick="deleteEmp(' + e.id + ')">✕</button>';
            html += '</div></td></tr>';
        }

        html += '</tbody></div></div>';
        content.innerHTML = html;
    } catch (e) {
        content.innerHTML = '<div class="empty-state"><p>Ошибка</p></div>';
    }
}

function showAddEmp(data) {
    var e = data || {};
    var title = e.id ? 'Редактировать' : 'Новый сотрудник';

    var html = '<form onsubmit="saveEmp(event,' + (e.id || 'null') + ')"><div class="form-grid">';
    html += '<div class="form-group"><label class="form-label">Фамилия *</label><input class="form-input" name="last_name" value="' + escapeHtml(e.last_name || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Имя *</label><input class="form-input" name="first_name" value="' + escapeHtml(e.first_name || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Отчество</label><input class="form-input" name="middle_name" value="' + escapeHtml(e.middle_name || '') + '"></div>';
    html += '<div class="form-group"><label class="form-label">Должность *</label><input class="form-input" name="position" value="' + escapeHtml(e.position || '') + '" required></div>';
    html += '<div class="form-group"><label class="form-label">Логин *</label><input class="form-input" name="username" value="' + escapeHtml(e.username || '') + '" required></div>';
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

    var fullName = u.last_name + ' ' + u.first_name;
    if (u.middle_name) fullName += ' ' + u.middle_name;
    
    var registeredAt = localStorage.getItem('user_registered');
    if (!registeredAt) {
        registeredAt = new Date().toLocaleDateString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        localStorage.setItem('user_registered', registeredAt);
    }
    
    var lastLogin = localStorage.getItem('last_login');
    if (!lastLogin) {
        lastLogin = new Date().toLocaleString('ru');
        localStorage.setItem('last_login', lastLogin);
    }

    var html = `
        <div class="profile-card section-card">
            <div class="profile-header">
                <div class="profile-avatar-lg">${escapeHtml(initials.toUpperCase())}</div>
                <div class="profile-name">${escapeHtml(fullName)}</div>
                <div class="profile-position">${escapeHtml(u.position || '—')}</div>
                <span class="badge ${roleBadges[u.role] || ''}" style="margin-top:8px">${roleMap[u.role] || u.role}</span>
            </div>
            
            <div style="padding: 0 24px 24px">
                <div class="detail-group" style="margin-bottom: 20px">
                    <div class="detail-group-title">Учётные данные</div>
                    <div class="detail-row">
                        <span class="detail-label">Логин</span>
                        <span class="detail-value">${escapeHtml(u.username)}</span>
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
                        <span class="detail-value">${escapeHtml(u.last_name || '—')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Имя</span>
                        <span class="detail-value">${escapeHtml(u.first_name || '—')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Отчество</span>
                        <span class="detail-value">${escapeHtml(u.middle_name || '—')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Должность</span>
                        <span class="detail-value">${escapeHtml(u.position || '—')}</span>
                    </div>
                </div>
                
                <div class="detail-group" style="margin-bottom: 20px">
                    <div class="detail-group-title">Активность</div>
                    <div class="detail-row">
                        <span class="detail-label">Последний вход</span>
                        <span class="detail-value" id="lastLoginValue">${escapeHtml(lastLogin)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Дата регистрации</span>
                        <span class="detail-value">${escapeHtml(registeredAt)}</span>
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

    const contentArea = document.getElementById('contentArea');
    if (contentArea) contentArea.innerHTML = html;
    startSessionTimer();
}

function startSessionTimer() {
    if (!window.sessionStartTime) {
        window.sessionStartTime = new Date();
    }
    
    var sessionEl = document.getElementById('sessionTime');
    if (!sessionEl) return;
    
    function updateTimer() {
        if (!window.sessionStartTime) return;
        var now = new Date();
        var diff = Math.floor((now - window.sessionStartTime) / 1000);
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
    if (window.sessionInterval) clearInterval(window.sessionInterval);
    window.sessionInterval = setInterval(updateTimer, 1000);
}

function showChangePassword() {
    openModal('Смена пароля', `
        <form onsubmit="changePassword(event)">
            <div class="form-grid">
                <div class="form-group full-width">
                    <label class="form-label">Текущий пароль *</label>
                    <input type="password" class="form-input" name="old_password" required>
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Новый пароль *</label>
                    <input type="password" class="form-input" name="new_password" required minlength="3">
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Подтверждение пароля *</label>
                    <input type="password" class="form-input" name="confirm_password" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                <button type="submit" class="btn btn-primary">Сменить пароль</button>
            </div>
        </form>
    `);
}

async function changePassword(event) {
    event.preventDefault();
    var fd = new FormData(event.target);
    var oldPass = fd.get('old_password');
    var newPass = fd.get('new_password');
    var confirmPass = fd.get('confirm_password');
    
    if (newPass !== confirmPass) {
        showError('Новый пароль и подтверждение не совпадают');
        return;
    }
    
    if (newPass.length < 3) {
        showError('Пароль должен содержать минимум 3 символа');
        return;
    }
    
    try {
        var check = await api('/api/check-password', {
            method: 'POST',
            body: JSON.stringify({ user_id: S.user.id, password: oldPass })
        });
        
        if (!check.success) {
            showError('Неверный текущий пароль');
            return;
        }
        
        await api('/api/change-password', {
            method: 'POST',
            body: JSON.stringify({ user_id: S.user.id, new_password: newPass })
        });
        
        toast('Пароль успешно изменён', 'success');
        closeModal();
    } catch (e) {
        showError(e.message);
    }
}
