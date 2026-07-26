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

    /* Step 2 — Candidate Requirements */
    minEducation: { type: String, enum: ['below-10th','10th','12th','diploma','iti','graduate','post-graduate',''], default: '' },
    englishLevel: { type: String, enum: ['none','basic','good',''], default: '' },
    experienceLevel: { type: String, enum: ['any','experienced','freshers',''], default: '' },
    additionalRequirements: { type: [String], default: [] },
    jobDescription: { type: String, default: '' },

    /* Step 3 — Interviewer Information */
    isWalkIn: { type: String, enum: ['yes', 'no', ''], default: '' },
    companyAddress: { type: String, default: '' },
    walkInAddress: { type: String, default: '' },
    walkInFloorPlot: { type: String, default: '' },
    walkInStartDate: { type: String, default: '' },
    walkInEndDate: { type: String, default: '' },
    walkInStartTime: { type: String, default: '' },
    walkInEndTime: { type: String, default: '' },
    walkInInstructions: { type: String, default: '' },
    contactPreference: { type: String, enum: ['self', 'other', 'none', ''], default: '' },
    recruiterName: { type: String, default: '' },
    recruiterWhatsApp: { type: String, default: '' },
    recruiterEmail: { type: String, default: '' },
    whatsappAlerts: { type: String, enum: ['yes', 'no', ''], default: '' },

    /* Steps 4–5 — placeholders, populated later */
    publishSettings: { type: String, default: '' },

    /* Wizard state */
    currentStep: { type: Number, default: 1 },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
