const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const DB_PATH = path.join(__dirname, 'database.sqlite');
const SECRET = process.env.JWT_SECRET || 'medicare_pro_secret_key';

let db;
let transporter; // Mailer

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
        
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            age INTEGER,
            gender TEXT,
            phone TEXT,
            address TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            department_id INTEGER,
            specialization TEXT,
            fee INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            status TEXT DEFAULT 'Scheduled',
            FOREIGN KEY (patient_id) REFERENCES patients (id),
            FOREIGN KEY (doctor_id) REFERENCES doctors (id)
        );

        CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appointment_id INTEGER NOT NULL,
            diagnosis TEXT NOT NULL,
            note TEXT,
            FOREIGN KEY (appointment_id) REFERENCES appointments (id)
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

    // Initialize Mail Transporter (Using Test Account for Local Dev)
    // This block is now replaced by the setupEmail function called later.
    // try {
    //     let testAccount = await nodemailer.createTestAccount();
    //     transporter = nodemailer.createTransport({
    //         host: testAccount.smtp.host,
    //         port: testAccount.smtp.port,
    //         secure: testAccount.smtp.secure,
    //         auth: {
    //             user: testAccount.user,
    //             pass: testAccount.pass
    //         }
    //     });
    //     console.log("Test mailer initialized. You can view emails in the console output URLs.");
    // } catch (err) {
    //     console.error("Mailer setup failed:", err);
    // }
}

// ------------------------------------
// EMAIL NOTIFICATION SERVICE
// ------------------------------------
// The previous 'let transporter;' declaration here was redundant and removed.

async function setupEmail() {
    // Real SMTP configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log("✅ Email transporter configured with REAL SMTP credentials");
    } else {
        // Fallback to ethereal if no credentials
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("⚠️ No EMAIL_USER/PASS found in .env! Using Ethereal Mock Emails Instead.");
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

        const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const { password: _, ...safeUser } = user;
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });

        // --- SEND LOGIN EMAIL NOTIFICATION ---
        if (transporter) {
            try {
                let info = await transporter.sendMail({
                    from: '"MediCarePro Security" <security@medicare.pro>',
                    to: user.email,
                    html: `
                        <h3>Hello ${user.name},</h3>
                        <p>We wanted to let you know that a new login was detected on your account.</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                        <hr/>
                        <p style="color: #666; font-size: 12px;">If this was you, you can safely ignore this email.</p>
                    `
                });
                console.log("\n✅ Login notification email sent to:", user.email);
                console.log("🔗 Preview Email Content here: %s\n", nodemailer.getTestMessageUrl(info));
            } catch (err) {
                console.error("Failed to send login email:", err);
            }
        }

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

// ------------------------------------
// PATIENTS & APPOINTMENTS ROUTES
// ------------------------------------

// Get all appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await db.all(`
            SELECT a.*, p.name as patient_name, d.specialization as doctor_specialization, u.name as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN users u ON d.user_id = u.id
        `);
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching appointments' });
    }
});

// Get all patients
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await db.all(`
            SELECT p.*, u.name, u.email 
            FROM patients p
            JOIN users u ON p.user_id = u.id
        `);
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching patients' });
    }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
        const result = await db.run(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, 'Scheduled']
        );
        res.status(201).json({ id: result.lastID, message: 'Appointment created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating appointment' });
    }
});

// Update appointment status
app.put('/api/appointments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Appointment updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating appointment' });
    }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting appointment' });
    }
});

// Start application
bootstrap()
    .then(setupEmail)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Backend server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to start server:', err);
    });
