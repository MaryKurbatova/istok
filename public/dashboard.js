// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
const AppState = {
    currentUser: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    currentContent: 'devices',
    currentTopContent: 'profile',
    devices: [],
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📢 DOM загружен');
    
    // Загрузка темы
    if (AppState.currentTheme === 'dark') {
        document.body.classList.add('theme-dark');
    }
    
    // Загружаем справочные данные
    await loadReferenceData();
    
    // Показываем контент по умолчанию (устройства)
    showContent('devices');
    
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
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-container {
            background: var(--bg-white);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid var(--border-light);
            animation: slideUp 0.3s ease;
        }
        
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-light);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: var(--bg-white);
            z-index: 1;
        }
        
        .modal-header h3 {
            margin: 0;
            color: var(--primary);
        }
        
        .modal-close {
            background: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-tertiary);
            transition: var(--transition);
        }
        
        .modal-close:hover {
            color: var(--danger);
        }
        
        .modal-content {
            padding: 1.5rem;
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--border-light);
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            position: sticky;
            bottom: 0;
            background: var(--bg-white);
        }
        
        .modal-footer button {
            padding: 0.6rem 1.5rem;
            border-radius: var(--radius-full);
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: var(--transition);
        }
        
        .modal-footer .btn-cancel {
            background: var(--bg-soft);
            color: var(--text-secondary);
            border: 1px solid var(--border-light);
        }
        
        .modal-footer .btn-cancel:hover {
            background: var(--text-tertiary);
            color: white;
        }
        
        .modal-footer .btn-save {
            background: var(--primary);
            color: white;
            border: 1px solid var(--primary);
        }
        
        .modal-footer .btn-save:hover {
            background: var(--primary-dark);
        }
        
        .scroll-area {
            max-height: 600px;
            overflow-y: auto;
            padding-right: 0.5rem;
        }
        
        .scroll-area::-webkit-scrollbar {
            width: 6px;
        }
        
        .scroll-area::-webkit-scrollbar-track {
            background: var(--border-soft);
            border-radius: var(--radius-full);
        }
        
        .scroll-area::-webkit-scrollbar-thumb {
            background: var(--primary-light);
            border-radius: var(--radius-full);
        }
        
        .data-card {
            background: var(--bg-white);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 1rem;
            transition: var(--transition);
        }
        
        .data-card:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--primary-light);
        }
        
        .data-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .data-card-title {
            font-weight: 600;
            color: var(--primary);
            font-size: 1.1rem;
        }
        
        .data-card-subtitle {
            color: var(--text-tertiary);
            font-size: 0.85rem;
        }
        
        .data-card-actions {
            display: flex;
            gap: 0.3rem;
        }
        
        .data-card-content {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .data-card-content p {
            margin: 0.3rem 0;
        }
        
        .data-card-content .badge {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-full);
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .badge-success {
            background: #E8F0E8;
            color: #6B8C6B;
        }
        
        .badge-warning {
            background: #FFF5F0;
            color: #C49A8C;
        }
        
        .badge-danger {
            background: #FCE8E8;
            color: #C46B6B;
        }
        
        .form-group {
            margin-bottom: 1.2rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.7rem 1rem;
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            background: var(--bg-white);
            color: var(--text-primary);
            font-size: 0.95rem;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(183, 161, 135, 0.1);
        }
        
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background: var(--bg-soft);
            border-radius: var(--radius-sm);
        }
        
        .info-label {
            width: 150px;
            font-weight: 500;
            color: var(--text-tertiary);
        }
        
        .info-value {
            flex: 1;
            color: var(--text-primary);
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--text-tertiary);
            font-style: italic;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== ФУНКЦИИ ДЛЯ УСТРОЙСТВ =====
async function loadDevices() {
    console.log('📱 loadDevices вызвана');
    try {
        const response = await fetch('/api/devices');
        if (response.ok) {
            AppState.devices = await response.json();
            console.log('✅ Устройства загружены:', AppState.devices.length);
            renderDevices();
        } else {
            console.error('❌ Ошибка загрузки устройств:', response.status);
            showNotification('Ошибка загрузки устройств', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки устройств:', error);
        showNotification('Ошибка загрузки устройств', 'error');
    }
}

function renderDevices() {
    const container = document.getElementById('devices-list');
    if (!container) {
        console.error('❌ Элемент devices-list не найден');
        return;
    }
    
    if (AppState.devices.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет устройств</div>';
        return;
    }
    
    let html = '<div class="scroll-area">';
    
    AppState.devices.forEach(device => {
        const statusClass = device.diag ? 'badge-success' : 'badge-danger';
        const statusText = device.diag ? '✓ Готов' : '✗ Проблема';
        
        html += `
            <div class="data-card" data-id="${device.id}">
                <div class="data-card-header">
                    <div>
                        <span class="data-card-title">${device.product_serial_number || 'Без номера'}</span>
                        <div class="data-card-subtitle">${device.type || device.device_type_name || 'Не указан'}</div>
                    </div>
                    <div class="data-card-actions">
                        <button class="action-btn edit" onclick="showDeviceDetails(${device.id})">👁️</button>
                        <button class="action-btn edit" onclick="editDevice(${device.id})">✎</button>
                        <button class="action-btn delete" onclick="deleteDevice(${device.id})">✕</button>
                    </div>
                </div>
                <div class="data-card-content">
                    <p><strong>Версия ОС:</strong> ${device.version_os || 'Не указана'}</p>
                    <p><strong>Дата производства:</strong> ${device.manufactures_date || 'Не указана'}</p>
                    <p><span class="badge ${statusClass}">${statusText}</span></p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ Устройства отрендерены');
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
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>Детали устройства</h3>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-content">
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
                    <span class="info-label">Диагностика:</span>
                    <span class="info-value"><span class="badge ${device.diag ? 'badge-success' : 'badge-danger'}">${device.diag ? 'Пройдена' : 'Не пройдена'}</span></span>
                </div>
                
                <h4 style="margin-top: 1.5rem; margin-bottom: 1rem;">Комплектующие</h4>
                ${components.length > 0 ? `
                    <div class="scroll-area" style="max-height: 200px;">
                        ${components.map(c => `
                            <div class="data-card" style="padding: 0.8rem;">
                                <div><strong>${c.type}:</strong> ${c.name}</div>
                                ${c.author ? `<div><small>Проверил: ${c.author}, ${c.date || ''}</small></div>` : ''}
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
                    <label>Тип устройства</label>
                    <select id="modal-device-type">
                        <option value="">Выберите тип</option>
                        ${AppState.deviceTypes.map(t => `<option value="${t.id}">${t.name} (${t.code})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Серийный номер</label>
                    <input type="text" id="modal-serial-number" placeholder="Например: RS101016430001">
                </div>
                <div class="form-group">
                    <label>Модель/Тип</label>
                    <input type="text" id="modal-type" placeholder="Например: ISN4150873 +10n">
                </div>
                <div class="form-group">
                    <label>Версия ОС</label>
                    <input type="text" id="modal-version-os" placeholder="Например: RouterOS 6.0">
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Место производства</label>
                        <select id="modal-production-place">
                            <option value="">Не выбрано</option>
                            ${AppState.productionPlaces.map(p => `<option value="${p.id}">${p.name} (${p.code})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Месяц производства</label>
                        <select id="modal-production-month">
                            <option value="">Не выбран</option>
                            ${AppState.productionMonths.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Год производства</label>
                        <select id="modal-production-year">
                            <option value="">Не выбран</option>
                            ${AppState.productionYears.map(y => `<option value="${y.id}">${y.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Этап производства</label>
                        <select id="modal-production-stage">
                            <option value="">Не выбран</option>
                            ${AppState.productionStages.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Местоположение</label>
                    <select id="modal-location">
                        <option value="">Не выбрано</option>
                        ${AppState.locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Дата производства</label>
                    <input type="date" id="modal-manufactures-date">
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
                <div class="grid-2">
                    <div class="form-group">
                        <label>Место производства</label>
                        <select id="modal-production-place">
                            <option value="">Не выбрано</option>
                            ${AppState.productionPlaces.map(p => `<option value="${p.id}" ${p.id === device.place_of_production_id ? 'selected' : ''}>${p.name} (${p.code})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Месяц производства</label>
                        <select id="modal-production-month">
                            <option value="">Не выбран</option>
                            ${AppState.productionMonths.map(m => `<option value="${m.id}" ${m.id === device.production_month_id ? 'selected' : ''}>${m.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Год производства</label>
                        <select id="modal-production-year">
                            <option value="">Не выбран</option>
                            ${AppState.productionYears.map(y => `<option value="${y.id}" ${y.id === device.production_year_id ? 'selected' : ''}>${y.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Этап производства</label>
                        <select id="modal-production-stage">
                            <option value="">Не выбран</option>
                            ${AppState.productionStages.map(s => `<option value="${s.id}" ${s.id === device.production_stage_id ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Местоположение</label>
                    <select id="modal-location">
                        <option value="">Не выбрано</option>
                        ${AppState.locations.map(l => `<option value="${l.id}" ${l.id === device.actual_location_id ? 'selected' : ''}>${l.name}</option>`).join('')}
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
        manufactures_date: document.getElementById('modal-manufactures-date')?.value,
        diag: document.getElementById('modal-diag')?.checked
    };
    
    if (!deviceData.product_serial_number) {
        showNotification('Введите серийный номер', 'warning');
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
        console.log('📡 Ответ от API, статус:', response.status);
        
        if (response.ok) {
            const types = await response.json();
            console.log('✅ Получены типы:', types);
            renderProductTypes(types);
        } else {
            console.error('❌ Ошибка ответа:', response.status);
            showNotification('Ошибка загрузки типов', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки типов:', error);
        showNotification('Ошибка загрузки типов', 'error');
    }
}

function renderProductTypes(types) {
    console.log('🎨 renderProductTypes вызвана, типов:', types.length);
    const container = document.getElementById('product-types-list');
    console.log('📦 контейнер найден:', container);
    
    if (!container) {
        console.error('❌ Элемент product-types-list не найден!');
        return;
    }
    
    if (types.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет типов изделий</div>';
        return;
    }
    
    let html = '<div class="scroll-area">';
    
    types.forEach(type => {
        html += `
            <div class="data-card" data-id="${type.id}">
                <div class="data-card-header">
                    <div>
                        <span class="data-card-title">${type.name}</span>
                        <div class="data-card-subtitle">Код: ${type.code}</div>
                    </div>
                    <div class="data-card-actions">
                        <button class="action-btn delete" onclick="deleteProductType(${type.id})">✕</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
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

// ===== ИСПРАВЛЕННЫЕ ФУНКЦИИ ДЛЯ СОТРУДНИКОВ =====
async function loadEmployees() {
    console.log('👤 loadEmployees вызвана');
    try {
        const response = await fetch('/api/employees');
        if (response.ok) {
            AppState.employees = await response.json();
            console.log('✅ Сотрудники загружены:', AppState.employees.length);
            renderEmployees();
        } else {
            console.error('❌ Ошибка загрузки сотрудников:', response.status);
            showNotification('Ошибка загрузки сотрудников', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки сотрудников:', error);
        showNotification('Ошибка загрузки сотрудников', 'error');
    }
}

function renderEmployees() {
    const container = document.getElementById('employees-list');
    if (!container) {
        console.error('❌ Элемент employees-list не найден');
        return;
    }
    
    if (AppState.employees.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет сотрудников</div>';
        return;
    }
    
    let html = '<div class="scroll-area">';
    
    AppState.employees.forEach(emp => {
        const roleClass = emp.role === 'admin' ? 'badge-success' : 'badge-warning';
        
        html += `
            <div class="data-card" data-id="${emp.id}">
                <div class="data-card-header">
                    <div>
                        <span class="data-card-title">${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</span>
                        <div class="data-card-subtitle">${emp.position}</div>
                    </div>
                    <div class="data-card-actions">
                        <button class="action-btn edit" onclick="editEmployee(${emp.id})">✎</button>
                        <button class="action-btn delete" onclick="deleteEmployee(${emp.id})">✕</button>
                    </div>
                </div>
                <div class="data-card-content">
                    <p><strong>Логин:</strong> ${emp.username || 'Не задан'}</p>
                    <p><span class="badge ${roleClass}">${emp.role || 'user'}</span></p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ Сотрудники отрендерены');
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
async function loadComponents() {
    console.log('🔧 loadComponents вызвана');
    try {
        const response = await fetch('/api/components');
        if (response.ok) {
            const components = await response.json();
            console.log('✅ Комплектующие загружены:', components.length);
            renderComponents(components);
        } else {
            console.error('❌ Ошибка загрузки комплектующих:', response.status);
            showNotification('Ошибка загрузки комплектующих', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки комплектующих:', error);
        showNotification('Ошибка загрузки комплектующих', 'error');
    }
}

function renderComponents(components) {
    const container = document.getElementById('components-list');
    if (!container) {
        console.error('❌ Элемент components-list не найден');
        return;
    }
    
    if (components.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет комплектующих</div>';
        return;
    }
    
    // Группируем по типу
    const grouped = components.reduce((acc, comp) => {
        if (!acc[comp.type]) acc[comp.type] = [];
        acc[comp.type].push(comp);
        return acc;
    }, {});
    
    let html = '<div class="scroll-area">';
    
    for (const [type, items] of Object.entries(grouped)) {
        html += `<h4 style="margin: 1rem 0 0.5rem;">${type}</h4>`;
        items.forEach(comp => {
            html += `
                <div class="data-card" style="padding: 0.8rem;" data-id="${comp.id}" data-type="${type}">
                    <div><strong>${comp.name}</strong></div>
                    ${comp.device_id ? `<div><small>ID устройства: ${comp.device_id}</small></div>` : ''}
                    ${comp.author ? `<div><small>Проверил: ${comp.author}</small></div>` : ''}
                    <div style="margin-top: 0.5rem;">
                        <button class="action-btn delete" onclick="deleteComponent(${comp.id}, '${type}')">✕</button>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ Комплектующие отрендерены');
}

async function addComponent() {
    try {
        // Загружаем типы комплектующих
        const typesResponse = await fetch('/api/component-types');
        const types = await typesResponse.json();
        
        // Загружаем устройства для выпадающего списка
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
                            ${devices.map(d => `<option value="${d.id}">${d.product_serial_number || 'Без номера'}</option>`).join('')}
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
        
        // Показываем поле автора только для плат
        document.getElementById('modal-component-type').addEventListener('change', function() {
            const authorGroup = document.getElementById('modal-author-group');
            if (this.value === 'board') {
                authorGroup.style.display = 'block';
            } else {
                authorGroup.style.display = 'none';
            }
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
        const response = await fetch(`/api/components/${id}?type=${type}`, {
            method: 'DELETE'
        });
        
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

// ===== ФУНКЦИИ ДЛЯ МЕСТ ПРОИЗВОДСТВА =====
async function loadProductionPlaces() {
    console.log('🏭 loadProductionPlaces вызвана');
    try {
        const response = await fetch('/api/production-places');
        if (response.ok) {
            const places = await response.json();
            console.log('✅ Места производства загружены:', places.length);
            renderProductionPlaces(places);
        } else {
            console.error('❌ Ошибка загрузки мест:', response.status);
            showNotification('Ошибка загрузки мест производства', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки мест:', error);
        showNotification('Ошибка загрузки мест производства', 'error');
    }
}

function renderProductionPlaces(places) {
    const container = document.getElementById('production-places-list');
    if (!container) {
        console.error('❌ Элемент production-places-list не найден');
        return;
    }
    
    if (places.length === 0) {
        container.innerHTML = '<div class="empty-state">Нет мест производства</div>';
        return;
    }
    
    let html = '<div class="scroll-area">';
    
    places.forEach(place => {
        html += `
            <div class="data-card" data-id="${place.id}">
                <div class="data-card-header">
                    <div>
                        <span class="data-card-title">${place.name}</span>
                        <div class="data-card-subtitle">Код: ${place.code}</div>
                    </div>
                    <div class="data-card-actions">
                        <button class="action-btn delete" onclick="deleteProductionPlace(${place.id})">✕</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('✅ Места производства отрендерены');
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
    if (!container) {
        console.error('❌ Элемент statistics-content не найден');
        return;
    }
    
    container.innerHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="stat-card-mini" style="background: var(--bg-white); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${stats.devices.total}</div>
                <div style="color: var(--text-secondary);">Всего устройств</div>
            </div>
            <div class="stat-card-mini" style="background: var(--bg-white); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${stats.devices.ready}</div>
                <div style="color: var(--text-secondary);">Готово (${stats.devices.ready_percentage}%)</div>
            </div>
            <div class="stat-card-mini" style="background: var(--bg-white); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${stats.devices.problems}</div>
                <div style="color: var(--text-secondary);">С проблемами (${stats.devices.problems_percentage}%)</div>
            </div>
        </div>
        
        <div class="stats-columns" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="stats-section" style="background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border-light); overflow: hidden;">
                <div class="section-header" style="background: var(--bg-soft); padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-light);">
                    <h2 style="margin: 0; font-size: 1.1rem;">ПО ТИПАМ УСТРОЙСТВ</h2>
                </div>
                <div class="type-stats scroll-area" style="max-height: 300px; padding: 1rem;">
                    ${stats.byType.map(type => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                            <span style="font-weight: 600;">${type.code}</span>
                            <span>${type.count} шт.</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section" style="background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border-light); overflow: hidden;">
                <div class="section-header" style="background: var(--bg-soft); padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-light);">
                    <h2 style="margin: 0; font-size: 1.1rem;">ПО ЭТАПАМ ПРОИЗВОДСТВА</h2>
                </div>
                <div class="type-stats scroll-area" style="max-height: 300px; padding: 1rem;">
                    ${stats.byStage.map(stage => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                            <span style="font-weight: 600;">${stage.code}</span>
                            <span>${stage.count} шт.</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-section" style="background: var(--bg-white); border-radius: var(--radius-lg); border: 1px solid var(--border-light); overflow: hidden;">
                <div class="section-header" style="background: var(--bg-soft); padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-light);">
                    <h2 style="margin: 0; font-size: 1.1rem;">ПО МЕСТАМ ПРОИЗВОДСТВА</h2>
                </div>
                <div class="type-stats scroll-area" style="max-height: 300px; padding: 1rem;">
                    ${stats.byPlace.map(place => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid var(--border-soft);">
                            <span style="font-weight: 600;">${place.code}</span>
                            <span>${place.count} шт.</span>
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
window.showContent = async function(contentType) {
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
                    <div class="page-content">
                        <div id="devices-list"></div>
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
            
        case 'about':
            content = `
                <div class="about-page">
                    <div class="page-header">
                        <h1>О ПРОГРАММЕ</h1>
                    </div>
                    <div class="page-content" style="padding: 2rem;">
                        <h2>Дипломный проект</h2>
                        <p>Данная информационная система представляет собой дипломный проект, выполненный студенткой группы 405ИС-22 Курбатовой Марией Владимировной.</p>
                        <p>Проект посвящен разработке автоматизированной системы управления производственным процессом на предприятии.</p>
                        <br>
                        <h3>О разработчике</h3>
                        <p><strong>Курбатова Мария Владимировна</strong><br>
                        Студентка группы 405ИС-22<br>
                        КМПО РАНХиГС, 2026</p>
                        <br>
                        <p>© 2026 Все права защищены.</p>
                    </div>
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
                break;
            case 'employees':
                loadEmployees();
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
};

// ===== ФУНКЦИИ ДЛЯ ПРОФИЛЯ И НАСТРОЕК =====
window.showTopContent = function(contentType) {
    const contentArea = document.getElementById('content-area');
    let content = '';

    switch(contentType) {
        case 'profile':
            content = `
                <div class="profile-content">
                    <h3>Профиль пользователя</h3>
                    <div class="profile-section">
                        <h4>Личная информация</h4>
                        <div class="profile-info" style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md);">
                            <span style="font-weight: 600;">ФИО:</span>
                            <span>Администратор Системы</span>
                        </div>
                        <div class="profile-info" style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md);">
                            <span style="font-weight: 600;">Должность:</span>
                            <span>Главный администратор</span>
                        </div>
                        <div class="profile-info" style="display: grid; grid-template-columns: 150px 1fr; gap: 1rem; padding: 0.8rem 1rem; background: var(--bg-soft); border-radius: var(--radius-md);">
                            <span style="font-weight: 600;">Логин:</span>
                            <span>admin</span>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'settings':
            content = `
                <div class="settings-content">
                    <h3>Настройки системы</h3>
                    <div class="settings-group">
                        <h4>Тема оформления</h4>
                        <div class="setting-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-soft);">
                            <span>Темная тема</span>
                            <input type="checkbox" onchange="toggleTheme()" ${document.body.classList.contains('theme-dark') ? 'checked' : ''}>
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
    event.currentTarget.classList.add('active');
};

// ===== ПЕРЕКЛЮЧЕНИЕ ТЕМЫ =====
window.toggleTheme = function() {
    const body = document.body;
    if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('theme-dark');
        localStorage.setItem('theme', 'dark');
    }
};

// ===== ВЫХОД =====
window.logout = function() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        window.location.href = '/';
    }
};

// Экспортируем функции в глобальную область
window.addDevice = addDevice;
window.editDevice = editDevice;
window.deleteDevice = deleteDevice;
window.showDeviceDetails = showDeviceDetails;
window.addEmployee = addEmployee;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.addProductType = addProductType;
window.deleteProductType = deleteProductType;
window.addProductionPlace = addProductionPlace;
window.deleteProductionPlace = deleteProductionPlace;
window.addComponent = addComponent;
window.saveComponent = saveComponent;
window.deleteComponent = deleteComponent;
window.closeModal = closeModal;
window.saveDevice = saveDevice;
window.updateDevice = updateDevice;
window.saveEmployee = saveEmployee;
window.updateEmployee = updateEmployee;
window.saveProductType = saveProductType;
window.saveProductionPlace = saveProductionPlace;