const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment_date: { type: String, required: true },
    appointment_time: { type: String, required: true },
    status: { type: String, default: 'Scheduled' },
    prescriptions: [{
        diagnosis: String,
        note: String,
        medicines: [String],
        status: { type: String, enum: ['Issued', 'Fulfilled'], default: 'Issued' }
    }]
});

module.exports = mongoose.model('Appointment', appointmentSchema);
