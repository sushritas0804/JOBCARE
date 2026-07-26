const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },

    /* Step 1 — Job Details */
    companyName: { type: String, default: '' },
    title: { type: String, default: '' },
    customTitle: { type: String, default: '' },
    role: { type: String, default: '' },
    customRole: { type: String, default: '' },
    jobType: { type: String, enum: ['full-time', 'part-time', 'both', ''], default: '' },

    /* Step 1 — Location */
    workLocation: { type: String, enum: ['office', 'remote', 'field', ''], default: '' },
    officeAddress: { type: String, default: '' },
    fieldAddress: { type: String, default: '' },

    /* Step 1 — Compensation */
    payType: { type: String, enum: ['fixed', 'fixed-incentive', 'incentive', ''], default: '' },
    payMin: { type: Number, default: 0 },
    payMax: { type: Number, default: 0 },
    perks: { type: [String], default: [] },
    customPerk: { type: String, default: '' },
    joiningFee: { type: String, enum: ['yes', 'no', ''], default: '' },

    /* Steps 2–5 — placeholders, populated later */
    description: { type: String, default: '' },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    screeningQuestions: { type: [String], default: [] },
    publishSettings: { type: String, default: '' },

    /* Wizard state */
    currentStep: { type: Number, default: 1 },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
