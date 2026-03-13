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
db.query('SELECT 1')
    .then(() => console.log('✅ Подключение к БД успешно'))
    .catch(err => console.error('❌ Ошибка подключения к БД:', err));

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Главная страница - авторизация
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'autoriation.html'));
});

// Обработка отправки формы авторизации
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log(`Попытка входа: ${username}`);
    
    try {
        // Проверяем есть ли пользователь в БД
        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            console.log(`✅ Успешный вход: ${username} (${user.position})`);
            res.redirect('/dashboard');
        } else {
            console.log(`❌ Неудачная попытка: ${username}`);
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

// Панель управления (после входа)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Защита - если кто-то пытается зайти на index.html напрямую
app.get('/index.html', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Откройте браузер и перейдите по адресу:`);
    console.log(`http://localhost:${PORT} - страница авторизации`);
});