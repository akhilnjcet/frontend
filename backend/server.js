const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const DB_PATH = path.join(__dirname, 'database.sqlite');
const SECRET = 'medicare_pro_secret_key';

let db;

async function bootstrap() {
    db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Initialize Schema
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            specialization TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Seed Admin Data
    const admin = await db.get('SELECT * FROM users WHERE email = ?', 'admin@medicare.pro');
    if (!admin) {
        await db.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin User', 'admin@medicare.pro', 'admin123', 'admin']
        );
    }
}

// ------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------

// Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        // Normal query without hashing for simple demonstration based on user requests
        const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const { password: _, ...safeUser } = user;
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });

        res.json({ token, user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register New User (Signup)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role, specialization } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Missing required registration fields' });
        }

        const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        const result = await db.run(
            'INSERT INTO users (name, email, password, role, specialization) VALUES (?, ?, ?, ?, ?)',
            [name, email, password, role, specialization || null]
        );

        const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        const { password: _, ...safeUser } = newUser;
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET, { expiresIn: '1d' });

        res.status(201).json({ message: 'User created successfully', token, user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start application
bootstrap().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
});
