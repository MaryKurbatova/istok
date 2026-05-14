const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/stikers', express.static(path.join(__dirname, 'stikers')));

['images', 'uploads', 'stikers'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Database
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'istok',
    waitForConnections: true,
    connectionLimit: 10
});

// Sessions
const sessions = new Map();

// Multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + crypto.randomBytes(6).toString('hex') + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Конфигурация устройств (обновлённая - только MAIN плата)
const DEVICE_CONFIG = {
    'RS': { name: 'Маршрутизатор (RS)', boards: ['MAIN'], type: 'ISN41508T3', os: 'RouterOS 6.4' },
    'SA': { name: 'Коммутатор (SA)', boards: ['MAIN'], type: 'ISN41508T4', os: 'SwitchOS 4.0' }
};

// Вспомогательная функция для получения номера недели
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Функция генерации серийного номера
async function generateDeviceSerialNumber(deviceTypeCode) {
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    const [rows] = await db.query(`
        SELECT product_serial_number FROM devices 
        WHERE product_serial_number LIKE ? 
        ORDER BY id DESC LIMIT 1
    `, [`${deviceTypeCode}${year}${String(week).padStart(2, '0')}${month}%`]);
    
    let sequence = 1;
    if (rows.length > 0) {
        const lastSN = rows[0].product_serial_number;
        const lastSeq = parseInt(lastSN.slice(-3));
        sequence = lastSeq + 1;
    }
    
    return `${deviceTypeCode}${year}${String(week).padStart(2, '0')}${month}${String(sequence).padStart(3, '0')}`;
}

// Auth helpers
function auth(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
    if (!token || !sessions.has(token)) return res.status(401).json({ error: 'Не авторизован' });
    req.user = sessions.get(token);
    next();
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Недостаточно прав. Требуется роль администратора.' });
    next();
}

function canEdit(req, res, next) {
    if (req.user.role === 'operator') return res.status(403).json({ error: 'Недостаточно прав. Оператор не может редактировать.' });
    next();
}

function canDelete(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Недостаточно прав. Только администратор может удалять.' });
    next();
}

// ============ ФУНКЦИЯ ГЕНЕРАЦИИ НАКЛЕЙКИ НА КОРОБКУ ============
async function generateSimpleStickerPDF(serialNumber, modification = "ISN41508T3", article = "КРПГ.465614.001") {
    return new Promise(async (resolve, reject) => {
        let qrImagePath = null;
        try {
            const pdfPath = path.join(__dirname, 'stikers', `${serialNumber}-label.pdf`);
            const doc = new PDFDocument({
                size: [150, 80],
                margin: 0
            });
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            const fontRegularPath = path.join(__dirname, 'Roboto-Regular.ttf');
            let regularFont = 'Helvetica';

            if (fs.existsSync(fontRegularPath)) {
                doc.registerFont('CustomRegular', fontRegularPath);
                regularFont = 'CustomRegular';
                console.log('Шрифт загружен');
            }

            doc.rect(2, 2, doc.page.width - 4, doc.page.height - 4)
               .lineWidth(0.5)
               .stroke();

            doc.fontSize(12)
               .font(regularFont)
               .fillColor('#e03131')
               .text('ИСТОК', 0, 5, { width: 150, align: 'center' });

            doc.fillColor('black')
               .fontSize(8)
               .text('АО «НПП «Исток»', 0, 17, { width: 150, align: 'center' });

            doc.moveTo(8, 26)
               .lineTo(142, 26)
               .lineWidth(0.3)
               .stroke();

            let yPos = 31;
            const leftMargin = 8;
            const labelWidth = 45;
            const valueStart = 55;

            doc.fontSize(7)
               .fillColor('black')
               .font(regularFont);

            doc.text('Изделие:', leftMargin, yPos, { width: labelWidth });
            doc.text(modification, valueStart, yPos, { width: 70 });
            yPos += 7;

            doc.text('Обозначение:', leftMargin, yPos, { width: labelWidth });
            doc.text(article, valueStart, yPos, { width: 70 });
            yPos += 7;

            doc.text('SN:', leftMargin, yPos, { width: labelWidth });
            doc.text(serialNumber, valueStart, yPos, { width: 70 });
            yPos += 7;

            doc.text('ТУ:', leftMargin, yPos, { width: labelWidth });
            doc.text('КРПГ.465614.001 ТУ', valueStart, yPos, { width: 70 });
            yPos += 7;

            const currentDate = new Date().toLocaleDateString('ru-RU');
            doc.text('Дата:', leftMargin, yPos, { width: labelWidth });
            doc.text(currentDate, valueStart, yPos, { width: 70 });
            yPos += 7;

            doc.text('Упаковщик:', leftMargin, yPos, { width: labelWidth });
            doc.text('__________', valueStart, yPos, { width: 70 });

            try {
                const qrBuffer = await QRCode.toBuffer(serialNumber, {
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 200
                });

                qrImagePath = path.join(__dirname, 'stikers', `temp_qr_${Date.now()}.png`);
                fs.writeFileSync(qrImagePath, qrBuffer);

                const qrSize = 30;
                const qrX = 112;
                const qrY = 35;

                doc.image(qrImagePath, qrX, qrY, {
                    width: qrSize,
                    height: qrSize
                });

            } catch (qrErr) {
                console.warn('QR не сгенерирован:', qrErr.message);
            }

            doc.end();

            stream.on('finish', () => {
                if (qrImagePath && fs.existsSync(qrImagePath)) {
                    setTimeout(() => {
                        try { fs.unlinkSync(qrImagePath); } catch (e) {}
                    }, 1000);
                }
                resolve('/stikers/' + `${serialNumber}-label.pdf`);
            });

            stream.on('error', (err) => {
                if (qrImagePath && fs.existsSync(qrImagePath)) {
                    try { fs.unlinkSync(qrImagePath); } catch (e) {}
                }
                reject(err);
            });

        } catch (error) {
            console.error('Ошибка генерации PDF:', error);
            reject(error);
        }
    });
}

// Генерация маленькой наклейки для паспорта (ТОЛЬКО QR КОД)
async function generatePassportStickerPDF(serialNumber, modification = "ISN41508T3") {
    return new Promise(async (resolve, reject) => {
        let qrImagePath = null;
        try {
            const pdfPath = path.join(__dirname, 'stikers', `${serialNumber}-passport-sticker.pdf`);
            
            const doc = new PDFDocument({
                size: [60, 60],
                margin: 0
            });
            
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            try {
                const qrBuffer = await QRCode.toBuffer(serialNumber, {
                    errorCorrectionLevel: 'M',
                    margin: 0,
                    width: 300
                });

                qrImagePath = path.join(__dirname, 'stikers', `temp_qr_pass_${Date.now()}.png`);
                fs.writeFileSync(qrImagePath, qrBuffer);
                
                doc.image(qrImagePath, 0, 0, { 
                    width: 60, 
                    height: 60,
                    fit: [60, 60],
                    align: 'center',
                    valign: 'center'
                });
                
            } catch (qrErr) {
                console.warn('QR не сгенерирован:', qrErr.message);
            }

            doc.end();

            stream.on('finish', () => {
                if (qrImagePath && fs.existsSync(qrImagePath)) {
                    setTimeout(() => {
                        try { fs.unlinkSync(qrImagePath); } catch (e) {}
                    }, 1000);
                }
                resolve('/stikers/' + `${serialNumber}-passport-sticker.pdf`);
            });

            stream.on('error', (err) => reject(err));
        } catch (error) {
            reject(error);
        }
    });
}

async function getDeviceArticle(deviceType) {
    const articles = {
        "ISN41508T3": "КРПГ.465614.001",
        "ISN41508T3-M": "КРПГ.465614.001-01",
        "ISN41508T4": "КРПГ.465614.002",
        "ISN41508T3-M-AC": "КРПГ.465614.001-03"
    };
    
    try {
        const [rows] = await db.query(
            'SELECT code FROM device_type WHERE name LIKE ?',
            [`%${deviceType}%`]
        );
        if (rows.length > 0 && rows[0].code) {
            return rows[0].code;
        }
    } catch (e) {
        console.warn('Не удалось получить артикул из БД:', e.message);
    }
    
    return articles[deviceType] || "КРПГ.465614.001";
}

// ==========================================
// CHANGE PASSWORD API
// ==========================================
app.post('/api/check-password', auth, async (req, res) => {
    try {
        const { user_id, password } = req.body;
        const [rows] = await db.query(
            'SELECT id FROM employees WHERE id = ? AND password = ?',
            [user_id, password]
        );
        res.json({ success: rows.length > 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/change-password', auth, async (req, res) => {
    try {
        const { user_id, new_password } = req.body;
        await db.query(
            'UPDATE employees SET password = ? WHERE id = ?',
            [new_password, user_id]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// HTML PAGES
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'autoriation.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/auto.css', (req, res) => {
    res.type('text/css').sendFile(path.join(__dirname, 'auto.css'));
});

app.get('/dashboard.css', (req, res) => {
    res.type('text/css').sendFile(path.join(__dirname, 'dashboard.css'));
});

app.get('/dashboard.js', (req, res) => {
    res.type('application/javascript').sendFile(path.join(__dirname, 'dashboard.js'));
});

// ==========================================
// AUTH API
// ==========================================
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Введите логин и пароль' });
        }
        const [rows] = await db.query(
            'SELECT id, last_name, first_name, middle_name, position, username, role FROM employees WHERE username = ? AND password = ?',
            [username, password]
        );
        if (!rows.length) return res.status(401).json({ error: 'Неверный логин или пароль' });
        const user = rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, user);
        res.json({ token, user });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/login/integration', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const [rows] = await db.query(
            'SELECT * FROM employees WHERE username = ? AND password = ?',
            [username, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            delete user.password;
            
            res.json({
                success: true,
                message: "Авторизация успешна",
                user: user
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Неверный логин или пароль"
            });
        }
    } catch (error) {
        console.error('Ошибка БД:', error);
        res.status(500).json({
            success: false,
            message: "Ошибка сервера. Попробуйте позже."
        });
    }
});

app.get('/api/current-user', auth, (req, res) => {
    res.json(req.user);
});

app.post('/api/logout', auth, (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
    sessions.delete(token);
    res.json({ success: true });
});

// ==========================================
// GENERATE SERIAL NUMBER API
// ==========================================
app.post('/api/generate-serial-number', auth, async (req, res) => {
    try {
        const { device_type_id } = req.body;
        const [types] = await db.query('SELECT code FROM device_type WHERE id = ?', [device_type_id]);
        
        if (!types.length) {
            return res.status(400).json({ error: 'Тип устройства не найден' });
        }
        
        const serialNumber = await generateDeviceSerialNumber(types[0].code);
        res.json({ serial_number: serialNumber });
    } catch (e) {
        console.error('Generate serial number error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// DEVICES API
// ==========================================
app.get('/api/devices', auth, async (req, res) => {
    try {
        if (req.user.role === 'operator') {
            const [rows] = await db.query(`
                SELECT d.id, d.product_serial_number, d.type, d.current_stage, d.manufactures_date,
                    dt.name as device_type_name, dt.code as device_type_code
                FROM devices d
                LEFT JOIN device_type dt ON d.device_type_id = dt.id
                ORDER BY d.id DESC
            `);
            return res.json(rows);
        }
        
        const sql = `
            SELECT d.*,
                dt.name as device_type_name, dt.code as device_type_code,
                pp.name as production_place_name, pp.code as production_place_code,
                pm.name as production_month_name,
                py.name as production_year_name,
                ps.name as production_stage_name,
                l.name as location_name,
                bmc_t.version_bmc, uboot_t.version_uboot, iso_t.version_iso,
                CONCAT(ae.last_name, ' ', ae.first_name) as assembly_employee_name,
                CONCAT(pe.last_name, ' ', pe.first_name) as psi_employee_name,
                CONCAT(pke.last_name, ' ', pke.first_name) as packaging_employee_name
            FROM devices d
            LEFT JOIN device_type dt ON d.device_type_id = dt.id
            LEFT JOIN place_of_production pp ON d.place_of_production_id = pp.id
            LEFT JOIN production_month pm ON d.production_month_id = pm.id
            LEFT JOIN production_year py ON d.production_year_id = py.id
            LEFT JOIN production_stage ps ON d.production_stage_id = ps.id
            LEFT JOIN location l ON d.actual_location_id = l.id
            LEFT JOIN bmc bmc_t ON d.bmc_id = bmc_t.id
            LEFT JOIN uboot uboot_t ON d.uboot_id = uboot_t.id
            LEFT JOIN iso iso_t ON d.iso_id = iso_t.id
            LEFT JOIN employees ae ON d.assembly_employee_id = ae.id
            LEFT JOIN employees pe ON d.psi_employee_id = pe.id
            LEFT JOIN employees pke ON d.packaging_employee_id = pke.id
            ORDER BY d.id DESC`;

        const [rows] = await db.query(sql);

        for (let dev of rows) {
            const [macs] = await db.query('SELECT * FROM macs WHERE device_id = ?', [dev.id]);
            dev.macs = macs;
            const [boards] = await db.query(
                'SELECT b.*, bt.name as board_type_name, bt.code as board_type_code FROM boards b LEFT JOIN board_type bt ON b.board_type_id = bt.id WHERE b.device_id = ?',
                [dev.id]
            );
            dev.boards = boards;
        }

        res.json(rows);
    } catch (e) {
        console.error('GET /api/devices error:', e);
        res.status(500).json({ error: 'Ошибка получения устройств' });
    }
});

app.get('/api/devices/:id', auth, async (req, res) => {
    try {
        if (req.user.role === 'operator') {
            const [rows] = await db.query(`
                SELECT d.id, d.product_serial_number, d.type, d.current_stage, d.manufactures_date,
                    dt.name as device_type_name, dt.code as device_type_code
                FROM devices d
                LEFT JOIN device_type dt ON d.device_type_id = dt.id
                WHERE d.id = ?
            `, [req.params.id]);
            if (!rows.length) return res.status(404).json({ error: 'Не найдено' });
            return res.json(rows[0]);
        }
        
        const [rows] = await db.query(`
            SELECT d.*,
                dt.name as device_type_name, dt.code as device_type_code,
                pp.name as production_place_name,
                pm.name as production_month_name,
                py.name as production_year_name,
                ps.name as production_stage_name,
                l.name as location_name,
                bmc_t.version_bmc, uboot_t.version_uboot, iso_t.version_iso,
                CONCAT(ae.last_name, ' ', ae.first_name) as assembly_employee_full,
                CONCAT(pe.last_name, ' ', pe.first_name) as psi_employee_full,
                CONCAT(pke.last_name, ' ', pke.first_name) as packaging_employee_full
            FROM devices d
            LEFT JOIN device_type dt ON d.device_type_id = dt.id
            LEFT JOIN place_of_production pp ON d.place_of_production_id = pp.id
            LEFT JOIN production_month pm ON d.production_month_id = pm.id
            LEFT JOIN production_year py ON d.production_year_id = py.id
            LEFT JOIN production_stage ps ON d.production_stage_id = ps.id
            LEFT JOIN location l ON d.actual_location_id = l.id
            LEFT JOIN bmc bmc_t ON d.bmc_id = bmc_t.id
            LEFT JOIN uboot uboot_t ON d.uboot_id = uboot_t.id
            LEFT JOIN iso iso_t ON d.iso_id = iso_t.id
            LEFT JOIN employees ae ON d.assembly_employee_id = ae.id
            LEFT JOIN employees pe ON d.psi_employee_id = pe.id
            LEFT JOIN employees pke ON d.packaging_employee_id = pke.id
            WHERE d.id = ?
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ error: 'Не найдено' });
        const dev = rows[0];

        const [macs] = await db.query('SELECT * FROM macs WHERE device_id = ?', [dev.id]);
        dev.macs = macs;

        const [boards] = await db.query(
            `SELECT b.*, bt.name as board_type_name, bt.code as board_type_code,
                CONCAT(ve.last_name, ' ', ve.first_name) as vi_employee_name,
                CONCAT(de2.last_name, ' ', de2.first_name) as diag_employee_name,
                CONCAT(ase2.last_name, ' ', ase2.first_name) as asm_employee_name
            FROM boards b
            LEFT JOIN board_type bt ON b.board_type_id = bt.id
            LEFT JOIN employees ve ON b.visual_inspection_employee_id = ve.id
            LEFT JOIN employees de2 ON b.diagnostics_employee_id = de2.id
            LEFT JOIN employees ase2 ON b.assembly_employee_id = ase2.id
            WHERE b.device_id = ?`, [dev.id]
        );
        dev.boards = boards;

        const [history] = await db.query(
            `SELECT h.*, CONCAT(e.last_name, ' ', e.first_name) as emp_name
             FROM history h LEFT JOIN employees e ON h.employee_id = e.id
             WHERE h.device_id = ? ORDER BY h.date_time DESC`, [dev.id]
        );
        dev.history = history;

        res.json(dev);
    } catch (e) {
        console.error('GET /api/devices/:id error:', e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/devices', auth, canEdit, async (req, res) => {
    try {
        const d = req.body;
        const [result] = await db.query(
            `INSERT INTO devices (device_type_id, place_of_production_id, production_month_id,
                production_year_id, production_stage_id, actual_location_id, bmc_id, uboot_id,
                iso_id, product_serial_number, monthly_sequence, manufactures_date, type, version_os, diag, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [d.device_type_id, d.place_of_production_id || null, d.production_month_id || null,
            d.production_year_id || null, d.production_stage_id || null, d.actual_location_id || null,
            d.bmc_id || null, d.uboot_id || null, d.iso_id || null,
            d.product_serial_number, d.monthly_sequence, d.manufactures_date,
            d.type, d.version_os, d.diag ? 1 : 0, d.image_path || null]
        );
        res.json({ id: result.insertId, message: 'Устройство создано' });
    } catch (e) {
        console.error('POST /api/devices error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/devices/:id', auth, canEdit, async (req, res) => {
    try {
        const d = req.body;
        await db.query(
            `UPDATE devices SET device_type_id=?, place_of_production_id=?, production_month_id=?,
                production_year_id=?, production_stage_id=?, actual_location_id=?,
                bmc_id=?, uboot_id=?, iso_id=?, product_serial_number=?,
                monthly_sequence=?, manufactures_date=?, type=?, version_os=?, diag=?, image_path=?
            WHERE id=?`,
            [d.device_type_id, d.place_of_production_id || null, d.production_month_id || null,
            d.production_year_id || null, d.production_stage_id || null, d.actual_location_id || null,
            d.bmc_id || null, d.uboot_id || null, d.iso_id || null,
            d.product_serial_number, d.monthly_sequence, d.manufactures_date,
            d.type, d.version_os, d.diag ? 1 : 0, d.image_path || null, req.params.id]
        );
        res.json({ message: 'Обновлено' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/devices/:id', auth, canDelete, async (req, res) => {
    try {
        await db.query('UPDATE boards SET device_id = NULL WHERE device_id = ?', [req.params.id]);
        await db.query('DELETE FROM devices WHERE id = ?', [req.params.id]);
        res.json({ message: 'Удалено' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// BOARDS API
// ==========================================
app.get('/api/boards', auth, async (req, res) => {
    try {
        if (req.user.role === 'operator') {
            const [rows] = await db.query(`
                SELECT b.id, b.serial_number, b.current_stage, bt.name as board_type_name, bt.code as board_type_code
                FROM boards b
                LEFT JOIN board_type bt ON b.board_type_id = bt.id
                ORDER BY b.id DESC
            `);
            return res.json(rows);
        }
        
        const [rows] = await db.query(
            `SELECT b.*, bt.name as board_type_name, bt.code as board_type_code,
                d.product_serial_number as device_serial,
                CONCAT(ve.last_name, ' ', ve.first_name) as vi_employee,
                CONCAT(de2.last_name, ' ', de2.first_name) as diag_employee,
                CONCAT(ae.last_name, ' ', ae.first_name) as asm_employee
            FROM boards b
            LEFT JOIN board_type bt ON b.board_type_id = bt.id
            LEFT JOIN devices d ON b.device_id = d.id
            LEFT JOIN employees ve ON b.visual_inspection_employee_id = ve.id
            LEFT JOIN employees de2 ON b.diagnostics_employee_id = de2.id
            LEFT JOIN employees ae ON b.assembly_employee_id = ae.id
            ORDER BY b.id DESC`
        );
        res.json(rows);
    } catch (e) {
        console.error('GET /api/boards error:', e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/boards/:id', auth, async (req, res) => {
    try {
        if (req.user.role === 'operator') {
            const [rows] = await db.query(`
                SELECT b.id, b.serial_number, b.current_stage, bt.name as board_type_name, bt.code as board_type_code
                FROM boards b
                LEFT JOIN board_type bt ON b.board_type_id = bt.id
                WHERE b.id = ?
            `, [req.params.id]);
            if (!rows.length) return res.status(404).json({ error: 'Не найдено' });
            return res.json(rows[0]);
        }
        
        const [rows] = await db.query(
            `SELECT b.*, bt.name as board_type_name, bt.code as board_type_code,
                d.product_serial_number as device_serial
            FROM boards b
            LEFT JOIN board_type bt ON b.board_type_id = bt.id
            LEFT JOIN devices d ON b.device_id = d.id
            WHERE b.id = ?`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Не найдено' });

        const board = rows[0];

        const [viRecs] = await db.query(
            `SELECT v.*, CONCAT(e.last_name, ' ', e.first_name) as emp_name
             FROM visual_inspection_records v LEFT JOIN employees e ON v.employee_id = e.id
             WHERE v.board_id = ? ORDER BY v.inspection_date DESC`, [board.id]
        );
        board.vi_records = viRecs;

        const [dRecs] = await db.query(
            `SELECT dr.*, CONCAT(e.last_name, ' ', e.first_name) as emp_name
             FROM diagnostics_records dr LEFT JOIN employees e ON dr.employee_id = e.id
             WHERE dr.board_id = ? ORDER BY dr.diagnostics_date DESC`, [board.id]
        );
        board.diag_records = dRecs;

        res.json(board);
    } catch (e) {
        console.error('GET /api/boards/:id error:', e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.delete('/api/boards/:id', auth, canDelete, async (req, res) => {
    try {
        await db.query('DELETE FROM boards WHERE id = ?', [req.params.id]);
        res.json({ message: 'Плата удалена' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/boards', auth, canEdit, async (req, res) => {
    try {
        const { board_type_id, serial_number } = req.body;
        const [result] = await db.query(
            'INSERT INTO boards (board_type_id, serial_number) VALUES (?, ?)',
            [board_type_id, serial_number]
        );
        res.json({ id: result.insertId, message: 'Плата создана' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/board-types', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM board_type ORDER BY id');
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// ==========================================
// STANDS API
// ==========================================

app.post('/api/stands/visual-inspection', auth, async (req, res) => {
    try {
        const { serial_number, result, comment } = req.body;
        
        let [boards] = await db.query('SELECT * FROM boards WHERE serial_number = ?', [serial_number]);
        let board;
        let isNewBoard = false;
        
        if (!boards.length) {
            const [boardTypes] = await db.query('SELECT id FROM board_type WHERE code = ?', ['MAIN']);
            const boardTypeId = boardTypes.length ? boardTypes[0].id : 1;
            
            const [result] = await db.query(
                'INSERT INTO boards (board_type_id, serial_number, current_stage) VALUES (?, ?, ?)',
                [boardTypeId, serial_number, 'new']
            );
            
            boards = await db.query('SELECT * FROM boards WHERE id = ?', [result.insertId]);
            board = boards[0];
            isNewBoard = true;
        } else {
            board = boards[0];
        }
        
        if (board.current_stage !== 'new') {
            return res.status(400).json({ error: 'Плата уже на стадии: ' + board.current_stage });
        }

        const now = new Date();
        const passed = result ? 1 : 0;

        await db.query(
            `UPDATE boards SET visual_inspection_passed = ?, visual_inspection_date = ?,
                visual_inspection_employee_id = ?, visual_inspection_comment = ?,
                current_stage = ?
            WHERE id = ?`,
            [passed, now, req.user.id, comment || null, result ? 'visual_ok' : 'visual_fail', board.id]
        );

        await db.query(
            'INSERT INTO visual_inspection_records (board_id, employee_id, inspection_date, result, comment) VALUES (?, ?, ?, ?, ?)',
            [board.id, req.user.id, now, passed, comment || null]
        );

        await db.query(
            'INSERT INTO history (board_id, serial_num, message, stage, employee_id, date_time) VALUES (?, ?, ?, ?, ?, ?)',
            [board.id, serial_number, result ? 'Осмотр пройден' : 'Осмотр не пройден', 'visual_inspection', req.user.id, now]
        );

        res.json({ message: 'Визуальный осмотр завершён', board_id: board.id, is_new: isNewBoard });
    } catch (e) {
        console.error('Visual inspection error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stands/diagnostics', auth, async (req, res) => {
    try {
        const { serial_number, result, comment, ip_address, stand_name, ports_ok, os_installed, disks_ok, memory_ok } = req.body;
        const [boards] = await db.query('SELECT * FROM boards WHERE serial_number = ?', [serial_number]);
        if (!boards.length) return res.status(404).json({ error: 'Плата не найдена' });

        const board = boards[0];
        if (!board.visual_inspection_passed) {
            return res.status(400).json({ error: 'Плата не прошла визуальный осмотр!' });
        }
        if (board.current_stage !== 'visual_ok') {
            return res.status(400).json({ error: 'Стадия: ' + board.current_stage + '. Нужна visual_ok' });
        }

        const now = new Date();
        const passed = result ? 1 : 0;

        await db.query(
            `UPDATE boards SET diagnostics_passed = ?, diagnostics_date = ?,
                diagnostics_employee_id = ?, diagnostics_comment = ?,
                diagnostics_ip = ?, diagnostics_stand = ?,
                current_stage = ?
            WHERE id = ?`,
            [passed, now, req.user.id, comment || null, ip_address || null, stand_name || null,
             result ? 'diagnostics_ok' : 'diagnostics_fail', board.id]
        );

        await db.query(
            'INSERT INTO diagnostics_records (board_id, employee_id, diagnostics_date, result, comment, ip_address, stand_name, ports_ok, os_installed, disks_ok, memory_ok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [board.id, req.user.id, now, passed, comment, ip_address, stand_name,
             ports_ok ? 1 : 0, os_installed ? 1 : 0, disks_ok ? 1 : 0, memory_ok ? 1 : 0]
        );

        await db.query(
            'INSERT INTO history (board_id, serial_num, message, stage, employee_id, date_time) VALUES (?, ?, ?, ?, ?, ?)',
            [board.id, serial_number, result ? 'Диагностика пройдена' : 'Диагностика не пройдена', 'diagnostics', req.user.id, now]
        );

        res.json({ message: 'Диагностика завершена', board_id: board.id });
    } catch (e) {
        console.error('Diagnostics error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ОБНОВЛЕННЫЙ СТЕНД СБОРКИ - только MAIN плата, автоподстановка модификации и ОС
app.post('/api/stands/assembly', auth, async (req, res) => {
    try {
        const { board_serial_numbers, case_serial_number, device_serial_number, device_type_id } = req.body;
        
        if (!board_serial_numbers || !board_serial_numbers.length) {
            return res.status(400).json({ error: 'Укажите серийный номер платы' });
        }

        const placeholders = board_serial_numbers.map(() => '?').join(',');
        const [boards] = await db.query(
            `SELECT b.*, bt.name as board_type_name, bt.code as board_type_code 
             FROM boards b 
             LEFT JOIN board_type bt ON b.board_type_id = bt.id 
             WHERE b.serial_number IN (${placeholders})`,
            board_serial_numbers
        );

        if (boards.length !== board_serial_numbers.length) {
            const found = boards.map(b => b.serial_number);
            const missing = board_serial_numbers.filter(s => !found.includes(s));
            return res.status(404).json({ error: 'Не найдены: ' + missing.join(', ') });
        }

        const [deviceTypes] = await db.query('SELECT code FROM device_type WHERE id = ?', [device_type_id || 1]);
        if (!deviceTypes.length) return res.status(400).json({ error: 'Неизвестный тип устройства' });
        
        const deviceCode = deviceTypes[0].code;
        const config = DEVICE_CONFIG[deviceCode];
        if (!config) return res.status(400).json({ error: 'Неизвестный тип устройства' });

        // Проверяем стадию плат
        for (const board of boards) {
            if (!board.diagnostics_passed) {
                return res.status(400).json({ error: board.serial_number + ' не прошла диагностику!' });
            }
            if (board.current_stage !== 'diagnostics_ok') {
                return res.status(400).json({ error: board.serial_number + ' стадия: ' + board.current_stage });
            }
        }

        // Проверяем комплектацию - только MAIN
        const boardCodes = boards.map(b => b.board_type_code);
        const missingBoards = config.boards.filter(type => !boardCodes.includes(type));
        
        if (missingBoards.length > 0) {
            return res.status(400).json({ 
                error: `Для сборки требуется плата: ${config.boards.join(', ')}` 
            });
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        // АВТОПОДСТАНОВКА МОДИФИКАЦИИ И ОС ИЗ КОНФИГА
        const [devResult] = await db.query(
            `INSERT INTO devices (device_type_id, product_serial_number, case_serial_number, type, version_os, 
                assembly_passed, assembly_date, assembly_employee_id, current_stage, manufactures_date)
             VALUES (?, ?, ?, ?, ?, 1, ?, ?, 'assembled', ?)`,
            [device_type_id || 1, device_serial_number, case_serial_number, config.type, config.os, now, req.user.id, dateStr]
        );

        const deviceId = devResult.insertId;

        for (const board of boards) {
            await db.query(
                `UPDATE boards SET device_id = ?, assembly_passed = 1, assembly_date = ?, 
                 assembly_employee_id = ?, current_stage = 'assembled' WHERE id = ?`,
                [deviceId, now, req.user.id, board.id]
            );
        }

        await db.query(
            'INSERT INTO assembly_records (device_id, employee_id, assembly_date, case_serial_number, comment) VALUES (?, ?, ?, ?, ?)',
            [deviceId, req.user.id, now, case_serial_number, 'Платы: ' + board_serial_numbers.join(', ')]
        );

        await db.query(
            'INSERT INTO history (device_id, serial_num, message, stage, employee_id, date_time) VALUES (?, ?, ?, ?, ?, ?)',
            [deviceId, device_serial_number, 'Устройство собрано', 'assembly', req.user.id, now]
        );

        res.json({ message: 'Сборка завершена', device_id: deviceId, serial_number: device_serial_number });
    } catch (e) {
        console.error('Assembly error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stands/psi', auth, async (req, res) => {
    try {
        const { device_serial_number, result, comment, protocol_number, firmware_version, ports_ok, os_installed, disks_ok, memory_ok } = req.body;
        const [devices] = await db.query('SELECT * FROM devices WHERE product_serial_number = ?', [device_serial_number]);
        if (!devices.length) return res.status(404).json({ error: 'Устройство не найдено' });

        const device = devices[0];
        if (!device.assembly_passed) {
            return res.status(400).json({ error: 'Не прошло сборку!' });
        }
        if (device.current_stage !== 'assembled') {
            return res.status(400).json({ error: 'Стадия: ' + device.current_stage + '. Нужна assembled' });
        }

        const now = new Date();
        const passed = result ? 1 : 0;

        await db.query(
            `UPDATE devices SET psi_passed = ?, psi_date = ?, psi_employee_id = ?,
                psi_comment = ?, psi_protocol_number = ?, psi_firmware_version = ?,
                version_os = ?, current_stage = ?
            WHERE id = ?`,
            [passed, now, req.user.id, comment, protocol_number, firmware_version,
             firmware_version, result ? 'psi_ok' : 'psi_fail', device.id]
        );

        await db.query(
            'INSERT INTO psi_records (device_id, employee_id, psi_date, result, protocol_number, firmware_version, comment, ports_ok, os_installed, disks_ok, memory_ok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [device.id, req.user.id, now, passed, protocol_number, firmware_version, comment,
             ports_ok ? 1 : 0, os_installed ? 1 : 0, disks_ok ? 1 : 0, memory_ok ? 1 : 0]
        );

        await db.query(
            'INSERT INTO history (device_id, serial_num, message, stage, employee_id, date_time) VALUES (?, ?, ?, ?, ?, ?)',
            [device.id, device_serial_number, result ? 'ПСИ пройден' : 'ПСИ не пройден', 'psi', req.user.id, now]
        );

        res.json({ message: 'ПСИ завершён', device_id: device.id });
    } catch (e) {
        console.error('PSI error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/stands/packaging', auth, async (req, res) => {
    try {
        const { device_serial_number, comment } = req.body;
        const [devices] = await db.query('SELECT * FROM devices WHERE product_serial_number = ?', [device_serial_number]);
        if (!devices.length) return res.status(404).json({ error: 'Устройство не найдено' });
        
        const device = devices[0];
        if (!device.psi_passed) return res.status(400).json({ error: 'Не прошло ПСИ!' });
        if (device.current_stage !== 'psi_ok') return res.status(400).json({ error: 'Стадия: ' + device.current_stage + '. Нужна psi_ok' });

        const now = new Date();
        const [locs] = await db.query("SELECT id FROM location WHERE name = 'Склад готовой продукции' LIMIT 1");
        const locId = locs.length ? locs[0].id : null;

        await db.query(
            `UPDATE devices SET packaging_passed = 1, packaging_date = ?, packaging_employee_id = ?,
                packaging_comment = ?, passport_printed = 1, label_printed = 1,
                current_stage = 'packaged', actual_location_id = ?
            WHERE id = ?`,
            [now, req.user.id, comment, locId, device.id]
        );

        await db.query(
            'INSERT INTO packaging_records (device_id, employee_id, packaging_date, passport_printed, label_printed, comment) VALUES (?, ?, ?, 1, 1, ?)',
            [device.id, req.user.id, now, comment]
        );

        await db.query(
            'INSERT INTO history (device_id, serial_num, message, stage, employee_id, date_time) VALUES (?, ?, ?, ?, ?, ?)',
            [device.id, device_serial_number, 'Упаковка завершена', 'packaging', req.user.id, now]
        );

        let stickerUrl = null;
        let passportStickerUrl = null;
        
        try {
            const deviceType = device.type || "ISN41508T3";
            const article = await getDeviceArticle(deviceType);
            
            stickerUrl = await generateSimpleStickerPDF(device_serial_number, deviceType, article);
            passportStickerUrl = await generatePassportStickerPDF(device_serial_number, deviceType);
        } catch (e) {
            console.warn('Наклейки не сгенерированы:', e.message);
        }

        res.json({
            message: 'Упаковка завершена!',
            sticker_url: stickerUrl,
            passport_sticker_url: passportStickerUrl,
            device_id: device.id,
            device_serial_number: device_serial_number
        });
    } catch (e) {
        console.error('Packaging error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// REFERENCES API
// ==========================================
app.get('/api/device-types', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM device_type ORDER BY name'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.post('/api/device-types', auth, adminOnly, async (req, res) => {
    try { const [r] = await db.query('INSERT INTO device_type (name, code) VALUES (?, ?)', [req.body.name, req.body.code]); res.json({ id: r.insertId }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/device-types/:id', auth, adminOnly, async (req, res) => {
    try { await db.query('DELETE FROM device_type WHERE id = ?', [req.params.id]); res.json({ message: 'Удалено' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/production-places', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM place_of_production ORDER BY code'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.post('/api/production-places', auth, adminOnly, async (req, res) => {
    try { const [r] = await db.query('INSERT INTO place_of_production (name, code) VALUES (?, ?)', [req.body.name, req.body.code]); res.json({ id: r.insertId }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/production-places/:id', auth, adminOnly, async (req, res) => {
    try { await db.query('DELETE FROM place_of_production WHERE id = ?', [req.params.id]); res.json({ message: 'Удалено' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/production-places/:id', auth, adminOnly, async (req, res) => {
    try { await db.query('UPDATE place_of_production SET name=?, code=? WHERE id=?', [req.body.name, req.body.code, req.params.id]); res.json({ message: 'Обновлено' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/production-months', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM production_month ORDER BY CAST(code AS UNSIGNED)'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/production-years', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM production_year ORDER BY CAST(code AS UNSIGNED)'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/production-stages', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM production_stage ORDER BY CAST(code AS UNSIGNED)'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/locations', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM location ORDER BY name'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/bmc', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM bmc ORDER BY version_bmc'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/uboot', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM uboot ORDER BY version_uboot'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/iso', auth, async (req, res) => {
    try { const [r] = await db.query('SELECT * FROM iso ORDER BY version_iso'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});

// ==========================================
// CASES API (КОРПУСА)
// ==========================================
app.get('/api/cases', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cases ORDER BY id DESC');
        res.json(rows);
    } catch (e) { 
        console.error('GET /api/cases error:', e);
        res.status(500).json({ error: 'Ошибка получения корпусов: ' + e.message }); 
    }
});

app.post('/api/cases', auth, canEdit, async (req, res) => {
    try {
        const { serial_number, case_type } = req.body;
        if (!serial_number) throw new Error('Серийный номер обязателен');
        
        const [existing] = await db.query('SELECT id FROM cases WHERE serial_number = ?', [serial_number]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Корпус с таким серийным номером уже существует' });
        }
        
        const [result] = await db.query(
            'INSERT INTO cases (serial_number, case_type, current_stage) VALUES (?, ?, ?)', 
            [serial_number, case_type || 'Стандартный', 'new']
        );
        res.json({ id: result.insertId, message: 'Корпус создан' });
    } catch (e) { 
        console.error('POST /api/cases error:', e);
        res.status(500).json({ error: e.message }); 
    }
});

app.delete('/api/cases/:id', auth, canDelete, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM cases WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Корпус не найден' });
        }
        res.json({ message: 'Корпус удален' });
    } catch (e) { 
        console.error('DELETE /api/cases/:id error:', e);
        res.status(500).json({ error: e.message }); 
    }
});

// ==========================================
// EMPLOYEES API
// ==========================================
app.get('/api/employees', auth, adminOnly, async (req, res) => {
    try { const [r] = await db.query('SELECT id, last_name, first_name, middle_name, position, username, role, created_at FROM employees ORDER BY last_name'); res.json(r); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.get('/api/employees/:id', auth, adminOnly, async (req, res) => {
    try { const [r] = await db.query('SELECT id, last_name, first_name, middle_name, position, username, role FROM employees WHERE id = ?', [req.params.id]); if (!r.length) return res.status(404).json({ error: 'Не найден' }); res.json(r[0]); }
    catch (e) { res.status(500).json({ error: 'Ошибка' }); }
});
app.post('/api/employees', auth, adminOnly, async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position, username, password, role } = req.body;
        const [r] = await db.query('INSERT INTO employees (last_name, first_name, middle_name, position, username, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [last_name, first_name, middle_name || null, position, username, password, role || 'user']);
        res.json({ id: r.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/employees/:id', auth, adminOnly, async (req, res) => {
    try {
        const { last_name, first_name, middle_name, position, username, password, role } = req.body;
        if (password) {
            await db.query('UPDATE employees SET last_name=?, first_name=?, middle_name=?, position=?, username=?, password=?, role=? WHERE id=?',
                [last_name, first_name, middle_name, position, username, password, role, req.params.id]);
        } else {
            await db.query('UPDATE employees SET last_name=?, first_name=?, middle_name=?, position=?, username=?, role=? WHERE id=?',
                [last_name, first_name, middle_name, position, username, role, req.params.id]);
        }
        res.json({ message: 'Обновлено' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/employees/:id', auth, adminOnly, async (req, res) => {
    try { await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]); res.json({ message: 'Удалено' }); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// STATISTICS API
// ==========================================
app.get('/api/statistics', auth, async (req, res) => {
    try {
        const [td] = await db.query('SELECT COUNT(*) as c FROM devices');
        const [tb] = await db.query('SELECT COUNT(*) as c FROM boards');
        const [te] = await db.query('SELECT COUNT(*) as c FROM employees');
        const [byType] = await db.query('SELECT dt.name, dt.code, COUNT(*) as count FROM devices d JOIN device_type dt ON d.device_type_id = dt.id GROUP BY dt.id, dt.name, dt.code');
        const [byStage] = await db.query('SELECT current_stage, COUNT(*) as count FROM devices GROUP BY current_stage');
        const [boardsByStage] = await db.query('SELECT current_stage, COUNT(*) as count FROM boards GROUP BY current_stage');
        const [byPlace] = await db.query('SELECT pp.name, COUNT(*) as count FROM devices d JOIN place_of_production pp ON d.place_of_production_id = pp.id GROUP BY pp.id, pp.name');
        const [recent] = await db.query('SELECT d.product_serial_number, d.type, d.current_stage, d.manufactures_date, dt.name as dtn FROM devices d LEFT JOIN device_type dt ON d.device_type_id = dt.id ORDER BY d.id DESC LIMIT 5');
        const [recentBoards] = await db.query('SELECT b.serial_number, bt.name as btn, b.current_stage FROM boards b LEFT JOIN board_type bt ON b.board_type_id = bt.id ORDER BY b.id DESC LIMIT 5');

        res.json({ totalDevices: td[0].c, totalBoards: tb[0].c, totalEmployees: te[0].c, byType, byStage, boardsByStage, byPlace, recentDevices: recent, recentBoards });
    } catch (e) {
        console.error('Statistics error:', e);
        res.status(500).json({ error: 'Ошибка' });
    }
});

// ==========================================
// IMAGE UPLOAD
// ==========================================
app.post('/api/upload-image', auth, canEdit, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    res.json({ path: '/uploads/' + req.file.filename });
});

// ==========================================
// START
// ==========================================
app.listen(PORT, () => {
    console.log('');
    console.log('  ========================================');
    console.log('    Сервер запущен: http://localhost:' + PORT);
    console.log('  ========================================');
    console.log('');
});