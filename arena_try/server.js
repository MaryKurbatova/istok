const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Создание директорий
['uploads', 'images'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images'));

// Multer для загрузки изображений
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const types = /jpeg|jpg|png|gif|webp/;
        const extname = types.test(path.extname(file.originalname).toLowerCase());
        const mimetype = types.test(file.mimetype);
        if (extname && mimetype) cb(null, true);
        else cb(new Error('Только изображения!'));
    }
});

// Подключение к БД
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'istok',
    waitForConnections: true,
    connectionLimit: 10
});

// Хранение сессий
const sessions = new Map();

// Генерация токена
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware авторизации
function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '') ||
                  req.query.token;
    if (!token || !sessions.has(token)) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    req.user = sessions.get(token);
    req.token = token;
    next();
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
}

function canEdit(req, res, next) {
    if (req.user.role === 'operator') {
        return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
}

// ======== СТАТИЧЕСКИЕ СТРАНИЦЫ ========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'autoriation.html'));
});

app.get('/auto.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'auto.css'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/dashboard.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.css'));
});

app.get('/dashboard.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.js'));
});

// ======== АВТОРИЗАЦИЯ ========
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.query(
            'SELECT * FROM employees WHERE username = ? AND password = ?',
            [username, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        const user = rows[0];
        const token = generateToken();
        sessions.set(token, {
            id: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            middleName: user.middle_name,
            position: user.position,
            role: user.role
        });
        res.json({ token, user: sessions.get(token) });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/current-user', authMiddleware, (req, res) => {
    res.json(req.user);
});

app.post('/api/logout', authMiddleware, (req, res) => {
    sessions.delete(req.token);
    res.json({ message: 'Выход выполнен' });
});

// ======== УСТРОЙСТВА ========
app.get('/api/devices', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*,
                dt.name as device_type_name, dt.code as device_type_code,
                pp.name as place_name, pp.code as place_code,
                pm.name as month_name, pm.code as month_code,
                py.name as year_name, py.code as year_code,
                ps.name as stage_name, ps.code as stage_code, ps.description as stage_description,
                l.name as location_name,
                b.version_bmc, b.file_bmc,
                u.version_uboot, u.file_uboot,
                i.version_iso, i.file_iso,
                snb.serial_num_board, snb.visual_inspection, snb.visual_inspection_author, snb.visual_inspection_datetime,
                snpcb.serial_num_pcb,
                snr.serial_num_router,
                snpki.serial_num_pki,
                snbp.serial_num_bp,
                snpkg.serial_num_package,
                snc.serial_num_case
            FROM devices d
            LEFT JOIN device_type dt ON d.device_type_id = dt.id
            LEFT JOIN place_of_production pp ON d.place_of_production_id = pp.id
            LEFT JOIN production_month pm ON d.production_month_id = pm.id
            LEFT JOIN production_year py ON d.production_year_id = py.id
            LEFT JOIN production_stage ps ON d.production_stage_id = ps.id
            LEFT JOIN location l ON d.actual_location_id = l.id
            LEFT JOIN bmc b ON d.bmc_id = b.id
            LEFT JOIN uboot u ON d.uboot_id = u.id
            LEFT JOIN iso i ON d.iso_id = i.id
            LEFT JOIN serial_num_board snb ON d.serial_num_board_id = snb.id
            LEFT JOIN serial_num_pcb snpcb ON d.serial_num_pcb_id = snpcb.id
            LEFT JOIN serial_num_router snr ON d.serial_num_router_id = snr.id
            LEFT JOIN serial_num_pki snpki ON d.serial_num_pki_id = snpki.id
            LEFT JOIN serial_num_bp snbp ON d.serial_num_bp_id = snbp.id
            LEFT JOIN serial_num_package snpkg ON d.serial_num_package_id = snpkg.id
            LEFT JOIN serial_num_case snc ON d.serial_num_case_id = snc.id
            ORDER BY d.id
        `);

        // Получаем MAC-адреса для каждого устройства
        for (let device of rows) {
            const [macs] = await pool.query(
                'SELECT * FROM macs WHERE device_id = ?', [device.id]
            );
            device.macs = macs;

            const [assemblers] = await pool.query(`
                SELECT a.*, e.last_name, e.first_name, e.middle_name
                FROM assemblers a
                LEFT JOIN employees e ON a.employee_id = e.id
                WHERE a.device_id = ?
            `, [device.id]);
            device.assemblers = assemblers;

            const [electricians] = await pool.query(`
                SELECT el.*, e.last_name, e.first_name, e.middle_name
                FROM electricians el
                LEFT JOIN employees e ON el.employee_id = e.id
                WHERE el.device_id = ?
            `, [device.id]);
            device.electricians = electricians;

            const [psiTests] = await pool.query(`
                SELECT p.*, e.last_name, e.first_name, e.middle_name
                FROM psi_tests p
                LEFT JOIN employees e ON p.employee_id = e.id
                WHERE p.device_id = ?
            `, [device.id]);
            device.psi_tests = psiTests;

            const [programmers] = await pool.query(
                'SELECT * FROM programmers WHERE device_id = ?', [device.id]
            );
            device.programmers = programmers;

            const [history] = await pool.query(
                'SELECT * FROM history WHERE device_id = ? ORDER BY id DESC', [device.id]
            );
            device.history = history;

            const [errors] = await pool.query(
                'SELECT * FROM device_error WHERE device_id = ?', [device.id]
            );
            device.errors = errors;

            const [repairs] = await pool.query(
                'SELECT * FROM repair WHERE device_id = ?', [device.id]
            );
            device.repairs = repairs;

            const [xrays] = await pool.query(
                'SELECT * FROM xray WHERE device_id = ?', [device.id]
            );
            device.xrays = xrays;
        }

        res.json(rows);
    } catch (err) {
        console.error('Get devices error:', err);
        res.status(500).json({ error: 'Ошибка получения устройств' });
    }
});

app.get('/api/devices/:id', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT d.*,
                dt.name as device_type_name, dt.code as device_type_code,
                pp.name as place_name, pp.code as place_code,
                pm.name as month_name, pm.code as month_code,
                py.name as year_name, py.code as year_code,
                ps.name as stage_name, ps.code as stage_code,
                l.name as location_name,
                b.version_bmc, u.version_uboot, i.version_iso,
                snb.serial_num_board, snpcb.serial_num_pcb,
                snr.serial_num_router, snpki.serial_num_pki,
                snbp.serial_num_bp, snpkg.serial_num_package, snc.serial_num_case
            FROM devices d
            LEFT JOIN device_type dt ON d.device_type_id = dt.id
            LEFT JOIN place_of_production pp ON d.place_of_production_id = pp.id
            LEFT JOIN production_month pm ON d.production_month_id = pm.id
            LEFT JOIN production_year py ON d.production_year_id = py.id
            LEFT JOIN production_stage ps ON d.production_stage_id = ps.id
            LEFT JOIN location l ON d.actual_location_id = l.id
            LEFT JOIN bmc b ON d.bmc_id = b.id
            LEFT JOIN uboot u ON d.uboot_id = u.id
            LEFT JOIN iso i ON d.iso_id = i.id
            LEFT JOIN serial_num_board snb ON d.serial_num_board_id = snb.id
            LEFT JOIN serial_num_pcb snpcb ON d.serial_num_pcb_id = snpcb.id
            LEFT JOIN serial_num_router snr ON d.serial_num_router_id = snr.id
            LEFT JOIN serial_num_pki snpki ON d.serial_num_pki_id = snpki.id
            LEFT JOIN serial_num_bp snbp ON d.serial_num_bp_id = snbp.id
            LEFT JOIN serial_num_package snpkg ON d.serial_num_package_id = snpkg.id
            LEFT JOIN serial_num_case snc ON d.serial_num_case_id = snc.id
            WHERE d.id = ?
        `, [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Устройство не найдено' });

        const device = rows[0];
        const [macs] = await pool.query('SELECT * FROM macs WHERE device_id = ?', [device.id]);
        device.macs = macs;

        const [assemblers] = await pool.query(`
            SELECT a.*, e.last_name, e.first_name, e.middle_name
            FROM assemblers a LEFT JOIN employees e ON a.employee_id = e.id
            WHERE a.device_id = ?
        `, [device.id]);
        device.assemblers = assemblers;

        const [electricians] = await pool.query(`
            SELECT el.*, e.last_name, e.first_name, e.middle_name
            FROM electricians el LEFT JOIN employees e ON el.employee_id = e.id
            WHERE el.device_id = ?
        `, [device.id]);
        device.electricians = electricians;

        const [psiTests] = await pool.query(`
            SELECT p.*, e.last_name, e.first_name, e.middle_name
            FROM psi_tests p LEFT JOIN employees e ON p.employee_id = e.id
            WHERE p.device_id = ?
        `, [device.id]);
        device.psi_tests = psiTests;

        const [history] = await pool.query('SELECT * FROM history WHERE device_id = ? ORDER BY id DESC', [device.id]);
        device.history = history;

        const [errors] = await pool.query('SELECT * FROM device_error WHERE device_id = ?', [device.id]);
        device.errors = errors;

        const [repairs] = await pool.query('SELECT * FROM repair WHERE device_id = ?', [device.id]);
        device.repairs = repairs;

        res.json(device);
    } catch (err) {
        console.error('Get device error:', err);
        res.status(500).json({ error: 'Ошибка получения устройства' });
    }
});

app.post('/api/devices', authMiddleware, canEdit, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const {
            device_type_id, place_of_production_id, production_month_id,
            production_year_id, production_stage_id, actual_location_id,
            bmc_id, uboot_id, iso_id, product_serial_number,
            monthly_sequence, manufactures_date, type, version_os, diag
        } = req.body;

        const [result] = await conn.query(`
            INSERT INTO devices (device_type_id, place_of_production_id, production_month_id,
                production_year_id, production_stage_id, actual_location_id, bmc_id, uboot_id,
                iso_id, product_serial_number, monthly_sequence, manufactures_date, type,
                version_os, diag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [device_type_id, place_of_production_id, production_month_id,
            production_year_id, production_stage_id, actual_location_id,
            bmc_id || null, uboot_id || null, iso_id || null,
            product_serial_number, monthly_sequence, manufactures_date,
            type, version_os, diag || false]);

        const deviceId = result.insertId;

        // Добавляем запись в историю
        await conn.query(`
            INSERT INTO history (device_id, commentary, date_time, device_serial_num, message)
            VALUES (?, 'Устройство создано', NOW(), ?, 'Новое устройство добавлено в систему')
        `, [deviceId, product_serial_number]);

        await conn.commit();
        res.json({ id: deviceId, message: 'Устройство создано' });
    } catch (err) {
        await conn.rollback();
        console.error('Create device error:', err);
        res.status(500).json({ error: 'Ошибка создания устройства' });
    } finally {
        conn.release();
    }
});

app.put('/api/devices/:id', authMiddleware, canEdit, async (req, res) => {
    try {
        const {
            device_type_id, place_of_production_id, production_month_id,
            production_year_id, production_stage_id, actual_location_id,
            bmc_id, uboot_id, iso_id, product_serial_number,
            monthly_sequence, manufactures_date, type, version_os, diag
        } = req.body;

        await pool.query(`
            UPDATE devices SET device_type_id=?, place_of_production_id=?,
                production_month_id=?, production_year_id=?, production_stage_id=?,
                actual_location_id=?, bmc_id=?, uboot_id=?, iso_id=?,
                product_serial_number=?, monthly_sequence=?, manufactures_date=?,
                type=?, version_os=?, diag=?
            WHERE id=?
        `, [device_type_id, place_of_production_id, production_month_id,
            production_year_id, production_stage_id, actual_location_id,
            bmc_id || null, uboot_id || null, iso_id || null,
            product_serial_number, monthly_sequence, manufactures_date,
            type, version_os, diag || false, req.params.id]);

        await pool.query(`
            INSERT INTO history (device_id, commentary, date_time, device_serial_num, message)
            VALUES (?, 'Устройство обновлено', NOW(), ?, 'Данные устройства изменены')
        `, [req.params.id, product_serial_number]);

        res.json({ message: 'Устройство обновлено' });
    } catch (err) {
        console.error('Update device error:', err);
        res.status(500).json({ error: 'Ошибка обновления устройства' });
    }
});

app.delete('/api/devices/:id', authMiddleware, adminOnly, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const id = req.params.id;

        // Удаляем связанные серийные номера
        const serialTables = [
            'serial_num_board', 'serial_num_pcb', 'serial_num_router',
            'serial_num_pki', 'serial_num_bp', 'serial_num_package', 'serial_num_case'
        ];

        // Сначала обнуляем ссылки в devices
        await conn.query(`
            UPDATE devices SET serial_num_board_id=NULL, serial_num_pcb_id=NULL,
                serial_num_router_id=NULL, serial_num_pki_id=NULL, serial_num_bp_id=NULL,
                serial_num_package_id=NULL, serial_num_case_id=NULL,
                eth1addr_id=NULL, eth2addr_id=NULL, ethaddr_id=NULL
            WHERE id=?
        `, [id]);

        for (const table of serialTables) {
            await conn.query(`DELETE FROM ${table} WHERE device_id=?`, [id]);
        }

        // Удаляем связанные записи
        const relatedTables = [
            'macs', 'assemblers', 'electricians', 'psi_tests',
            'programmers', 'statistic', 'history', 'device_error',
            'repair', 'xray'
        ];
        for (const table of relatedTables) {
            await conn.query(`DELETE FROM ${table} WHERE device_id=?`, [id]);
        }

        await conn.query('DELETE FROM devices WHERE id=?', [id]);
        await conn.commit();
        res.json({ message: 'Устройство удалено' });
    } catch (err) {
        await conn.rollback();
        console.error('Delete device error:', err);
        res.status(500).json({ error: 'Ошибка удаления устройства' });
    } finally {
        conn.release();
    }
});

// ======== КОМПЛЕКТУЮЩИЕ ========
app.get('/api/component-types', authMiddleware, (req, res) => {
    res.json([
        { id: 'serial_num_board', name: 'Плата', field: 'serial_num_board' },
        { id: 'serial_num_pcb', name: 'Печатная плата', field: 'serial_num_pcb' },
        { id: 'serial_num_router', name: 'Маршрутизатор', field: 'serial_num_router' },
        { id: 'serial_num_pki', name: 'PKI модуль', field: 'serial_num_pki' },
        { id: 'serial_num_bp', name: 'Блок питания', field: 'serial_num_bp' },
        { id: 'serial_num_package', name: 'Упаковка', field: 'serial_num_package' },
        { id: 'serial_num_case', name: 'Корпус', field: 'serial_num_case' }
    ]);
});

app.get('/api/components', authMiddleware, async (req, res) => {
    try {
        const tables = [
            { table: 'serial_num_board', field: 'serial_num_board', name: 'Плата' },
            { table: 'serial_num_pcb', field: 'serial_num_pcb', name: 'Печатная плата' },
            { table: 'serial_num_router', field: 'serial_num_router', name: 'Маршрутизатор' },
            { table: 'serial_num_pki', field: 'serial_num_pki', name: 'PKI модуль' },
            { table: 'serial_num_bp', field: 'serial_num_bp', name: 'Блок питания' },
            { table: 'serial_num_package', field: 'serial_num_package', name: 'Упаковка' },
            { table: 'serial_num_case', field: 'serial_num_case', name: 'Корпус' }
        ];

        let allComponents = [];
        for (const t of tables) {
            const [rows] = await pool.query(`
                SELECT s.id, s.device_id, s.${t.field} as serial_number,
                    d.product_serial_number as device_serial
                FROM ${t.table} s
                LEFT JOIN devices d ON s.device_id = d.id
            `);
            rows.forEach(r => {
                allComponents.push({
                    ...r,
                    component_type: t.table,
                    component_name: t.name
                });
            });
        }
        res.json(allComponents);
    } catch (err) {
        console.error('Get components error:', err);
        res.status(500).json({ error: 'Ошибка получения комплектующих' });
    }
});

app.get('/api/components/device/:deviceId', authMiddleware, async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const components = {};

        const tables = [
            'serial_num_board', 'serial_num_pcb', 'serial_num_router',
            'serial_num_pki', 'serial_num_bp', 'serial_num_package', 'serial_num_case'
        ];

        for (const table of tables) {
            const [rows] = await pool.query(`SELECT * FROM ${table} WHERE device_id = ?`, [deviceId]);
            components[table] = rows[0] || null;
        }

        const [macs] = await pool.query('SELECT * FROM macs WHERE device_id = ?', [deviceId]);
        components.macs = macs;

        res.json(components);
    } catch (err) {
        console.error('Get device components error:', err);
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/components', authMiddleware, canEdit, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { device_id, component_type, serial_number } = req.body;

        const validTables = [
            'serial_num_board', 'serial_num_pcb', 'serial_num_router',
            'serial_num_pki', 'serial_num_bp', 'serial_num_package', 'serial_num_case'
        ];

        if (!validTables.includes(component_type)) {
            return res.status(400).json({ error: 'Неверный тип компонента' });
        }

        const field = component_type;

        // Проверяем существование
        const [existing] = await conn.query(
            `SELECT id FROM ${component_type} WHERE device_id = ?`, [device_id]
        );

        let componentId;
        if (existing.length > 0) {
            await conn.query(
                `UPDATE ${component_type} SET ${field} = ? WHERE device_id = ?`,
                [serial_number, device_id]
            );
            componentId = existing[0].id;
        } else {
            const [result] = await conn.query(
                `INSERT INTO ${component_type} (device_id, ${field}) VALUES (?, ?)`,
                [device_id, serial_number]
            );
            componentId = result.insertId;

            // Обновляем ссылку в devices
            const fkField = `${component_type}_id`;
            await conn.query(
                `UPDATE devices SET ${fkField} = ? WHERE id = ?`,
                [componentId, device_id]
            );
        }

        await conn.commit();
        res.json({ id: componentId, message: 'Компонент сохранён' });
    } catch (err) {
        await conn.rollback();
        console.error('Save component error:', err);
        res.status(500).json({ error: 'Ошибка сохранения компонента' });
    } finally {
        conn.release();
    }
});

app.delete('/api/components/:type/:id', authMiddleware, adminOnly, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { type, id } = req.params;

        const validTables = [
            'serial_num_board', 'serial_num_pcb', 'serial_num_router',
            'serial_num_pki', 'serial_num_bp', 'serial_num_package', 'serial_num_case'
        ];

        if (!validTables.includes(type)) {
            return res.status(400).json({ error: 'Неверный тип' });
        }

        // Обнуляем ссылку в devices
        const fkField = `${type}_id`;
        await conn.query(`UPDATE devices SET ${fkField} = NULL WHERE ${fkField} = ?`, [id]);

        await conn.query(`DELETE FROM ${type} WHERE id = ?`, [id]);
        await conn.commit();
        res.json({ message: 'Компонент удалён' });
    } catch (err) {
        await conn.rollback();
        console.error('Delete component error:', err);
        res.status(500).json({ error: 'Ошибка удаления' });
    } finally {
        conn.release();
    }
});

// ======== СПРАВОЧНИКИ ========
app.get('/api/device-types', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM device_type ORDER BY id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/device-types', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { name, code } = req.body;
        const [result] = await pool.query(
            'INSERT INTO device_type (name, code) VALUES (?, ?)', [name, code]
        );
        res.json({ id: result.insertId, message: 'Тип устройства добавлен' });
    } catch (err) {
        console.error('Add device type error:', err);
        res.status(500).json({ error: 'Ошибка добавления' });
    }
});

app.delete('/api/device-types/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [devices] = await pool.query(
            'SELECT COUNT(*) as cnt FROM devices WHERE device_type_id = ?', [req.params.id]
        );
        if (devices[0].cnt > 0) {
            return res.status(400).json({ error: 'Есть привязанные устройства' });
        }
        await pool.query('DELETE FROM device_type WHERE id = ?', [req.params.id]);
        res.json({ message: 'Тип удалён' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

app.get('/api/production-places', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM place_of_production ORDER BY code');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/production-places', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { code, name } = req.body;
        const [result] = await pool.query(
            'INSERT INTO place_of_production (code, name) VALUES (?, ?)', [code, name]
        );
        res.json({ id: result.insertId, message: 'Место производства добавлено' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления' });
    }
});

app.delete('/api/production-places/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [devices] = await pool.query(
            'SELECT COUNT(*) as cnt FROM devices WHERE place_of_production_id = ?', [req.params.id]
        );
        if (devices[0].cnt > 0) {
            return res.status(400).json({ error: 'Есть привязанные устройства' });
        }
        await pool.query('DELETE FROM place_of_production WHERE id = ?', [req.params.id]);
        res.json({ message: 'Место удалено' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

app.get('/api/production-months', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM production_month ORDER BY CAST(code AS UNSIGNED)');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/production-years', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM production_year ORDER BY CAST(code AS UNSIGNED)');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/production-stages', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM production_stage ORDER BY CAST(code AS UNSIGNED)');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/locations', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM location ORDER BY id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/bmc', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM bmc ORDER BY id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/uboot', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM uboot ORDER BY id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/iso', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM iso ORDER BY id');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// ======== СОТРУДНИКИ ========
app.get('/api/employees', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, last_name, first_name, middle_name, position, username, role, created_at FROM employees ORDER BY id'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/employees/:id', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, last_name, first_name, middle_name, position, username, role, created_at FROM employees WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Сотрудник не найден' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/employees', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position, username, password, role } = req.body;
        const [result] = await pool.query(
            'INSERT INTO employees (last_name, first_name, middle_name, position, username, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [last_name, first_name, middle_name || null, position, username, password, role || 'user']
        );
        res.json({ id: result.insertId, message: 'Сотрудник добавлен' });
    } catch (err) {
        console.error('Add employee error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Логин уже занят' });
        }
        res.status(500).json({ error: 'Ошибка добавления' });
    }
});

app.put('/api/employees/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position, username, password, role } = req.body;
        let query, params;
        if (password) {
            query = 'UPDATE employees SET last_name=?, first_name=?, middle_name=?, position=?, username=?, password=?, role=? WHERE id=?';
            params = [last_name, first_name, middle_name, position, username, password, role, req.params.id];
        } else {
            query = 'UPDATE employees SET last_name=?, first_name=?, middle_name=?, position=?, username=?, role=? WHERE id=?';
            params = [last_name, first_name, middle_name, position, username, role, req.params.id];
        }
        await pool.query(query, params);
        res.json({ message: 'Сотрудник обновлён' });
    } catch (err) {
        console.error('Update employee error:', err);
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});

app.delete('/api/employees/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ message: 'Сотрудник удалён' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

// ======== СТАТИСТИКА ========
app.get('/api/statistics', authMiddleware, async (req, res) => {
    try {
        const [totalDevices] = await pool.query('SELECT COUNT(*) as count FROM devices');
        const [byType] = await pool.query(`
            SELECT dt.name, dt.code, COUNT(*) as count
            FROM devices d JOIN device_type dt ON d.device_type_id = dt.id
            GROUP BY dt.id, dt.name, dt.code
        `);
        const [byPlace] = await pool.query(`
            SELECT pp.name, COUNT(*) as count
            FROM devices d JOIN place_of_production pp ON d.place_of_production_id = pp.id
            GROUP BY pp.id, pp.name
        `);
        const [byLocation] = await pool.query(`
            SELECT l.name, COUNT(*) as count
            FROM devices d JOIN location l ON d.actual_location_id = l.id
            GROUP BY l.id, l.name
        `);
        const [byYear] = await pool.query(`
            SELECT py.name as year, COUNT(*) as count
            FROM devices d JOIN production_year py ON d.production_year_id = py.id
            GROUP BY py.id, py.name
            ORDER BY py.name
        `);
        const [byMonth] = await pool.query(`
            SELECT pm.name as month, pm.code, COUNT(*) as count
            FROM devices d JOIN production_month pm ON d.production_month_id = pm.id
            GROUP BY pm.id, pm.name, pm.code
            ORDER BY CAST(pm.code AS UNSIGNED)
        `);
        const [totalEmployees] = await pool.query('SELECT COUNT(*) as count FROM employees');
        const [totalErrors] = await pool.query('SELECT COUNT(*) as count FROM device_error');
        const [totalRepairs] = await pool.query('SELECT COUNT(*) as count FROM repair');
        const [recentDevices] = await pool.query(`
            SELECT d.product_serial_number, d.type, d.manufactures_date, dt.name as device_type_name
            FROM devices d LEFT JOIN device_type dt ON d.device_type_id = dt.id
            ORDER BY d.id DESC LIMIT 5
        `);

        res.json({
            totalDevices: totalDevices[0].count,
            totalEmployees: totalEmployees[0].count,
            totalErrors: totalErrors[0].count,
            totalRepairs: totalRepairs[0].count,
            byType,
            byPlace,
            byLocation,
            byYear,
            byMonth,
            recentDevices
        });
    } catch (err) {
        console.error('Statistics error:', err);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
});

// ======== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ========
app.post('/api/upload-image', authMiddleware, canEdit, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    res.json({ path: '/uploads/' + req.file.filename, message: 'Изображение загружено' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});