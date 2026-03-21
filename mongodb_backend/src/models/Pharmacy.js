const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    license_number: String,
    address: String
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
