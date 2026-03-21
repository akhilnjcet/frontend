/* eslint-disable no-unused-vars */
/* eslint-env node */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const hasRole = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Pharmacy = require('../models/Pharmacy');
const Prescription = require('../models/Prescription');

// ==========================================
// ADMIN API
// ==========================================
// GET /api/admin/users
router.get('/admin/users', auth, hasRole(['ADMIN']), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// DELETE /api/admin/user/:id
router.delete('/admin/user/:id', auth, hasRole(['ADMIN']), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

// PUT /api/admin/user/:id/block (Approve/Block users)
router.put('/admin/user/:id/block', auth, hasRole(['ADMIN']), async (req, res) => {
    try {
        const { status } = req.body;
        await User.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: `User status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating user' });
    }
});

// GET /api/admin/stats
router.get('/admin/stats', auth, hasRole(['ADMIN']), async (req, res) => {
    try {
        const doctors = await Doctor.countDocuments();
        const patients = await Patient.countDocuments();
        const pharmacies = await Pharmacy.countDocuments();
        const prescriptions = await Prescription.countDocuments();
        res.json({ doctors, patients, pharmacies, prescriptions });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});


// ==========================================
// DOCTOR API
// ==========================================
// POST /api/prescriptions
router.post('/prescriptions', auth, hasRole(['DOCTOR']), async (req, res) => {
    try {
        const { patientId, medicines, notes } = req.body;
        const prescription = await Prescription.create({
            doctorId: req.user.id,
            patientId,
            medicines,
            notes,
            status: 'CREATED'
        });
        res.status(201).json(prescription);
    } catch (err) {
        res.status(500).json({ error: 'Server error creating prescription' });
    }
});

// PUT /api/prescriptions/send/:id
router.put('/prescriptions/send/:id', auth, hasRole(['DOCTOR']), async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id, 
            { status: 'SENT_TO_PHARMACY' }, 
            { new: true }
        ).populate('patientId', 'name email').populate('doctorId', 'name email');
        
        req.io.emit('prescription_sent', prescription); // Instant Update -> Pharmacy

        res.json(prescription);
    } catch (err) {
        res.status(500).json({ error: 'Server error sending prescription' });
    }
});

router.get('/doctors/patients', auth, hasRole(['DOCTOR']), async (req, res) => {
    try {
        // Technically all patients, but we can return basic info
        const patients = await User.find({ role: 'PATIENT', status: 'active' }).select('name email');
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ==========================================
// PHARMACY API
// ==========================================
// GET /api/prescriptions/pharmacy
router.get('/prescriptions/pharmacy', auth, hasRole(['PHARMACY', 'ADMIN']), async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ status: { $in: ['SENT_TO_PHARMACY', 'DISPENSED'] } })
            .populate('patientId', 'name email')
            .populate('doctorId', 'name email');
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching pharmacy prescriptions' });
    }
});

// PUT /api/prescriptions/dispense/:id
router.put('/prescriptions/dispense/:id', auth, hasRole(['PHARMACY']), async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id, 
            { status: 'DISPENSED' }, 
            { new: true }
        ).populate('patientId', 'name email').populate('doctorId', 'name email');

        req.io.emit('prescription_dispensed', prescription); // Instant Update -> Patient

        res.json(prescription);
    } catch (err) {
        res.status(500).json({ error: 'Server error dispensing prescription' });
    }
});


// ==========================================
// PATIENT API
// ==========================================
// GET /api/prescriptions/my
router.get('/prescriptions/my', auth, hasRole(['PATIENT']), async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.user.id })
            .populate('doctorId', 'name email')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching my prescriptions' });
    }
});

// Also returning older common routes simply to not break the frontend if used:
router.get('/patients', auth, async (req, res) => {
    const patients = await Patient.find().populate('user_id', 'name email');
    res.json(patients);
});

router.get('/doctors', async (req, res) => {
    const doctors = await Doctor.find().populate('user_id', 'name email');
    res.json(doctors);
});

module.exports = router;
