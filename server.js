const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Отдаем статические файлы из текущей папки
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Главная страница - перенаправляем на авторизацию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'autoriation.html'));
});

// Обработка отправки формы авторизации
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Здесь можно добавить проверку логина и пароля
    // Сейчас просто пропускаем всех
    console.log(`Попытка входа: ${username}`);
    
    // Перенаправляем на панель управления
    res.redirect('/dashboard');
});

// Страница панели управления (защищенная)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Защита - если кто-то пытается зайти на index.html напрямую
app.get('/index.html', (req, res) => {
    res.redirect('/');
});

// Обработка выхода
app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Откройте браузер и перейдите по адресу:`);
    console.log(`http://localhost:${PORT} - страница авторизации`);
});