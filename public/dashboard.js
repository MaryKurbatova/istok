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
    macs: [],
    deviceTypeMap: {} // Для маппинга device_id -> тип устройства
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📢 dashboard.js загружен');
    
    // Загрузка темы
    if (AppState.currentTheme === 'dark') {
        document.body.classList.add('theme-dark');
    }
    
    // Загружаем справочные данные
    await loadReferenceData();
    
    // Добавляем стили для модальных окон
    addModalStyles();
});

// ===== ЗАГРУЗКА СПРАВОЧНЫХ ДАННЫХ =====
async function loadReferenceData() {
    console.log('📚 Загрузка справочных данных...');
    try {
        const [types, months, years, stages, locations, places] = await Promise.all([
            fetch('/api/device-types').then(r => r.ok ? r.json() : []),
            fetch('/api/production-months').then(r => r.ok ? r.json() : []),
            fetch('/api/production-years').then(r => r.ok ? r.json() : []),
            fetch('/api/production-stages').then(r => r.ok ? r.json() : []),
            fetch('/api/locations').then(r => r.ok ? r.json() : []),
            fetch('/api/production-places').then(r => r.ok ? r.json() : [])
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

// ===== СТИЛИ ДЛЯ МОДАЛЬНЫХ ОКОН =====
function addModalStyles() {
    // Стили уже есть в dashboard.css
}

// ===== ФУНКЦИЯ ДЛЯ ОПРЕДЕЛЕНИЯ ИЗОБРАЖЕНИЯ ПО МОДЕЛИ =====
function getDeviceImage(deviceType) {
    if (!deviceType) return '/images/default.png';
    
    const type = deviceType.toLowerCase();
    
    if (type.includes('isn41508t3-m-ac')) {
        return '/images/ISN41508T3-M-AC.png';
    } else if (type.includes('isn41508t3-m')) {
        return '/images/ISN41508T3-M.png';
    } else if (type.includes('isn41508t3')) {
        return '/images/ISN41508T3.png';
    } else if (type.includes('isn41508t4')) {
        return '/images/ISN41508T4.png';
    } else if (type.includes('isn42124t5c4')) {
        return '/images/ISN41508T3.png'; // Заглушка для коммутаторов
    } else if (type.includes('isn42124t5p5')) {
        return '/images/ISN41508T3-M.png'; // Заглушка для коммутаторов
    } else if (type.includes('isn42124x5')) {
        return '/images/ISN41508T4.png'; // Заглушка для коммутаторов
    }
    
    return '/images/default.png';
}

// ===== ФУНКЦИИ ДЛЯ УСТРОЙСТВ =====
async function loadDevices() {
    console.log('📱 loadDevices вызвана');
    try {
        const response = await fetch('/api/devices');
        if (response.ok) {
            AppState.devices = await response.json();
            AppState.filteredDevices = [...AppState.devices];
            console.log('✅ Устройства загружены:', AppState.devices.length);
            renderDevicesTable();
        } else {
            console.error('❌ Ошибка загрузки устройств:', response.status);
            showNotification('Ошибка загрузки устройств', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки устройств:', error);
        showNotification('Ошибка загрузки устройств', 'error');
    }
}

function renderDevicesTable() {
    const container = document.getElementById('devices-list');
    if (!container) {
        console.error('❌ Элемент devices-list не найден');
        return;
    }
    
    if (AppState.filteredDevices.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет устройств</div>';
        return;
    }
    
    let html = '<div class="table-container"><table class="data-table">';
    html += `
        <thead>
            <tr>
                <th>Изображение</th>
                <th>Серийный номер</th>
                <th>Тип</th>
                <th>Модель</th>
                <th>Версия ОС</th>
                <th>Дата производства</th>
                <th>Статус</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    AppState.filteredDevices.forEach(device => {
        const statusClass = device.diag ? 'success' : 'danger';
        const statusText = device.diag ? 'Готов' : 'Проблема';
        const imagePath = getDeviceImage(device.type);
        
        html += `
            <tr>
                <td>
                    <img src="${imagePath}" 
                         alt="${device.type || 'Устройство'}" 
                         style="width: 60px; height: 60px; object-fit: contain; border-radius: 4px; background: var(--bg-soft); padding: 4px;"
                         onerror="this.src='/images/default.png'">
                </td>
                <td><strong>${device.product_serial_number || '—'}</strong></td>
                <td>${device.device_type_name || '—'}</td>
                <td>${device.type || '—'}</td>
                <td>${device.version_os || '—'}</td>
                <td>${device.manufactures_date || '—'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="table-actions">
                    <button class="edit-btn" onclick="showDeviceDetails(${device.id})">👁️</button>
                    <button class="edit-btn" onclick="editDevice(${device.id})">✎</button>
                    <button class="delete-btn" onclick="deleteDevice(${device.id})">✕</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log('✅ Таблица устройств отрендерена');
}

function searchDevices() {
    const searchTerm = document.getElementById('deviceSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('deviceTypeFilter')?.value || '';
    
    AppState.filteredDevices = AppState.devices.filter(device => {
        const matchesSearch = searchTerm === '' || 
            (device.product_serial_number && device.product_serial_number.toLowerCase().includes(searchTerm)) ||
            (device.type && device.type.toLowerCase().includes(searchTerm)) ||
            (device.device_type_name && device.device_type_name.toLowerCase().includes(searchTerm));
        
        const matchesType = typeFilter === '' || 
            (device.device_type_id && device.device_type_id.toString() === typeFilter);
        
        return matchesSearch && matchesType;
    });
    
    renderDevicesTable();
}

function filterDevicesByType() {
    searchDevices();
}

function updateDeviceTypeFilter() {
    const filterSelect = document.getElementById('deviceTypeFilter');
    if (!filterSelect) return;
    
    let options = '<option value="">Все типы</option>';
    AppState.deviceTypes.forEach(type => {
        options += `<option value="${type.id}">${type.name}</option>`;
    });
    filterSelect.innerHTML = options;
}

async function showDeviceDetails(id) {
    const device = AppState.devices.find(d => d.id === id);
    if (!device) return;
    
    // Загружаем комплектующие для этого устройства
    let components = [];
    try {
        const response = await fetch(`/api/components/device/${id}`);
        if (response.ok) {
            components = await response.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки комплектующих:', error);
    }
    
    const imagePath = getDeviceImage(device.type);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Детали устройства</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 1.5rem;">
                    <img src="${imagePath}" 
                         alt="${device.type || 'Устройство'}" 
                         style="width: 120px; height: 120px; object-fit: contain; background: var(--bg-soft); padding: 8px; border-radius: 8px;"
                         onerror="this.src='/images/default.png'">
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 0.5rem; color: var(--primary);">${device.product_serial_number || 'Без номера'}</h2>
                        <p style="margin: 0; color: var(--text-secondary);">${device.type || ''}</p>
                    </div>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Серийный номер:</span>
                    <span class="info-value">${device.product_serial_number || 'Не указан'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Тип:</span>
                    <span class="info-value">${device.device_type_name || 'Не указан'} (${device.device_type_code || ''})</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Модель:</span>
                    <span class="info-value">${device.type || 'Не указана'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Версия ОС:</span>
                    <span class="info-value">${device.version_os || 'Не указана'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Дата производства:</span>
                    <span class="info-value">${device.manufactures_date || 'Не указана'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Статус:</span>
                    <span class="info-value"><span class="status-badge ${device.diag ? 'success' : 'danger'}">${device.diag ? 'Готов' : 'Проблема'}</span></span>
                </div>
                
                <h4 style="margin-top: 1.5rem; margin-bottom: 1rem;">Комплектующие</h4>
                ${components.length > 0 ? `
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${components.map(c => `
                            <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                                <div><strong>${c.type}:</strong> ${c.name}</div>
                                ${c.author ? `<div><small>Проверил: ${c.author}</small></div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="empty-state">Нет комплектующих</p>'}
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Закрыть</button>
                <button class="btn-save" onclick="editDevice(${device.id}); closeModal(this);">Редактировать</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function addDevice() {
    await loadReferenceData();
    
    // Получаем сегодняшнюю дату в формате YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Добавить устройство</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="form-group">
                    <label>Тип устройства *</label>
                    <select id="modal-device-type" required>
                        <option value="">Выберите тип</option>
                        ${AppState.deviceTypes.map(t => `<option value="${t.id}">${t.name} (${t.code})</option>`).join('')}
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
                        ${AppState.productionPlaces.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('')}
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
                    <label>Тип устройства</label>
                    <select id="modal-device-type">
                        <option value="">Выберите тип</option>
                        ${AppState.deviceTypes.map(t => `<option value="${t.id}" ${t.id === device.device_type_id ? 'selected' : ''}>${t.name} (${t.code})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Серийный номер</label>
                    <input type="text" id="modal-serial-number" value="${device.product_serial_number || ''}">
                </div>
                <div class="form-group">
                    <label>Модель/Тип</label>
                    <input type="text" id="modal-type" value="${device.type || ''}">
                </div>
                <div class="form-group">
                    <label>Версия ОС</label>
                    <input type="text" id="modal-version-os" value="${device.version_os || ''}">
                </div>
                <div class="form-group">
                    <label>Место производства</label>
                    <select id="modal-production-place">
                        <option value="">Не выбрано</option>
                        ${AppState.productionPlaces.map(p => `<option value="${p.id}" ${p.id === device.place_of_production_id ? 'selected' : ''}>${p.name} (${p.code})</option>`).join('')}
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
}

async function saveDevice() {
    const deviceData = {
        device_type_id: document.getElementById('modal-device-type')?.value || null,
        product_serial_number: document.getElementById('modal-serial-number')?.value,
        type: document.getElementById('modal-type')?.value,
        version_os: document.getElementById('modal-version-os')?.value,
        place_of_production_id: document.getElementById('modal-production-place')?.value || null,
        manufactures_date: document.getElementById('modal-manufactures-date')?.value,
        diag: document.getElementById('modal-diag')?.checked
    };
    
    if (!deviceData.product_serial_number) {
        showNotification('Введите серийный номер', 'warning');
        return;
    }
    
    if (!deviceData.device_type_id) {
        showNotification('Выберите тип устройства', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deviceData)
        });
        
        if (response.ok) {
            showNotification('✅ Устройство добавлено', 'success');
            closeModal(document.querySelector('.modal-close'));
            await loadDevices();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка при добавлении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

async function updateDevice(id) {
    const deviceData = {
        device_type_id: document.getElementById('modal-device-type')?.value || null,
        product_serial_number: document.getElementById('modal-serial-number')?.value,
        type: document.getElementById('modal-type')?.value,
        version_os: document.getElementById('modal-version-os')?.value,
        place_of_production_id: document.getElementById('modal-production-place')?.value || null,
        manufactures_date: document.getElementById('modal-manufactures-date')?.value,
        diag: document.getElementById('modal-diag')?.checked
    };
    
    if (!deviceData.product_serial_number) {
        showNotification('Введите серийный номер', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/devices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch(`/api/devices/${id}`, {
            method: 'DELETE'
        });
        
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

// ===== ФУНКЦИИ ДЛЯ ТИПОВ ИЗДЕЛИЙ =====
async function loadProductTypes() {
    console.log('📋 loadProductTypes вызвана');
    try {
        const response = await fetch('/api/device-types');
        if (response.ok) {
            const types = await response.json();
            console.log('✅ Получены типы:', types);
            renderProductTypes(types);
        } else {
            console.error('❌ Ошибка загрузки типов:', response.status);
            showNotification('Ошибка загрузки типов', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки типов:', error);
        showNotification('Ошибка загрузки типов', 'error');
    }
}

function renderProductTypes(types) {
    const container = document.getElementById('product-types-list');
    if (!container) return;
    
    if (types.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет типов изделий</div>';
        return;
    }
    
    let html = '<div class="table-container"><table class="data-table">';
    html += `
        <thead>
            <tr>
                <th>Название</th>
                <th>Код</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    types.forEach(type => {
        html += `
            <tr>
                <td><strong>${type.name}</strong></td>
                <td>${type.code}</td>
                <td class="table-actions">
                    <button class="delete-btn" onclick="deleteProductType(${type.id})">✕</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log('✅ Типы отрендерены');
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
    
    try {
        const response = await fetch('/api/device-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    if (!confirm('Вы уверены, что хотите удалить этот тип?')) return;
    
    try {
        const response = await fetch(`/api/device-types/${id}`, {
            method: 'DELETE'
        });
        
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

// ===== ФУНКЦИИ ДЛЯ СОТРУДНИКОВ =====
async function loadEmployees() {
    console.log('👤 loadEmployees вызвана');
    try {
        const response = await fetch('/api/employees');
        if (response.ok) {
            AppState.employees = await response.json();
            console.log('✅ Сотрудники загружены:', AppState.employees.length);
            renderEmployeesTable();
        } else {
            console.error('❌ Ошибка загрузки сотрудников:', response.status);
            showNotification('Ошибка загрузки сотрудников', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки сотрудников:', error);
        showNotification('Ошибка загрузки сотрудников', 'error');
    }
}

function renderEmployeesTable() {
    const container = document.getElementById('employees-list');
    if (!container) return;
    
    if (AppState.employees.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет сотрудников</div>';
        return;
    }
    
    let html = '<div class="table-container"><table class="data-table">';
    html += `
        <thead>
            <tr>
                <th>ФИО</th>
                <th>Должность</th>
                <th>Логин</th>
                <th>Роль</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    AppState.employees.forEach(emp => {
        const roleClass = emp.role === 'admin' ? 'success' : 'warning';
        const roleText = emp.role === 'admin' ? 'Администратор' : 'Пользователь';
        
        html += `
            <tr>
                <td><strong>${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</strong></td>
                <td>${emp.position}</td>
                <td>${emp.username || '—'}</td>
                <td><span class="status-badge ${roleClass}">${roleText}</span></td>
                <td class="table-actions">
                    <button class="edit-btn" onclick="editEmployee(${emp.id})">✎</button>
                    <button class="delete-btn" onclick="deleteEmployee(${emp.id})">✕</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log('✅ Таблица сотрудников отрендерена');
}

async function addEmployee() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Добавить сотрудника</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="grid-2">
                    <div class="form-group">
                        <label>Фамилия *</label>
                        <input type="text" id="modal-last-name" placeholder="Иванов" required>
                    </div>
                    <div class="form-group">
                        <label>Имя *</label>
                        <input type="text" id="modal-first-name" placeholder="Иван" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Отчество</label>
                    <input type="text" id="modal-middle-name" placeholder="Иванович">
                </div>
                <div class="form-group">
                    <label>Должность *</label>
                    <input type="text" id="modal-position" placeholder="Инженер" required>
                </div>
                <div class="form-group">
                    <label>Логин *</label>
                    <input type="text" id="modal-username" placeholder="ivanov" required>
                </div>
                <div class="form-group">
                    <label>Пароль *</label>
                    <input type="password" id="modal-password" placeholder="••••••" required>
                </div>
                <div class="form-group">
                    <label>Роль</label>
                    <select id="modal-role">
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="saveEmployee()">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function editEmployee(id) {
    const emp = AppState.employees.find(e => e.id === id);
    if (!emp) return;
    
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
                    <div class="form-group">
                        <label>Фамилия *</label>
                        <input type="text" id="modal-last-name" value="${emp.last_name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Имя *</label>
                        <input type="text" id="modal-first-name" value="${emp.first_name || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Отчество</label>
                    <input type="text" id="modal-middle-name" value="${emp.middle_name || ''}">
                </div>
                <div class="form-group">
                    <label>Должность *</label>
                    <input type="text" id="modal-position" value="${emp.position || ''}" required>
                </div>
                <div class="form-group">
                    <label>Логин *</label>
                    <input type="text" id="modal-username" value="${emp.username || ''}" required>
                </div>
                <div class="form-group">
                    <label>Пароль (оставьте пустым, чтобы не менять)</label>
                    <input type="password" id="modal-password" placeholder="••••••">
                </div>
                <div class="form-group">
                    <label>Роль</label>
                    <select id="modal-role">
                        <option value="user" ${emp.role === 'user' ? 'selected' : ''}>Пользователь</option>
                        <option value="admin" ${emp.role === 'admin' ? 'selected' : ''}>Администратор</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="updateEmployee(${id})">Обновить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveEmployee() {
    const password = document.getElementById('modal-password')?.value;
    if (!password) {
        showNotification('Введите пароль', 'warning');
        return;
    }
    
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
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(empData)
        });
        
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
    
    // Если пароль не введен, удаляем его из данных
    if (!empData.password) {
        delete empData.password;
    }
    
    try {
        const response = await fetch(`/api/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch(`/api/employees/${id}`, {
            method: 'DELETE'
        });
        
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

// ===== ФУНКЦИИ ДЛЯ КОМПЛЕКТУЮЩИХ =====
let allComponents = []; // Для хранения всех загруженных комплектующих

async function loadComponents() {
    console.log('🔧 loadComponents вызвана');
    try {
        const response = await fetch('/api/components');
        if (response.ok) {
            allComponents = await response.json();
            console.log('✅ Комплектующие загружены:', allComponents.length);
            
            // Загружаем устройства для сопоставления типов
            await loadDevicesForComponents();
            
            // Отображаем все комплектующие по умолчанию
            renderComponentsTable(allComponents, 'all');
        } else {
            console.error('❌ Ошибка загрузки комплектующих:', response.status);
            showNotification('Ошибка загрузки комплектующих', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки комплектующих:', error);
        showNotification('Ошибка загрузки комплектующих', 'error');
    }
}

async function loadDevicesForComponents() {
    try {
        const response = await fetch('/api/devices');
        if (response.ok) {
            AppState.devices = await response.json();
            
            // Создаем маппинг device_id -> device_type
            AppState.deviceTypeMap = {};
            AppState.devices.forEach(device => {
                AppState.deviceTypeMap[device.id] = {
                    type: device.device_type_code || 'unknown',
                    name: device.device_type_name || 'Неизвестно'
                };
            });
            
            console.log('✅ Устройства для комплектующих загружены');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки устройств:', error);
    }
}

function filterComponentsByType(deviceType) {
    console.log(`🔍 Фильтрация комплектующих по типу: ${deviceType}`);
    
    // Обновляем активную вкладку
    const tabs = document.querySelectorAll('.component-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (deviceType === 'all' && tab.textContent.toLowerCase().includes('все')) {
            tab.classList.add('active');
        } else if (deviceType === 'RS' && tab.textContent.toLowerCase().includes('сервисные')) {
            tab.classList.add('active');
        } else if (deviceType === 'RB' && tab.textContent.toLowerCase().includes('граничные')) {
            tab.classList.add('active');
        } else if (deviceType === 'SA' && tab.textContent.toLowerCase().includes('коммутаторы')) {
            tab.classList.add('active');
        }
    });
    
    if (deviceType === 'all') {
        renderComponentsTable(allComponents, 'all');
        return;
    }
    
    // Фильтруем комплектующие по типу устройства
    const filteredComponents = allComponents.filter(component => {
        if (!component.device_id) return false;
        
        const deviceInfo = AppState.deviceTypeMap[component.device_id];
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
        else if (filterType === 'RB') message = 'Нет комплектующих для граничных маршрутизаторов';
        else if (filterType === 'SA') message = 'Нет комплектующих для коммутаторов доступа';
        
        container.innerHTML = `<div class="empty-state">${message}</div>`;
        return;
    }
    
    let html = '';
    
    // Добавляем информацию о количестве для фильтрованных представлений
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
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    components.forEach(comp => {
        // Получаем информацию об устройстве
        const deviceInfo = comp.device_id ? AppState.deviceTypeMap[comp.device_id] : null;
        const deviceSerial = comp.device_id ? 
            AppState.devices.find(d => d.id === comp.device_id)?.product_serial_number : null;
        
        let deviceTypeDisplay = '—';
        if (deviceInfo) {
            switch(deviceInfo.type) {
                case 'RS': deviceTypeDisplay = 'Сервисный маршрутизатор'; break;
                case 'RB': deviceTypeDisplay = 'Граничный маршрутизатор'; break;
                case 'SA': deviceTypeDisplay = 'Коммутатор доступа'; break;
                default: deviceTypeDisplay = deviceInfo.name;
            }
        }
        
        html += `
            <tr data-id="${comp.id}" data-type="${comp.type}">
                <td><span class="status-badge info">${comp.type}</span></td>
                <td><strong>${comp.name}</strong></td>
                <td>${deviceSerial || '—'}</td>
                <td>${deviceTypeDisplay}</td>
                <td>${comp.author || '—'}</td>
                <td class="table-actions">
                    <button class="delete-btn" onclick="deleteComponent(${comp.id}, '${comp.type}')">✕</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log(`✅ Таблица комплектующих отрендерена (фильтр: ${filterType})`);
}

async function addComponent() {
    try {
        const typesResponse = await fetch('/api/component-types');
        const types = await typesResponse.json();
        
        const devicesResponse = await fetch('/api/devices');
        const devices = await devicesResponse.json();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Добавить комплектующее</h3>
                    <button class="modal-close" onclick="closeModal(this)">×</button>
                </div>
                <div class="modal-content">
                    <div class="form-group">
                        <label>Тип комплектующего *</label>
                        <select id="modal-component-type" required>
                            <option value="">Выберите тип</option>
                            ${types.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Серийный номер / Название *</label>
                        <input type="text" id="modal-component-name" placeholder="Введите серийный номер" required>
                    </div>
                    <div class="form-group">
                        <label>ID устройства (необязательно)</label>
                        <select id="modal-component-device">
                            <option value="">Не привязывать к устройству</option>
                            ${devices.map(d => `<option value="${d.id}">${d.product_serial_number || 'Без номера'} (${d.device_type_name || 'Неизвестно'})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="modal-author-group" style="display: none;">
                        <label>Кто проверил</label>
                        <input type="text" id="modal-component-author" placeholder="ФИО проверяющего">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                    <button class="btn-save" onclick="saveComponent()">Сохранить</button>
                </div>
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
    
    if (!type) {
        showNotification('Выберите тип комплектующего', 'warning');
        return;
    }
    
    if (!name) {
        showNotification('Введите серийный номер', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/components', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type, 
                name, 
                device_id: deviceId || null,
                author: author || null
            })
        });
        
        if (response.ok) {
            showNotification('✅ Комплектующее добавлено', 'success');
            closeModal(document.querySelector('.modal-close'));
            
            // Перезагружаем комплектующие
            await loadComponents();
            
            // Восстанавливаем активный фильтр
            const activeTab = document.querySelector('.component-tab.active');
            if (activeTab) {
                const tabText = activeTab.textContent;
                if (tabText.includes('Сервисные')) filterComponentsByType('RS');
                else if (tabText.includes('Граничные')) filterComponentsByType('RB');
                else if (tabText.includes('Коммутаторы')) filterComponentsByType('SA');
                else filterComponentsByType('all');
            }
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
        const response = await fetch(`/api/components/${id}?type=${type}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ Комплектующее удалено', 'success');
            await loadComponents();
            
            // Восстанавливаем активный фильтр
            const activeTab = document.querySelector('.component-tab.active');
            if (activeTab) {
                const tabText = activeTab.textContent;
                if (tabText.includes('Сервисные')) filterComponentsByType('RS');
                else if (tabText.includes('Граничные')) filterComponentsByType('RB');
                else if (tabText.includes('Коммутаторы')) filterComponentsByType('SA');
                else filterComponentsByType('all');
            }
        } else {
            showNotification('❌ Ошибка при удалении', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера', 'error');
    }
}

// ===== ФУНКЦИИ ДЛЯ МЕСТ ПРОИЗВОДСТВА =====
async function loadProductionPlaces() {
    console.log('🏭 loadProductionPlaces вызвана');
    try {
        const response = await fetch('/api/production-places');
        if (response.ok) {
            const places = await response.json();
            console.log('✅ Места производства загружены:', places.length);
            renderProductionPlacesTable(places);
        } else {
            console.error('❌ Ошибка загрузки мест:', response.status);
            showNotification('Ошибка загрузки мест производства', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки мест:', error);
        showNotification('Ошибка загрузки мест производства', 'error');
    }
}

function renderProductionPlacesTable(places) {
    const container = document.getElementById('production-places-list');
    if (!container) return;
    
    if (places.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет мест производства</div>';
        return;
    }
    
    let html = '<div class="table-container"><table class="data-table">';
    html += `
        <thead>
            <tr>
                <th>Название</th>
                <th>Код</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    places.forEach(place => {
        html += `
            <tr>
                <td><strong>${place.name}</strong></td>
                <td>${place.code}</td>
                <td class="table-actions">
                    <button class="delete-btn" onclick="deleteProductionPlace(${place.id})">✕</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    console.log('✅ Таблица мест производства отрендерена');
}

async function addProductionPlace() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Добавить место производства</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" id="modal-place-name" placeholder="АО НПП Исток">
                </div>
                <div class="form-group">
                    <label>Код *</label>
                    <input type="text" id="modal-place-code" placeholder="01" maxlength="10">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal(this)">Отмена</button>
                <button class="btn-save" onclick="saveProductionPlace()">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveProductionPlace() {
    const name = document.getElementById('modal-place-name')?.value;
    const code = document.getElementById('modal-place-code')?.value;
    
    if (!name || !code) {
        showNotification('Заполните все поля', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/production-places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, code })
        });
        
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
        const response = await fetch(`/api/production-places/${id}`, {
            method: 'DELETE'
        });
        
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

// ===== ФУНКЦИИ ДЛЯ СТАТИСТИКИ =====
async function loadStatistics() {
    console.log('📊 loadStatistics вызвана');
    try {
        const response = await fetch('/api/statistics');
        if (response.ok) {
            const stats = await response.json();
            console.log('✅ Статистика загружена');
            renderStatistics(stats);
        } else {
            console.error('❌ Ошибка загрузки статистики:', response.status);
            showNotification('Ошибка загрузки статистики', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки статистики:', error);
        showNotification('Ошибка загрузки статистики', 'error');
    }
}

function renderStatistics(stats) {
    const container = document.getElementById('statistics-content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="stats-section">
                <div class="section-header">
                    <h2>ОБЩАЯ СТАТИСТИКА</h2>
                </div>
                <div style="padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div class="stat-item">
                            <div class="stat-value">${stats.devices.total}</div>
                            <div class="stat-label">Всего устройств</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.devices.ready}</div>
                            <div class="stat-label">Готово</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.devices.problems}</div>
                            <div class="stat-label">С проблемами</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.devices.ready_percentage}%</div>
                            <div class="stat-label">Готовность</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <div class="section-header">
                    <h2>ПО ТИПАМ УСТРОЙСТВ</h2>
                </div>
                <div style="padding: 1.5rem;">
                    ${stats.byType.map(type => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                            <span style="font-weight: 600;">${type.name}</span>
                            <span>${type.count} шт.</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section">
                <div class="section-header">
                    <h2>ПО ЭТАПАМ ПРОИЗВОДСТВА</h2>
                </div>
                <div style="padding: 1.5rem;">
                    ${stats.byStage.map(stage => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                            <span style="font-weight: 600;">${stage.name}</span>
                            <span>${stage.count} шт.</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    console.log('✅ Статистика отрендерена');
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
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== ОСНОВНАЯ ФУНКЦИЯ ОТОБРАЖЕНИЯ КОНТЕНТА =====
async function showContent(contentType) {
    console.log('🔄 Переключение на вкладку:', contentType);
    AppState.currentContent = contentType;
    const contentArea = document.getElementById('content-area');
    let content = '';

    switch(contentType) {
        case 'devices':
            content = `
                <div class="devices-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>УСТРОЙСТВА</h1>
                        <button class="add-button" onclick="addDevice()">+ Добавить устройство</button>
                    </div>
                    <div class="search-panel">
                        <div class="search-input">
                            <input type="text" id="deviceSearch" placeholder="Поиск по серийному номеру или модели...">
                            <button onclick="searchDevices()">Найти</button>
                        </div>
                        <select class="filter-select" id="deviceTypeFilter" onchange="filterDevicesByType()">
                            <option value="">Все типы</option>
                        </select>
                    </div>
                    <div class="page-content">
                        <div id="devices-list"></div>
                    </div>
                </div>
            `;
            break;
            
        case 'product-types':
            content = `
                <div class="product-types-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>ТИПЫ ИЗДЕЛИЙ</h1>
                        <button class="add-button" onclick="addProductType()">+ Добавить тип</button>
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
                        <button class="add-button" onclick="addComponent()">+ Добавить комплектующее</button>
                    </div>
                    <div class="components-tabs">
                        <button class="component-tab active" onclick="filterComponentsByType('all')">Все</button>
                        <button class="component-tab" onclick="filterComponentsByType('RS')">Сервисные маршрутизаторы</button>
                        <button class="component-tab" onclick="filterComponentsByType('RB')">Граничные маршрутизаторы</button>
                        <button class="component-tab" onclick="filterComponentsByType('SA')">Коммутаторы доступа</button>
                    </div>
                    <div class="page-content">
                        <div id="components-list"></div>
                    </div>
                </div>
            `;
            break;
            
        case 'production-places':
            content = `
                <div class="production-places-page">
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>МЕСТА ПРОИЗВОДСТВА</h1>
                        <button class="add-button" onclick="addProductionPlace()">+ Добавить место</button>
                    </div>
                    <div class="page-content">
                        <div id="production-places-list"></div>
                    </div>
                </div>
            `;
            break;
            
        case 'serial-structure':
            content = `
                <div class="serial-structure">
                    <div class="page-header">
                        <h1>СТРУКТУРА СЕРИЙНЫХ НОМЕРОВ</h1>
                    </div>
                    <div class="page-content">
                        <div class="current-format" style="background: var(--bg-soft); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; text-align: center;">
                            <h3>ТЕКУЩИЙ ФОРМАТ:</h3>
                            <div style="font-family: monospace; font-size: 1.8rem; color: var(--primary);">RS 10 10 16 03 0001</div>
                        </div>
                        <div class="explanation">
                            <h4>Расшифровка структуры:</h4>
                            <div class="explanation-grid" style="display: grid; gap: 0.8rem;">
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Тип устройства</span>
                                    <span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">RS</span>
                                    <span>2 буквы, тип устройства</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Тип конфигурации</span>
                                    <span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">10</span>
                                    <span>2 цифры, конфигурация</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Код производства</span>
                                    <span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">10</span>
                                    <span>2 цифры, код цеха</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Год выпуска</span>
                                    <span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">16</span>
                                    <span>2 цифры, год</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Месяц выпуска</span>
                                    <span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">03</span>
                                    <span>2 цифры, месяц</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 150px 80px 1fr; align-items: center; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
                                    <span style="font-weight: 600;">Порядковый номер</span>
                                    <span style="font-family: monospace; background: var(--bg-white); border: 1px solid var(--border-light); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); text-align: center;">0001</span>
                                    <span>4 цифры, номер</span>
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
                    <div class="page-header">
                        <h1>СТАТИСТИКА</h1>
                    </div>
                    <div class="page-content" id="statistics-content"></div>
                </div>
            `;
            break;
            
        default:
            content = `
                <h3>Добро пожаловать</h3>
                <p>Выберите раздел в боковом меню для работы с системой.</p>
            `;
    }

    contentArea.innerHTML = content;
    
    // Обновляем активную кнопку в боковом меню
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(contentType.replace('-', ' '))) {
            tab.classList.add('active');
        }
    });

    // Загружаем данные в зависимости от типа контента
    setTimeout(() => {
        console.log('⏰ Загрузка данных для:', contentType);
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

// ===== ФУНКЦИИ ДЛЯ ПРОФИЛЯ И НАСТРОЕК =====
async function showTopContent(contentType) {
    console.log('🔄 Переключение на верхнюю вкладку:', contentType);
    AppState.currentTopContent = contentType;
    const contentArea = document.getElementById('content-area');
    let content = '';

    switch(contentType) {
        case 'profile':
            content = `
                <div class="profile-page">
                    <div class="page-header">
                        <h1>ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</h1>
                    </div>
                    <div class="page-content">
                        <div class="profile-card">
                            <div class="profile-header">
                                <div class="profile-avatar">А</div>
                                <h2>Администратор Системы</h2>
                                <p>Главный администратор</p>
                            </div>
                            <div class="profile-body">
                                <div class="profile-section">
                                    <h3>Личная информация</h3>
                                    <div class="profile-row">
                                        <span class="profile-label">ФИО:</span>
                                        <span class="profile-value">Администратор Системы</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Должность:</span>
                                        <span class="profile-value">Главный администратор</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Email:</span>
                                        <span class="profile-value">admin@istok.ru</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Логин:</span>
                                        <span class="profile-value">admin</span>
                                    </div>
                                </div>
                                <div class="profile-section">
                                    <h3>Статистика активности</h3>
                                    <div class="profile-stats">
                                        <div class="stat-item">
                                            <div class="stat-value">15.01.2023</div>
                                            <div class="stat-label">В системе с</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">Сегодня</div>
                                            <div class="stat-label">Последний вход</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-value">127</div>
                                            <div class="stat-label">Действий</div>
                                        </div>
                                    </div>
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
                    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>СОТРУДНИКИ</h1>
                        <button class="add-button" onclick="addEmployee()">+ Добавить сотрудника</button>
                    </div>
                    <div class="page-content">
                        <div id="employees-list"></div>
                    </div>
                </div>
            `;
            break;
            
        case 'about':
            content = `
                <div class="about-page">
                    <div class="page-header">
                        <h1>О ПРОГРАММЕ</h1>
                    </div>
                    <div class="page-content">
                        <div class="profile-card">
                            <div class="profile-header">
                                <div class="profile-avatar">Д</div>
                                <h2>Дипломный проект</h2>
                                <p>Курбатова Мария Владимировна</p>
                            </div>
                            <div class="profile-body">
                                <div class="profile-section">
                                    <h3>О проекте</h3>
                                    <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1rem;">
                                        Данная информационная система представляет собой дипломный проект, 
                                        выполненный студенткой группы 405ИС-22 Курбатовой Марией Владимировной.
                                    </p>
                                    <p style="line-height: 1.6; color: var(--text-secondary);">
                                        Проект посвящен разработке автоматизированной системы управления 
                                        производственным процессом на предприятии. Система позволяет отслеживать 
                                        все этапы производства устройств, вести учет комплектующих, управлять 
                                        персоналом и анализировать производственные показатели.
                                    </p>
                                </div>
                                <div class="profile-section">
                                    <h3>О разработчике</h3>
                                    <div class="profile-row">
                                        <span class="profile-label">Студент:</span>
                                        <span class="profile-value">Курбатова Мария Владимировна</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Группа:</span>
                                        <span class="profile-value">405ИС-22</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Учебное заведение:</span>
                                        <span class="profile-value">КМПО РАНХиГС</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Год окончания:</span>
                                        <span class="profile-value">2026</span>
                                    </div>
                                </div>
                                <div class="profile-section">
                                    <h3>Техническая реализация</h3>
                                    <div class="profile-row">
                                        <span class="profile-label">Frontend:</span>
                                        <span class="profile-value">HTML5, CSS3, JavaScript</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Backend:</span>
                                        <span class="profile-value">Node.js, Express</span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">База данных:</span>
                                        <span class="profile-value">MySQL</span>
                                    </div>
                                </div>
                                <div style="text-align: center; margin-top: 2rem; color: var(--text-tertiary);">
                                    <p>© 2026 Курбатова Мария Владимировна. Все права защищены.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'settings':
            content = `
                <div class="settings-page">
                    <div class="page-header">
                        <h1>НАСТРОЙКИ СИСТЕМЫ</h1>
                    </div>
                    <div class="page-content">
                        <div class="profile-card">
                            <div class="profile-body">
                                <div class="profile-section">
                                    <h3>Тема оформления</h3>
                                    <div class="profile-row">
                                        <span class="profile-label">Темная тема</span>
                                        <span class="profile-value">
                                            <input type="checkbox" onchange="toggleTheme()" ${document.body.classList.contains('theme-dark') ? 'checked' : ''}>
                                        </span>
                                    </div>
                                </div>
                                <div class="profile-section">
                                    <h3>Язык интерфейса</h3>
                                    <div class="profile-row">
                                        <span class="profile-label">Русский</span>
                                        <span class="profile-value">
                                            <input type="radio" name="language" checked>
                                        </span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">English</span>
                                        <span class="profile-value">
                                            <input type="radio" name="language">
                                        </span>
                                    </div>
                                </div>
                                <div class="profile-section">
                                    <h3>Уведомления</h3>
                                    <div class="profile-row">
                                        <span class="profile-label">Email уведомления</span>
                                        <span class="profile-value">
                                            <input type="checkbox" checked>
                                        </span>
                                    </div>
                                    <div class="profile-row">
                                        <span class="profile-label">Системные уведомления</span>
                                        <span class="profile-value">
                                            <input type="checkbox" checked>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }

    contentArea.innerHTML = content;
    
    // Обновляем активную кнопку в верхних вкладках
    const topTabs = document.querySelectorAll('.top-tab');
    topTabs.forEach(tab => tab.classList.remove('active'));
    
    // Находим активную вкладку по тексту
    topTabs.forEach(tab => {
        if (tab.textContent.trim().toLowerCase() === contentType) {
            tab.classList.add('active');
        }
    });

    // Загружаем данные для сотрудников если нужно
    if (contentType === 'employees') {
        setTimeout(() => {
            loadEmployees();
        }, 100);
    }
}

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ =====
// Основные функции
window.showContent = showContent;
window.showTopContent = showTopContent;
window.closeModal = closeModal;
window.showNotification = showNotification;

// Устройства
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

// Сотрудники
window.addEmployee = addEmployee;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.saveEmployee = saveEmployee;
window.updateEmployee = updateEmployee;
window.loadEmployees = loadEmployees;

// Типы изделий
window.addProductType = addProductType;
window.deleteProductType = deleteProductType;
window.saveProductType = saveProductType;
window.loadProductTypes = loadProductTypes;

// Места производства
window.addProductionPlace = addProductionPlace;
window.deleteProductionPlace = deleteProductionPlace;
window.saveProductionPlace = saveProductionPlace;
window.loadProductionPlaces = loadProductionPlaces;

// Комплектующие
window.addComponent = addComponent;
window.saveComponent = saveComponent;
window.deleteComponent = deleteComponent;
window.loadComponents = loadComponents;
window.filterComponentsByType = filterComponentsByType;

// Статистика
window.loadStatistics = loadStatistics;