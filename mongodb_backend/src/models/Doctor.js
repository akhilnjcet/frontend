const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department_id: Number,
    specialization: String,
    fee: Number
});

module.exports = mongoose.model('Doctor', doctorSchema);
