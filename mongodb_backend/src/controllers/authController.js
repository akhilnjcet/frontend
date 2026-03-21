const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Pharmacy = require('../models/Pharmacy');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password, name, role, specialization } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const validRoles = ['DOCTOR', 'PATIENT', 'PHARMACY'];
        if (role === 'ADMIN') return res.status(403).json({ error: 'Registering as ADMIN is blocked.' });
        if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role selection.' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email is already in use.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, role, specialization });

        if (role === 'PATIENT') await Patient.create({ user_id: newUser._id });
        if (role === 'DOCTOR') await Doctor.create({ user_id: newUser._id, specialization });
        if (role === 'PHARMACY') await Pharmacy.create({ user_id: newUser._id });

        const safeUser = newUser.toJSON();
        delete safeUser.password;
        
        res.status(201).json({ message: 'User created successfully', user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) return res.status(400).json({ error: 'Email, password, and role required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        if (user.status === 'blocked') {
            return res.status(403).json({ error: 'Your account has been blocked by the administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        if (user.role !== role && user.role !== 'admin' && user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Profile does not match selected role.' });
        }

        const safeUser = user.toJSON();
        delete safeUser.password;
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'medicare_pro_super_secret_key_123', { expiresIn: '1d' });

        res.json({ token, user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
