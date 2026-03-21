/* eslint-disable */
/* eslint-env node */
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const SECRET = process.env.JWT_SECRET || 'medicare_pro_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare_pro';

let transporter;

// --- MONGOOSE SETUP ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Modify toJSON so _id becomes id globally. 
// Important for frontend components relying on `id`.
mongoose.plugin(schema => {
    schema.set('toJSON', {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    });
});

// SCHEMAS removed. Models imported from src/models.
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

// INITIALIZE ADMIN
async function seedAdmin() {
    try {
        const admin = await User.findOne({ email: 'admin@medicare.pro' });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await User.create({
                name: 'Admin User',
                email: 'admin@medicare.pro',
                password: hashedPassword,
                role: 'ADMIN'
            });
            console.log("✅ Default Admin Created: admin@medicare.pro / admin123");
        }
    } catch (err) {
        console.error("Error seeding admin:", err);
    }
}
seedAdmin();

// EMAIL SETUP
async function setupEmail() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log("✅ Email configured with REAL SMTP credentials");
    } else {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log("⚠️ Using Ethereal Mock Emails (No EMAIL_USER found in .env)");
    }
}
setupEmail();

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Pass `io` instance to all routes via req object
app.use((req, res, next) => {
    req.io = io;
    next();
});

const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/api');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

io.on('connection', (socket) => {
    console.log('🔗 Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => {
        console.log(`🚀 MongoDB Backend server running on http://localhost:${PORT}`);
    });
}

// Export `server` for normal hosts, but keep `app` default for Vercel
module.exports = app;
