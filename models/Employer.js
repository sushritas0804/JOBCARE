const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true, trim: true },
    name: { type: String, default: '' },
    companyName: { type: String, default: '' },
    isConsultancy: { type: Boolean, default: false },
    workEmail: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    agreedToToc: { type: Boolean, default: false },
    gstNumber: { type: String, default: null },
    profileComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);
