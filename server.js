const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

// Настройки подключения к БД
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'istok'
}).promise();

// Проверка подключения к БД
(async () => {
    try {
        await db.query('SELECT 1');
        console.log('✅ Подключение к БД успешно');
    } catch (err) {
        console.error('❌ Ошибка подключения к БД:', err);
    }
})();

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===== АВТОРИЗАЦИЯ =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'autoriation.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [rows] = await db.query(
            'SELECT * FROM employees WHERE username = ? AND password = ?',
            [username, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            res.redirect('/dashboard');
        } else {
            res.send(`
                <script>
                    alert("Неверный логин или пароль!");
                    window.location = "/";
                </script>
            `);
        }
    } catch (error) {
        console.error('Ошибка БД:', error);
        res.send(`
            <script>
                alert("Ошибка сервера. Попробуйте позже.");
                window.location = "/";
            </script>
        `);
    }
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/index.html', (req, res) => {
    res.redirect('/');
});

// ===== API ДЛЯ РАБОТЫ С ДАННЫМИ =====

// ----- УСТРОЙСТВА -----
app.get('/api/devices', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT d.*, 
                   dt.name as device_type_name,
                   dt.code as device_type_code,
                   pp.name as production_place_name,
                   pp.code as production_place_code,
                   pm.name as production_month_name,
                   pm.code as production_month_code,
                   py.name as production_year_name,
                   py.code as production_year_code,
                   ps.name as production_stage_name,
                   ps.code as production_stage_code,
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
        const [rows] = await db.query('SELECT * FROM devices WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Ошибка получения устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/devices', async (req, res) => {
    try {
        const {
            device_type_id, product_serial_number, type,
            version_os, manufactures_date, diag
        } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO devices 
            (device_type_id, product_serial_number, type, version_os, manufactures_date, diag) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [device_type_id, product_serial_number, type, version_os, manufactures_date, diag || false]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Устройство создано'
        });
    } catch (error) {
        console.error('Ошибка создания устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/devices/:id', async (req, res) => {
    try {
        const {
            device_type_id, product_serial_number, type,
            version_os, manufactures_date, diag
        } = req.body;
        
        await db.query(
            `UPDATE devices SET 
            device_type_id = ?, product_serial_number = ?, type = ?,
            version_os = ?, manufactures_date = ?, diag = ?
            WHERE id = ?`,
            [device_type_id, product_serial_number, type, version_os, manufactures_date, diag, req.params.id]
        );
        
        res.json({ message: 'Устройство обновлено' });
    } catch (error) {
        console.error('Ошибка обновления устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/devices/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM devices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Устройство удалено' });
    } catch (error) {
        console.error('Ошибка удаления устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- СОТРУДНИКИ -----
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, last_name, first_name, middle_name, position, username, role FROM employees ORDER BY last_name, first_name');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения сотрудников:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/employees/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, last_name, first_name, middle_name, position, username, role FROM employees WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Ошибка получения сотрудника:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position, username, password, role } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO employees 
            (last_name, first_name, middle_name, position, username, password, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [last_name, first_name, middle_name, position, username, password, role || 'user']
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Сотрудник добавлен'
        });
    } catch (error) {
        console.error('Ошибка добавления сотрудника:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position, username, password, role } = req.body;
        
        let query;
        let params;
        
        if (password) {
            query = `UPDATE employees SET 
                    last_name = ?, first_name = ?, middle_name = ?,
                    position = ?, username = ?, password = ?, role = ?
                    WHERE id = ?`;
            params = [last_name, first_name, middle_name, position, username, password, role, req.params.id];
        } else {
            query = `UPDATE employees SET 
                    last_name = ?, first_name = ?, middle_name = ?,
                    position = ?, username = ?, role = ?
                    WHERE id = ?`;
            params = [last_name, first_name, middle_name, position, username, role, req.params.id];
        }
        
        await db.query(query, params);
        res.json({ message: 'Сотрудник обновлен' });
    } catch (error) {
        console.error('Ошибка обновления сотрудника:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ message: 'Сотрудник удален' });
    } catch (error) {
        console.error('Ошибка удаления сотрудника:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ТИПЫ УСТРОЙСТВ -----
app.get('/api/device-types', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM device_type ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения типов устройств:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/device-types', async (req, res) => {
    try {
        const { name, code } = req.body;
        const [result] = await db.query(
            'INSERT INTO device_type (name, code) VALUES (?, ?)',
            [name, code]
        );
        res.status(201).json({ id: result.insertId, message: 'Тип добавлен' });
    } catch (error) {
        console.error('Ошибка добавления типа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/device-types/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM device_type WHERE id = ?', [req.params.id]);
        res.json({ message: 'Тип удален' });
    } catch (error) {
        console.error('Ошибка удаления типа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- МЕСЯЦЫ ПРОИЗВОДСТВА -----
app.get('/api/production-months', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM production_month ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения месяцев:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ГОДЫ ПРОИЗВОДСТВА -----
app.get('/api/production-years', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM production_year ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения годов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ЭТАПЫ ПРОИЗВОДСТВА -----
app.get('/api/production-stages', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM production_stage ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения этапов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- МЕСТОПОЛОЖЕНИЯ -----
app.get('/api/locations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM location ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения местоположений:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- КОМПЛЕКТУЮЩИЕ (из разных таблиц) -----
app.get('/api/components', async (req, res) => {
    try {
        const [boards] = await db.query(`
            SELECT id, serial_num_board as name, 'Плата' as type, device_id,
                   visual_inspection_author as author, visual_inspection_datetime as date
            FROM serial_num_board
        `);
        
        const [cases] = await db.query(`
            SELECT id, serial_num_case as name, 'Корпус' as type, device_id,
                   NULL as author, NULL as date
            FROM serial_num_case
        `);
        
        const [power] = await db.query(`
            SELECT id, serial_num_bp as name, 'Блок питания' as type, device_id,
                   NULL as author, NULL as date
            FROM serial_num_bp
        `);
        
        const [pcb] = await db.query(`
            SELECT id, serial_num_pcb as name, 'Плата PCB' as type, device_id,
                   NULL as author, NULL as date
            FROM serial_num_pcb
        `);
        
        const [router] = await db.query(`
            SELECT id, serial_num_router as name, 'Маршрутизатор' as type, device_id,
                   NULL as author, NULL as date
            FROM serial_num_router
        `);
        
        const [pki] = await db.query(`
            SELECT id, serial_num_pki as name, 'PKI модуль' as type, device_id,
                   NULL as author, NULL as date
            FROM serial_num_pki
        `);
        
        const [package] = await db.query(`
            SELECT id, serial_num_package as name, 'Упаковка' as type, device_id,
                   NULL as author, NULL as date
            FROM serial_num_package
        `);
        
        const components = [...boards, ...cases, ...power, ...pcb, ...router, ...pki, ...package];
        res.json(components);
    } catch (error) {
        console.error('Ошибка получения комплектующих:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ТИПЫ КОМПЛЕКТУЮЩИХ (для выпадающего списка) -----
app.get('/api/component-types', async (req, res) => {
    try {
        const types = [
            { id: 'board', name: 'Плата', table: 'serial_num_board', field: 'serial_num_board' },
            { id: 'case', name: 'Корпус', table: 'serial_num_case', field: 'serial_num_case' },
            { id: 'power', name: 'Блок питания', table: 'serial_num_bp', field: 'serial_num_bp' },
            { id: 'pcb', name: 'Плата PCB', table: 'serial_num_pcb', field: 'serial_num_pcb' },
            { id: 'router', name: 'Маршрутизатор', table: 'serial_num_router', field: 'serial_num_router' },
            { id: 'pki', name: 'PKI модуль', table: 'serial_num_pki', field: 'serial_num_pki' },
            { id: 'package', name: 'Упаковка', table: 'serial_num_package', field: 'serial_num_package' }
        ];
        res.json(types);
    } catch (error) {
        console.error('Ошибка получения типов комплектующих:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ДОБАВЛЕНИЕ НОВОГО КОМПЛЕКТУЮЩЕГО -----
app.post('/api/components', async (req, res) => {
    try {
        const { type, name, device_id, author } = req.body;
        
        let tableName, fieldName;
        
        // Определяем таблицу и поле в зависимости от типа
        switch(type) {
            case 'board':
                tableName = 'serial_num_board';
                fieldName = 'serial_num_board';
                break;
            case 'case':
                tableName = 'serial_num_case';
                fieldName = 'serial_num_case';
                break;
            case 'power':
                tableName = 'serial_num_bp';
                fieldName = 'serial_num_bp';
                break;
            case 'pcb':
                tableName = 'serial_num_pcb';
                fieldName = 'serial_num_pcb';
                break;
            case 'router':
                tableName = 'serial_num_router';
                fieldName = 'serial_num_router';
                break;
            case 'pki':
                tableName = 'serial_num_pki';
                fieldName = 'serial_num_pki';
                break;
            case 'package':
                tableName = 'serial_num_package';
                fieldName = 'serial_num_package';
                break;
            default:
                return res.status(400).json({ error: 'Неверный тип комплектующего' });
        }
        
        // Для платы добавляем дополнительную информацию
        if (type === 'board') {
            const [result] = await db.query(
                `INSERT INTO ${tableName} 
                (device_id, ${fieldName}, visual_inspection_author, visual_inspection_datetime) 
                VALUES (?, ?, ?, NOW())`,
                [device_id || null, name, author || null]
            );
            res.status(201).json({ id: result.insertId, message: 'Комплектующее добавлено' });
        } else {
            const [result] = await db.query(
                `INSERT INTO ${tableName} (device_id, ${fieldName}) VALUES (?, ?)`,
                [device_id || null, name]
            );
            res.status(201).json({ id: result.insertId, message: 'Комплектующее добавлено' });
        }
    } catch (error) {
        console.error('Ошибка добавления комплектующего:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- УДАЛЕНИЕ КОМПЛЕКТУЮЩЕГО -----
app.delete('/api/components/:id', async (req, res) => {
    try {
        const { type } = req.query;
        const id = req.params.id;
        
        let tableName;
        
        switch(type) {
            case 'board':
                tableName = 'serial_num_board';
                break;
            case 'case':
                tableName = 'serial_num_case';
                break;
            case 'power':
                tableName = 'serial_num_bp';
                break;
            case 'pcb':
                tableName = 'serial_num_pcb';
                break;
            case 'router':
                tableName = 'serial_num_router';
                break;
            case 'pki':
                tableName = 'serial_num_pki';
                break;
            case 'package':
                tableName = 'serial_num_package';
                break;
            default:
                return res.status(400).json({ error: 'Неверный тип комплектующего' });
        }
        
        await db.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.json({ message: 'Комплектующее удалено' });
    } catch (error) {
        console.error('Ошибка удаления комплектующего:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- КОМПЛЕКТУЮЩИЕ ДЛЯ КОНКРЕТНОГО УСТРОЙСТВА -----
app.get('/api/components/device/:deviceId', async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        
        const [boards] = await db.query(`
            SELECT id, serial_num_board as name, 'Плата' as type, device_id,
                   visual_inspection_author as author, visual_inspection_datetime as date
            FROM serial_num_board WHERE device_id = ?
        `, [deviceId]);
        
        const [cases] = await db.query(`
            SELECT id, serial_num_case as name, 'Корпус' as type, device_id
            FROM serial_num_case WHERE device_id = ?
        `, [deviceId]);
        
        const [power] = await db.query(`
            SELECT id, serial_num_bp as name, 'Блок питания' as type, device_id
            FROM serial_num_bp WHERE device_id = ?
        `, [deviceId]);
        
        const components = [...boards, ...cases, ...power];
        res.json(components);
    } catch (error) {
        console.error('Ошибка получения комплектующих устройства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- МЕСТА ПРОИЗВОДСТВА -----
app.get('/api/production-places', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM place_of_production ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения мест производства:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/production-places', async (req, res) => {
    try {
        const { code, name } = req.body;
        const [result] = await db.query(
            'INSERT INTO place_of_production (code, name) VALUES (?, ?)',
            [code, name]
        );
        res.status(201).json({ id: result.insertId, message: 'Место добавлено' });
    } catch (error) {
        console.error('Ошибка добавления места:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/production-places/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM place_of_production WHERE id = ?', [req.params.id]);
        res.json({ message: 'Место удалено' });
    } catch (error) {
        console.error('Ошибка удаления места:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- СБОРЩИКИ -----
app.get('/api/assemblers', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, e.last_name, e.first_name, e.middle_name, d.product_serial_number
            FROM assemblers a
            JOIN employees e ON a.employee_id = e.id
            JOIN devices d ON a.device_id = d.id
            ORDER BY a.assembly_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения сборщиков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ЭЛЕКТРИКИ -----
app.get('/api/electricians', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, emp.last_name, emp.first_name, emp.middle_name, d.product_serial_number
            FROM electricians e
            JOIN employees emp ON e.employee_id = emp.id
            JOIN devices d ON e.device_id = d.id
            ORDER BY e.diagnosis_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения электриков:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- ПСИ ТЕСТЫ -----
app.get('/api/psi-tests', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, emp.last_name, emp.first_name, emp.middle_name, d.product_serial_number
            FROM psi_tests p
            JOIN employees emp ON p.employee_id = emp.id
            JOIN devices d ON p.device_id = d.id
            ORDER BY p.test_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения ПСИ тестов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- MAC-АДРЕСА -----
app.get('/api/macs', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*, d.product_serial_number
            FROM macs m
            JOIN devices d ON m.device_id = d.id
            ORDER BY m.assignment_date DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка получения MAC-адресов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ----- СТАТИСТИКА -----
app.get('/api/statistics', async (req, res) => {
    try {
        const [devices] = await db.query('SELECT COUNT(*) as total FROM devices');
        const [ready] = await db.query(`
            SELECT COUNT(*) as count FROM devices WHERE diag = true
        `);
        const [problems] = await db.query(`
            SELECT COUNT(*) as count FROM devices WHERE diag = false
        `);
        
        const [byType] = await db.query(`
            SELECT dt.name, dt.code, COUNT(d.id) as count
            FROM device_type dt
            LEFT JOIN devices d ON dt.id = d.device_type_id
            GROUP BY dt.id, dt.name, dt.code
        `);
        
        const [byStage] = await db.query(`
            SELECT ps.name, ps.code, COUNT(d.id) as count
            FROM production_stage ps
            LEFT JOIN devices d ON ps.id = d.production_stage_id
            GROUP BY ps.id, ps.name, ps.code
        `);
        
        const [byPlace] = await db.query(`
            SELECT pp.name, pp.code, COUNT(d.id) as count
            FROM place_of_production pp
            LEFT JOIN devices d ON pp.id = d.place_of_production_id
            GROUP BY pp.id, pp.name, pp.code
        `);
        
        const totalDevices = devices[0].total || 0;
        
        const stats = {
            devices: {
                total: totalDevices,
                ready: ready[0].count || 0,
                problems: problems[0].count || 0,
                ready_percentage: totalDevices ? Math.round((ready[0].count || 0) / totalDevices * 100) : 0,
                problems_percentage: totalDevices ? Math.round((problems[0].count || 0) / totalDevices * 100) : 0
            },
            byType: byType,
            byStage: byStage,
            byPlace: byPlace
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== ЗАПУСК СЕРВЕРА =====
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Откройте браузер и перейдите по адресу:`);
    console.log(`http://localhost:${PORT} - страница авторизации`);
});