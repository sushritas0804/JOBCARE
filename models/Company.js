const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    isDefault: { type: Boolean, default: false }
});

module.exports = mongoose.model('Company', companySchema);
