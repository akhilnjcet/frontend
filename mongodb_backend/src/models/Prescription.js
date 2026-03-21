const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicines: [{
        name: String,
        dosage: String,
        duration: String,
        instructions: String
    }],
    notes: String,
    status: {
        type: String,
        enum: ['CREATED', 'SENT_TO_PHARMACY', 'DISPENSED'],
        default: 'CREATED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
