const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    age: Number,
    gender: String,
    phone: String,
    address: String
});

module.exports = mongoose.model('Patient', patientSchema);
