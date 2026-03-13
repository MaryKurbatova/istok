// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к базе данных
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'istok',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Тестирование подключения
app.get('/api/test', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Подключение к БД успешно' });
    } catch (error) {
        console.error('Ошибка подключения к БД:', error);
        res.status(500).json({ error: 'Ошибка подключения к базе данных' });
    }
});

// ===== API ДЛЯ УСТРОЙСТВ =====
app.get('/api/devices', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, 
                   dt.name as device_type_name,
                   pp.name as production_place_name,
                   pm.name as production_month_name,
                   py.name as production_year_name,
                   ps.name as production_stage_name,
                   l.name as location_name
            FROM devices d
            LEFT JOIN device_type dt ON d.device_type_id = dt.id
            LEFT JOIN place_of_production pp ON d.place_of_production_id = pp.id
            LEFT JOIN production_month pm ON d.production_month_id = pm.id
            LEFT JOIN production_year py ON d.production_year_id = py.id
            LEFT JOIN production_stage ps ON d.production_stage_id = ps.id
            LEFT JOIN location l ON d.actual_location_id = l.id
            ORDER BY d.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения устройств:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/devices/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*, 
                   dt.name as device_type_name,
                   pp.name as production_place_name,
                   pm.name as production_month_name,
                   py.name as production_year_name,
                   ps.name as production_stage_name,
                   l.name as location_name
            FROM devices d
            LEFT JOIN device_type dt ON d.device_type_id = dt.id
            LEFT JOIN place_of_production pp ON d.place_of_production_id = pp.id
            LEFT JOIN production_month pm ON d.production_month_id = pm.id
            LEFT JOIN production_year py ON d.production_year_id = py.id
            LEFT JOIN production_stage ps ON d.production_stage_id = ps.id
            LEFT JOIN location l ON d.actual_location_id = l.id
            WHERE d.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Устройство не найдено' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Ошибка получения устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/devices', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const {
            device_type_id,
            place_of_production_id,
            production_month_id,
            production_year_id,
            production_stage_id,
            actual_location_id,
            bmc_id,
            uboot_id,
            iso_id,
            product_serial_number,
            monthly_sequence,
            manufactures_date,
            type,
            version_os,
            diag,
            date_time_package,
            date_time_pci
        } = req.body;
        
        const [result] = await connection.query(`
            INSERT INTO devices (
                device_type_id, place_of_production_id, production_month_id,
                production_year_id, production_stage_id, actual_location_id,
                bmc_id, uboot_id, iso_id, product_serial_number,
                monthly_sequence, manufactures_date, type, version_os,
                diag, date_time_package, date_time_pci
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            device_type_id, place_of_production_id, production_month_id,
            production_year_id, production_stage_id, actual_location_id,
            bmc_id, uboot_id, iso_id, product_serial_number,
            monthly_sequence, manufactures_date, type, version_os,
            diag, date_time_package, date_time_pci
        ]);
        
        await connection.commit();
        res.status(201).json({ 
            id: result.insertId,
            message: 'Устройство создано',
            serial_number: product_serial_number
        });
    } catch (error) {
        await connection.rollback();
        console.error('Ошибка создания устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        connection.release();
    }
});

// ===== API ДЛЯ СОТРУДНИКОВ =====
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM employees ORDER BY last_name, first_name
        `);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения сотрудников:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO employees (last_name, first_name, middle_name, position)
            VALUES (?, ?, ?, ?)
        `, [last_name, first_name, middle_name, position]);
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Сотрудник добавлен'
        });
    } catch (error) {
        console.error('Ошибка добавления сотрудника:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ ТИПОВ УСТРОЙСТВ =====
app.get('/api/device-types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM device_type ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения типов устройств:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/device-types', async (req, res) => {
    try {
        const { name, code } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO device_type (name, code)
            VALUES (?, ?)
        `, [name, code]);
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Тип устройства добавлен'
        });
    } catch (error) {
        console.error('Ошибка добавления типа устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ КОМПЛЕКТУЮЩИХ =====
app.get('/api/components', async (req, res) => {
    try {
        // В БД нет отдельной таблицы для комплектующих
        // Используем данные из разных таблиц
        const [boards] = await pool.query(`
            SELECT id, serial_num_board as name, 'Плата' as type
            FROM serial_num_board
        `);
        
        const [cases] = await pool.query(`
            SELECT id, serial_num_case as name, 'Корпус' as type
            FROM serial_num_case
        `);
        
        const [power] = await pool.query(`
            SELECT id, serial_num_bp as name, 'Блок питания' as type
            FROM serial_num_bp
        `);
        
        const components = [...boards, ...cases, ...power];
        res.json(components);
    } catch (error) {
        console.error('Ошибка получения комплектующих:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ МЕСТ ПРОИЗВОДСТВА =====
app.get('/api/production-places', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM place_of_production ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения мест производства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/production-places', async (req, res) => {
    try {
        const { code, name } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO place_of_production (code, name)
            VALUES (?, ?)
        `, [code, name]);
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Место производства добавлено'
        });
    } catch (error) {
        console.error('Ошибка добавления места производства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ НОВОСТЕЙ =====
// Создаем таблицу для новостей, если её нет в БД
app.get('/api/news', async (req, res) => {
    try {
        // Проверяем, существует ли таблица news
        const [tables] = await pool.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'news'
        `, [process.env.DB_NAME || 'istok']);
        
        if (tables.length === 0) {
            // Создаем таблицу новостей
            await pool.query(`
                CREATE TABLE IF NOT EXISTS news (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    summary TEXT,
                    content TEXT,
                    category VARCHAR(50) DEFAULT 'system',
                    visibility VARCHAR(50) DEFAULT 'all',
                    pinned BOOLEAN DEFAULT FALSE,
                    status VARCHAR(50) DEFAULT 'active',
                    publish_date DATETIME,
                    expire_date DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            // Добавляем тестовые новости
            await pool.query(`
                INSERT INTO news (title, summary, content, category, visibility, pinned, status, publish_date) VALUES
                ('В системе появился новый тип устройств "СГ-Монитор"', 
                 'Добавлена поддержка измерительных систем серии SG.',
                 '<h2>Новые возможности</h2><ul><li>Автоматическая генерация серийных номеров</li><li>Шаблоны конфигураций</li><li>Расширенная статистика</li></ul>',
                 'system', 'all', TRUE, 'active', NOW()),
                ('Обновление системы до версии 2.1.0',
                 'Выпущено крупное обновление системы.',
                 '<strong>Что нового:</strong><ul><li>Улучшенный интерфейс управления устройствами</li><li>Новые типы отчетов</li><li>Оптимизация производительности</li></ul>',
                 'updates', 'admins', FALSE, 'active', DATE_SUB(NOW(), INTERVAL 5 DAY)),
                ('Запуск новой производственной линии',
                 'С сегодняшнего дня начинает работу новая производственная линия.',
                 NULL,
                 'production', 'all', FALSE, 'active', DATE_SUB(NOW(), INTERVAL 10 DAY))
            `);
        }
        
        const [rows] = await pool.query(`
            SELECT * FROM news ORDER BY pinned DESC, publish_date DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения новостей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        const {
            title,
            summary,
            content,
            category,
            visibility,
            pinned,
            status,
            publish_date,
            expire_date
        } = req.body;
        
        const [result] = await pool.query(`
            INSERT INTO news (title, summary, content, category, visibility, pinned, status, publish_date, expire_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, summary, content, category || 'system', 
            visibility || 'all', pinned || false, status || 'active',
            publish_date || new Date(), expire_date
        ]);
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Новость опубликована'
        });
    } catch (error) {
        console.error('Ошибка добавления новости:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/news/:id/toggle-archive', async (req, res) => {
    try {
        const [news] = await pool.query('SELECT status FROM news WHERE id = ?', [req.params.id]);
        
        if (news.length === 0) {
            return res.status(404).json({ error: 'Новость не найдена' });
        }
        
        const newStatus = news[0].status === 'archived' ? 'active' : 'archived';
        
        await pool.query('UPDATE news SET status = ? WHERE id = ?', [newStatus, req.params.id]);
        
        res.json({ message: 'Статус новости изменен' });
    } catch (error) {
        console.error('Ошибка изменения статуса новости:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
        res.json({ message: 'Новость удалена' });
    } catch (error) {
        console.error('Ошибка удаления новости:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ СТАТИСТИКИ =====
app.get('/api/statistics', async (req, res) => {
    try {
        const { period } = req.query;
        
        // Общая статистика устройств
        const [devices] = await pool.query('SELECT COUNT(*) as total FROM devices');
        const [ready] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM devices d
            JOIN production_stage ps ON d.production_stage_id = ps.id
            WHERE ps.name = 'production'
        `);
        const [problems] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM device_error 
            WHERE status = false
        `);
        
        // Статистика по типам устройств
        const [typeStats] = await pool.query(`
            SELECT dt.name, dt.code, COUNT(d.id) as count
            FROM device_type dt
            LEFT JOIN devices d ON dt.id = d.device_type_id
            GROUP BY dt.id, dt.name, dt.code
        `);
        
        // Статистика брака
        const [defectStats] = await pool.query(`
            SELECT 
                dt.name,
                dt.code,
                COUNT(d.id) as total,
                SUM(CASE WHEN de.id IS NOT NULL THEN 1 ELSE 0 END) as defects
            FROM device_type dt
            LEFT JOIN devices d ON dt.id = d.device_type_id
            LEFT JOIN device_error de ON d.id = de.device_id
            GROUP BY dt.id, dt.name, dt.code
        `);
        
        const totalDevices = devices[0].total || 0;
        
        const stats = {
            devices: {
                total: totalDevices,
                ready: ready[0].count || 0,
                problems: problems[0].count || 0,
                in_work: Math.floor(totalDevices * 0.15), // Примерные данные
                warehouse: Math.floor(totalDevices * 0.14), // Примерные данные
                ready_percentage: totalDevices ? Math.round((ready[0].count || 0) / totalDevices * 100) : 0,
                in_work_percentage: 15,
                problems_percentage: totalDevices ? Math.round((problems[0].count || 0) / totalDevices * 100) : 0,
                warehouse_percentage: 14
            },
            types: typeStats,
            defects: defectStats.map(item => ({
                ...item,
                defect_percentage: item.total ? Math.round(item.defects / item.total * 100 * 10) / 10 : 0
            }))
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ ПОЛЬЗОВАТЕЛЯ =====
app.get('/api/user/current', async (req, res) => {
    // Временные данные пользователя
    res.json({
        id: 1,
        first_name: 'Иван',
        last_name: 'Иванов',
        middle_name: 'Иванович',
        position: 'Администратор',
        email: 'ivan@company.com',
        phone: '+7 (999) 123-45-67'
    });
});

app.post('/api/logout', (req, res) => {
    res.json({ message: 'Выход выполнен' });
});

// ===== ЗАПУСК СЕРВЕРА =====
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});