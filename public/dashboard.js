// public/dashboard.js
// Клиентская логика для связи с сервером

// ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
const AppState = {
    currentUser: null,
    currentTheme: localStorage.getItem('theme') || 'light',
    currentContent: 'news',
    currentTopContent: 'profile',
    devices: [],
    employees: [],
    news: [],
    components: []
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    // Загрузка темы
    if (AppState.currentTheme === 'dark') {
        document.body.classList.add('theme-dark');
    }
    
    // Загрузка данных с сервера
    await loadInitialData();
    
    // Показываем контент по умолчанию
    showContent('news');
    
    // Устанавливаем обработчики событий
    setupEventListeners();
});

// ===== ЗАГРУЗКА ДАННЫХ С СЕРВЕРА =====
async function loadInitialData() {
    try {
        // Загрузка данных пользователя (пример)
        const userResponse = await fetch('/api/user/current');
        if (userResponse.ok) {
            AppState.currentUser = await userResponse.json();
            updateUserInfo();
        }
        
        // Загрузка устройств
        const devicesResponse = await fetch('/api/devices');
        if (devicesResponse.ok) {
            AppState.devices = await devicesResponse.json();
        }
        
        // Загрузка сотрудников
        const employeesResponse = await fetch('/api/employees');
        if (employeesResponse.ok) {
            AppState.employees = await employeesResponse.json();
        }
        
        // Загрузка новостей
        const newsResponse = await fetch('/api/news');
        if (newsResponse.ok) {
            AppState.news = await newsResponse.json();
        }
        
        // Загрузка комплектующих
        const componentsResponse = await fetch('/api/components');
        if (componentsResponse.ok) {
            AppState.components = await componentsResponse.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

// ===== ОБНОВЛЕНИЕ ИНФОРМАЦИИ ПОЛЬЗОВАТЕЛЯ =====
function updateUserInfo() {
    if (AppState.currentUser) {
        const userNameElement = document.querySelector('.user-name');
        const userRoleElement = document.querySelector('.user-role');
        
        if (userNameElement) {
            userNameElement.textContent = `${AppState.currentUser.first_name} ${AppState.currentUser.last_name}`;
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = AppState.currentUser.position || 'Администратор';
        }
    }
}

// ===== УСТАНОВКА ОБРАБОТЧИКОВ СОБЫТИЙ =====
function setupEventListeners() {
    // Поиск по новостям
    const newsSearch = document.getElementById('newsSearch');
    if (newsSearch) {
        newsSearch.addEventListener('input', debounce(searchNews, 300));
    }
    
    // Фильтры новостей
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterNews);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterNews);
    }
    
    // Поиск устройств
    const devicesSearch = document.getElementById('devicesSearch');
    if (devicesSearch) {
        devicesSearch.addEventListener('input', debounce(searchDevices, 300));
    }
    
    // Фильтры устройств
    const deviceTypeFilter = document.getElementById('deviceTypeFilter');
    const deviceStatusFilter = document.getElementById('statusFilter');
    const locationFilter = document.getElementById('locationFilter');
    
    if (deviceTypeFilter) {
        deviceTypeFilter.addEventListener('change', filterDevices);
    }
    
    if (deviceStatusFilter) {
        deviceStatusFilter.addEventListener('change', filterDevices);
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', filterDevices);
    }
}

// ===== ФУНКЦИИ ДЛЯ НОВОСТЕЙ =====
async function loadNews() {
    try {
        const response = await fetch('/api/news');
        if (response.ok) {
            AppState.news = await response.json();
            renderNews();
        }
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
    }
}

function renderNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    const pinnedNews = AppState.news.filter(news => news.pinned);
    const regularNews = AppState.news.filter(news => !news.pinned && news.status !== 'archived');
    const archivedNews = AppState.news.filter(news => news.status === 'archived');
    
    let html = '';
    
    // Закрепленные новости
    if (pinnedNews.length > 0) {
        html += '<div class="pinned-news">';
        pinnedNews.forEach(news => {
            html += renderNewsItem(news, true);
        });
        html += '</div>';
    }
    
    // Обычные новости
    if (regularNews.length > 0) {
        html += '<div class="regular-news">';
        regularNews.forEach(news => {
            html += renderNewsItem(news, false);
        });
        html += '</div>';
    }
    
    // Архивные новости
    if (archivedNews.length > 0 && document.getElementById('statusFilter')?.value === 'archived') {
        html += '<div class="archived-news">';
        archivedNews.forEach(news => {
            html += renderNewsItem(news, false, true);
        });
        html += '</div>';
    }
    
    newsContainer.innerHTML = html;
}

function renderNewsItem(news, pinned = false, archived = false) {
    const pinnedClass = pinned ? 'pinned' : '';
    const archivedClass = archived ? 'archived' : '';
    
    return `
        <div class="news-item ${pinnedClass} ${archivedClass}" data-id="${news.id}">
            ${pinned ? '<div class="news-badge pinned">Закреплено</div>' : ''}
            ${archived ? '<div class="news-badge archived">В архиве</div>' : ''}
            <div class="news-header">
                <h3 class="news-title">${news.title}</h3>
                <div class="news-meta">
                    <span class="news-date">${formatDate(news.publish_date)}</span>
                    <span class="news-category">${news.category}</span>
                </div>
            </div>
            <div class="news-content">
                <p>${news.summary}</p>
                ${news.content ? `<div class="news-preview">${news.content}</div>` : ''}
            </div>
            <div class="news-footer">
                <div class="news-visibility">
                    <span class="visibility-badge ${news.visibility}">${getVisibilityText(news.visibility)}</span>
                </div>
                <div class="news-actions">
                    <button class="action-btn edit" onclick="editNews(${news.id})">✎</button>
                    <button class="action-btn archive" onclick="toggleArchive(${news.id})">${archived ? '↩' : '📋'}</button>
                    <button class="action-btn delete" onclick="deleteNews(${news.id})">✕</button>
                </div>
            </div>
        </div>
    `;
}

function getVisibilityText(visibility) {
    const map = {
        'all': 'Для всех',
        'admins': 'Для администраторов',
        'managers': 'Для менеджеров',
        'operators': 'Для операторов'
    };
    return map[visibility] || visibility;
}

async function searchNews() {
    const searchTerm = document.getElementById('newsSearch')?.value.toLowerCase();
    if (!searchTerm) {
        renderNews();
        return;
    }
    
    const filtered = AppState.news.filter(news => 
        news.title.toLowerCase().includes(searchTerm) || 
        news.summary?.toLowerCase().includes(searchTerm) ||
        news.content?.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredNews(filtered);
}

function renderFilteredNews(filteredNews) {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    let html = '<div class="regular-news">';
    filteredNews.forEach(news => {
        html += renderNewsItem(news, news.pinned, news.status === 'archived');
    });
    html += '</div>';
    
    newsContainer.innerHTML = html;
}

function filterNews() {
    const category = document.getElementById('categoryFilter')?.value;
    const status = document.getElementById('statusFilter')?.value;
    
    let filtered = AppState.news;
    
    if (category) {
        filtered = filtered.filter(news => news.category === category);
    }
    
    if (status) {
        if (status === 'active') {
            filtered = filtered.filter(news => !news.pinned && news.status !== 'archived');
        } else if (status === 'pinned') {
            filtered = filtered.filter(news => news.pinned);
        } else if (status === 'archived') {
            filtered = filtered.filter(news => news.status === 'archived');
        }
    }
    
    renderFilteredNews(filtered);
}

async function publishNews() {
    const title = document.getElementById('newsTitle')?.value;
    const summary = document.getElementById('newsDescription')?.value;
    const content = document.getElementById('newsContent')?.innerHTML;
    const visibility = document.getElementById('newsVisibility')?.value;
    const publishDate = document.getElementById('publishDate')?.value;
    const expireDate = document.getElementById('expireDate')?.value;
    const sendNotification = document.getElementById('sendNotification')?.checked;
    const pinNews = document.getElementById('pinNews')?.checked;
    
    if (!title) {
        showNotification('Введите заголовок новости', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                summary,
                content,
                visibility,
                publish_date: publishDate,
                expire_date: expireDate,
                pinned: pinNews,
                send_notification: sendNotification
            })
        });
        
        if (response.ok) {
            showNotification('Новость опубликована', 'success');
            await loadNews();
            showContent('news');
        } else {
            showNotification('Ошибка публикации', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка подключения к серверу', 'error');
    }
}

async function editNews(id) {
    const news = AppState.news.find(n => n.id === id);
    if (!news) return;
    
    // Здесь можно открыть модальное окно или перейти на страницу редактирования
    console.log('Редактирование новости:', news);
    showNotification('Редактирование временно недоступно', 'info');
}

async function toggleArchive(id) {
    try {
        const response = await fetch(`/api/news/${id}/toggle-archive`, {
            method: 'POST'
        });
        
        if (response.ok) {
            await loadNews();
            showNotification('Статус новости изменен', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при изменении статуса', 'error');
    }
}

async function deleteNews(id) {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    try {
        const response = await fetch(`/api/news/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadNews();
            showNotification('Новость удалена', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при удалении', 'error');
    }
}

// ===== ФУНКЦИИ ДЛЯ УСТРОЙСТВ =====
async function loadDevices() {
    try {
        const response = await fetch('/api/devices');
        if (response.ok) {
            AppState.devices = await response.json();
        }
    } catch (error) {
        console.error('Ошибка загрузки устройств:', error);
    }
}

function searchDevices() {
    const searchTerm = document.getElementById('devicesSearch')?.value.toLowerCase();
    // Логика поиска устройств
}

function filterDevices() {
    const type = document.getElementById('deviceTypeFilter')?.value;
    const status = document.getElementById('statusFilter')?.value;
    const location = document.getElementById('locationFilter')?.value;
    // Логика фильтрации устройств
}

async function createDevice() {
    const deviceType = document.getElementById('deviceType')?.value;
    const config = document.getElementById('deviceConfig')?.value;
    
    // Сбор данных о выбранных комплектующих
    const selectedComponents = [];
    document.querySelectorAll('.component-item.selected').forEach(item => {
        const name = item.querySelector('.component-name')?.textContent;
        if (name) selectedComponents.push(name);
    });
    
    try {
        const response = await fetch('/api/devices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: deviceType,
                config,
                components: selectedComponents
            })
        });
        
        if (response.ok) {
            const device = await response.json();
            document.getElementById('serialNumber').value = device.serial_number;
            showNotification('Устройство создано', 'success');
            await loadDevices();
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка создания устройства', 'error');
    }
}

function selectComponent(componentId) {
    const component = document.querySelector(`.component-card[data-id="${componentId}"]`);
    if (!component) return;
    
    const name = component.querySelector('.component-name')?.textContent;
    
    // Добавление компонента в список выбранных
    const componentsList = document.querySelector('.components-list');
    if (componentsList) {
        const newItem = document.createElement('div');
        newItem.className = 'component-item selected';
        newItem.innerHTML = `
            <span class="component-status">✓</span>
            <span class="component-name">${name}</span>
            <button class="remove-btn" onclick="removeComponent('${componentId}')">✕</button>
        `;
        componentsList.appendChild(newItem);
    }
    
    // Удаление компонента из доступных
    component.remove();
}

function removeComponent(componentId) {
    const componentItem = document.querySelector(`.component-item .component-name:contains("${componentId}")`)?.closest('.component-item');
    if (componentItem) {
        const name = componentItem.querySelector('.component-name')?.textContent;
        componentItem.remove();
        
        // Возврат компонента в доступные
        const availableComponents = document.querySelector('.available-components');
        if (availableComponents) {
            // Здесь логика возврата компонента
        }
    }
}

// ===== ФУНКЦИИ ДЛЯ СОТРУДНИКОВ =====
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        if (response.ok) {
            AppState.employees = await response.json();
            renderEmployeesTable();
        }
    } catch (error) {
        console.error('Ошибка загрузки сотрудников:', error);
    }
}

function renderEmployeesTable() {
    const tableContainer = document.querySelector('.employees-table-container');
    if (!tableContainer) return;
    
    let html = `
        <table class="employees-table">
            <thead>
                <tr>
                    <th>ФИО</th>
                    <th>Должность</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    AppState.employees.forEach(employee => {
        html += `
            <tr>
                <td>${employee.last_name} ${employee.first_name} ${employee.middle_name || ''}</td>
                <td>${employee.position}</td>
                <td><span class="status-active">Активен</span></td>
                <td>
                    <button class="action-btn edit" onclick="editEmployee(${employee.id})">✎</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function addEmployee() {
    // Логика добавления сотрудника
    showNotification('Функция добавления сотрудника', 'info');
}

function editEmployee(id) {
    console.log('Редактирование сотрудника:', id);
    showNotification('Редактирование временно недоступно', 'info');
}

// ===== ФУНКЦИИ ДЛЯ ТИПОВ ИЗДЕЛИЙ =====
async function saveProductType() {
    const code = document.getElementById('typeCode')?.value;
    const prefix = document.getElementById('typePrefix')?.value;
    const name = document.getElementById('typeName')?.value;
    const category = document.getElementById('typeCategory')?.value;
    
    if (!code || !name) {
        showNotification('Заполните обязательные поля', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/device-types', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, prefix, name, category })
        });
        
        if (response.ok) {
            showNotification('Тип изделия сохранен', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сохранения', 'error');
    }
}

// ===== ФУНКЦИИ ДЛЯ КОМПЛЕКТУЮЩИХ =====
async function saveComponent() {
    const name = document.getElementById('componentName')?.value;
    const modelCode = document.getElementById('modelCode')?.value;
    const manufacturer = document.getElementById('manufacturer')?.value;
    const type = document.getElementById('componentType')?.value;
    const version = document.getElementById('componentVersion')?.value;
    const lifespan = document.getElementById('lifespan')?.value;
    const warranty = document.getElementById('warranty')?.value;
    const description = document.getElementById('componentDescription')?.value;
    
    if (!name || !modelCode) {
        showNotification('Заполните обязательные поля', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/components', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                model_code: modelCode,
                manufacturer,
                type,
                version,
                lifespan,
                warranty,
                description
            })
        });
        
        if (response.ok) {
            showNotification('Комплектующее сохранено', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сохранения', 'error');
    }
}

// ===== ФУНКЦИИ ДЛЯ МЕСТ ПРОИЗВОДСТВА =====
async function saveProductionPlace() {
    const name = document.getElementById('placeName')?.value;
    const code = document.getElementById('workshopCode')?.value;
    const address = document.getElementById('placeAddress')?.value;
    const responsible = document.getElementById('responsiblePerson')?.value;
    const type = document.getElementById('productionType')?.value;
    const status = document.getElementById('placeStatus')?.value;
    const phone = document.getElementById('contactPhone')?.value;
    
    if (!name || !code) {
        showNotification('Заполните обязательные поля', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/production-places', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                code,
                address,
                responsible_person: responsible,
                production_type: type,
                status,
                contact_phone: phone
            })
        });
        
        if (response.ok) {
            showNotification('Место производства сохранено', 'success');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка сохранения', 'error');
    }
}

// ===== ФУНКЦИИ ДЛЯ СТАТИСТИКИ =====
async function loadStatistics() {
    const period = document.getElementById('statsPeriod')?.value;
    
    try {
        const response = await fetch(`/api/statistics?period=${period}`);
        if (response.ok) {
            const stats = await response.json();
            updateStatisticsUI(stats);
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

function updateStatisticsUI(stats) {
    // Обновление карточек статистики
    const readyCard = document.querySelector('.stat-card.ready .stat-number');
    if (readyCard) readyCard.textContent = stats.devices.ready;
    
    const inWorkCard = document.querySelector('.stat-card.in-work .stat-number');
    if (inWorkCard) inWorkCard.textContent = stats.devices.in_work;
    
    const problemsCard = document.querySelector('.stat-card.problems .stat-number');
    if (problemsCard) problemsCard.textContent = stats.devices.problems;
    
    const warehouseCard = document.querySelector('.stat-card.warehouse .stat-number');
    if (warehouseCard) warehouseCard.textContent = stats.devices.warehouse;
    
    // Обновление прогресс-баров
    updateProgressBar('ready', stats.devices.ready_percentage);
    updateProgressBar('in-work', stats.devices.in_work_percentage);
    updateProgressBar('problems', stats.devices.problems_percentage);
    updateProgressBar('warehouse', stats.devices.warehouse_percentage);
}

function updateProgressBar(type, percentage) {
    const bar = document.querySelector(`.progress-fill.${type}`);
    if (bar) {
        bar.style.width = `${percentage}%`;
        const label = bar.closest('.progress-item')?.querySelector('.progress-label span:last-child');
        if (label) label.textContent = `${percentage}%`;
    }
}

// ===== ФУНКЦИИ ДЛЯ ПРОФИЛЯ И НАСТРОЕК =====
function logout() {
    if (confirm('Вы уверены, что хотите выйти из системы?')) {
        fetch('/api/logout', { method: 'POST' })
            .then(() => {
                window.location.href = '/login.html';
            })
            .catch(error => {
                console.error('Ошибка:', error);
                window.location.href = '/login.html';
            });
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showNotification(message, type = 'info') {
    // Создание уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
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
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== СОХРАНЕНИЕ ОРИГИНАЛЬНЫХ ФУНКЦИЙ =====
// Сохраняем оригинальные функции из HTML
window.toggleTheme = function() {
    const body = document.body;
    if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        localStorage.setItem('theme', 'light');
        AppState.currentTheme = 'light';
    } else {
        body.classList.add('theme-dark');
        localStorage.setItem('theme', 'dark');
        AppState.currentTheme = 'dark';
    }
};

window.showContent = async function(contentType) {
    AppState.currentContent = contentType;
    
    // Загружаем данные в зависимости от типа контента
    switch(contentType) {
        case 'news':
            await loadNews();
            break;
        case 'devices':
            await loadDevices();
            break;
        case 'employees':
            await loadEmployees();
            break;
        case 'statistic':
            await loadStatistics();
            break;
    }
    
    // Вызываем оригинальную функцию из HTML
    // Она уже определена в HTML, поэтому просто вызываем её
    if (typeof window.originalShowContent === 'function') {
        window.originalShowContent(contentType);
    } else {
        // Если оригинальная функция не сохранена, используем встроенную
        const contentArea = document.getElementById('content-area');
        if (contentArea && contentType === 'news') {
            // Обновляем контент с данными
            const newsContent = document.getElementById('news-content');
            if (newsContent) {
                renderNews();
            }
        }
    }
};

window.showTopContent = function(contentType) {
    AppState.currentTopContent = contentType;
    // Вызываем оригинальную функцию из HTML
    if (typeof window.originalShowTopContent === 'function') {
        window.originalShowTopContent(contentType);
    }
};

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Экспортируем функции в глобальную область
window.publishNews = publishNews;
window.editNews = editNews;
window.toggleArchive = toggleArchive;
window.deleteNews = deleteNews;
window.createDevice = createDevice;
window.selectComponent = selectComponent;
window.removeComponent = removeComponent;
window.addEmployee = addEmployee;
window.editEmployee = editEmployee;
window.saveProductType = saveProductType;
window.saveComponent = saveComponent;
window.saveProductionPlace = saveProductionPlace;
window.logout = logout;