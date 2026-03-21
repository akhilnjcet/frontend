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

// SCHEMAS
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    specialization: String,
    created_at: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    age: Number,
    gender: String,
    phone: String,
    address: String
});

const doctorSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department_id: Number,
    specialization: String,
    fee: Number
});

const appointmentSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment_date: { type: String, required: true },
    appointment_time: { type: String, required: true },
    status: { type: String, default: 'Scheduled' }
});

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// INITIALIZE ADMIN
async function seedAdmin() {
    try {
        const admin = await User.findOne({ email: 'admin@medicare.pro' });
        if (!admin) {
            await User.create({
                name: 'Admin User',
                email: 'admin@medicare.pro',
                password: 'admin123',
                role: 'admin'
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

// ------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const safeUser = user.toJSON();
        delete safeUser.password;
        
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1d' });

        // Email Notification
        if (transporter) {
            transporter.sendMail({
                from: '"MediCarePro Security" <security@medicare.pro>',
                to: user.email,
                html: `
                    <h3>Hello ${user.name},</h3>
                    <p>New login detected on your account.</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                `
            }).then(info => {
                if (info.messageId && !process.env.EMAIL_USER) {
                    console.log("🔗 Preview Login Email:", nodemailer.getTestMessageUrl(info));
                }
            }).catch(console.error);
        }

        res.json({ token, user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role, specialization } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        const newUser = await User.create({ name, email, password, role, specialization });
        const safeUser = newUser.toJSON();
        delete safeUser.password;
        
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, SECRET, { expiresIn: '1d' });

        // Also create Patient or Doctor records if necessary, though old SQLite code didn't
        if (role === 'patient') {
            await Patient.create({ user_id: newUser._id });
        } else if (role === 'doctor') {
            await Doctor.create({ user_id: newUser._id, specialization });
        }

        res.status(201).json({ message: 'User created successfully', token, user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ------------------------------------
// PATIENTS & APPOINTMENTS ROUTES
// ------------------------------------

app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate({
                path: 'patient_id',
                populate: { path: 'user_id', select: 'name' }
            })
            .populate({
                path: 'doctor_id',
                populate: { path: 'user_id', select: 'name' }
            });

        // Flatten the data structurally equivalent to original SQLite JOIN
        const formatted = appointments.map(app => {
            const data = app.toJSON();
            const pName = app.patient_id?.user_id?.name || 'Unknown Patient';
            const dName = app.doctor_id?.user_id?.name || 'Unknown Doctor';
            const dSpec = app.doctor_id?.specialization || '';
            
            // Send back simple flat structure expected by frontend
            return {
                id: data.id,
                patient_id: data.patient_id?.id || data.patient_id,
                doctor_id: data.doctor_id?.id || data.doctor_id,
                appointment_date: data.appointment_date,
                appointment_time: data.appointment_time,
                status: data.status,
                patient_name: pName,
                doctor_specialization: dSpec,
                doctor_name: dName
            };
        });
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching appointments' });
    }
});

app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find().populate('user_id', 'name email');
        
        // Flatten
        const formatted = patients.map(p => {
            const data = p.toJSON();
            return {
                id: data.id,
                user_id: data.user_id?.id || data.user_id,
                age: data.age,
                gender: data.gender,
                phone: data.phone,
                address: data.address,
                name: p.user_id?.name,
                email: p.user_id?.email
            };
        });
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching patients' });
    }
});

// For demonstration: get doctors
app.get('/api/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('user_id', 'name email');
        const formatted = doctors.map(d => {
            const data = d.toJSON();
            return {
                id: data.id,
                user_id: data.user_id?.id || data.user_id,
                department_id: data.department_id,
                specialization: data.specialization,
                fee: data.fee,
                name: d.user_id?.name,
                email: d.user_id?.email
            };
        });
        res.json(formatted);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
        const result = await Appointment.create({
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            status: 'Scheduled'
        });
        res.status(201).json({ id: result._id, message: 'Appointment created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating appointment' });
    }
});

app.put('/api/appointments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await Appointment.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Appointment updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating appointment' });
    }
});

app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting appointment' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 MongoDB Backend server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
