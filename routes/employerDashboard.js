const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Company = require('../models/Company');
const isEmployer = require('../middleware/isEmployer');

router.use(isEmployer);

router.use((req, res, next) => {
    res.locals.layout = 'layouts/dashboard';
    next();
});

router.get('/', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');
        res.render('employer/dashboard/index', {
            title: 'JOBCARE - Dashboard',
            employer: employer,
            activePage: 'overview'
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.redirect('/employer/logout');
    }
});

router.get('/jobs', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/jobs', {
            title: 'JOBCARE - Jobs',
            employer: employer,
            activePage: 'jobs'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.get('/database', (req, res) => {
    res.redirect('/employer/dashboard/database/search');
});

router.get('/database/search', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/search', {
            title: 'JOBCARE - Search Candidates',
            employer: employer,
            activePage: 'database',
            subPage: 'search'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.get('/database/saved', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/saved', {
            title: 'JOBCARE - Saved Candidates',
            employer: employer,
            activePage: 'database',
            subPage: 'saved'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.get('/database/unlocked', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/unlocked', {
            title: 'JOBCARE - Unlocked Candidates',
            employer: employer,
            activePage: 'database',
            subPage: 'unlocked'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.get('/reports', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/reports', {
            title: 'JOBCARE - Reports',
            employer: employer,
            activePage: 'reports'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.get('/credits', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/credits', {
            title: 'JOBCARE - Credits & Usage',
            employer: employer,
            activePage: 'credits'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.get('/billing', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        res.render('employer/dashboard/billing', {
            title: 'JOBCARE - Billing',
            employer: employer,
            activePage: 'billing'
        });
    } catch (err) {
        res.redirect('/employer/dashboard');
    }
});

router.post('/billing/gst', async (req, res) => {
    if (!req.session || !req.session.employer) return res.redirect('/employer/login');
    const { gstNumber } = req.body;
    try {
        await Employer.findByIdAndUpdate(req.session.employer.id, { gstNumber: gstNumber || null });
        return res.redirect('/employer/dashboard/billing');
    } catch (err) {
        console.error('GST update error:', err);
        return res.redirect('/employer/dashboard/billing');
    }
});

/* ═══════════════════════════════════════════════════
   JOB POSTING WIZARD
   ═══════════════════════════════════════════════════ */

router.get('/jobs/create', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
        const hasDraft = draft && draft.currentStep > 1;
        const draftStep = hasDraft ? draft.currentStep : null;

        const companies = await Company.find({}).sort({ name: 1 });
        const job = draft ? draft.toObject() : { title: '', customTitle: '', role: '', customRole: '', jobType: '', workLocation: '', officeAddress: '', fieldAddress: '', payType: '', payMin: '', payMax: '', perks: [], customPerk: '', joiningFee: '', companyName: employer.companyName };
        res.locals.layout = 'layouts/wizard';
        res.render('employer/job-post/step1', {
            title: 'JOBCARE - Post a New Job',
            employer: employer,
            companies: companies.map(c => c.name),
            job: job,
            currentStep: 1,
            hasDraft: hasDraft,
            draftStep: draftStep,
            error: null
        });
    } catch (err) {
        console.error('Job create GET error:', err);
        res.redirect('/employer/dashboard/jobs');
    }
});

router.post('/jobs/create/draft/delete', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');
        await Job.deleteMany({ employer: employer._id, status: 'draft' });
        return res.redirect('/employer/dashboard/jobs/create');
    } catch (err) {
        console.error('Draft delete error:', err);
        return res.redirect('/employer/dashboard/jobs/create');
    }
});

router.post('/jobs/create/step1', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const {
            companyName, title, customTitle, role, customRole, jobType,
            workLocation, officeAddress, fieldAddress,
            payType, payMin, payMax, perks, customPerk, joiningFee
        } = req.body;

        if (!companyName || !title || !jobType || !workLocation || !joiningFee) {
            const companies = await Company.find({}).sort({ name: 1 });
            res.locals.layout = 'layouts/wizard';
            return res.render('employer/job-post/step1', {
                title: 'JOBCARE - Post a New Job',
                employer: employer,
                companies: companies.map(c => c.name),
                job: req.body,
                currentStep: 1,
                hasDraft: false,
                draftStep: null,
                error: 'Please fill all required fields'
            });
        }

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });

        const jobData = {
            employer: employer._id,
            companyName: companyName.trim(),
            title: title === 'Other' ? 'Other' : title,
            customTitle: customTitle ? customTitle.trim() : '',
            role: role || '',
            customRole: customRole ? customRole.trim() : '',
            jobType: jobType,
            workLocation: workLocation,
            officeAddress: workLocation === 'office' ? (officeAddress || '').trim() : '',
            fieldAddress: workLocation === 'field' ? (fieldAddress || '').trim() : '',
            payType: payType || '',
            payMin: parseInt(payMin) || 0,
            payMax: parseInt(payMax) || 0,
            perks: perks ? (Array.isArray(perks) ? perks : [perks]) : [],
            customPerk: customPerk ? customPerk.trim() : '',
            joiningFee: joiningFee,
            currentStep: 2
        };

        if (draft) {
            await Job.findByIdAndUpdate(draft._id, jobData);
        } else {
            await Job.create(jobData);
        }

        return res.redirect('/employer/dashboard/jobs/create/step2');
    } catch (err) {
        console.error('Job create step1 POST error:', err);
        const companies = await Company.find({}).sort({ name: 1 });
        res.locals.layout = 'layouts/wizard';
        res.render('employer/job-post/step1', {
            title: 'JOBCARE - Post a New Job',
            employer: req.session.employer,
            companies: companies.map(c => c.name),
            job: req.body,
            currentStep: 1,
            hasDraft: false,
            draftStep: null,
            error: 'Something went wrong. Please try again.'
        });
    }
});

/* ─── Step 2: Candidate Requirements ─── */

router.get('/jobs/create/step2', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
        if (!draft || draft.currentStep < 2) return res.redirect('/employer/dashboard/jobs/create');

        const hasDraft = draft.currentStep > 2;
        const draftStep = hasDraft ? draft.currentStep : null;

        res.locals.layout = 'layouts/wizard';
        res.render('employer/job-post/step2', {
            title: 'JOBCARE - Candidate Requirements',
            employer: employer,
            job: draft.toObject(),
            currentStep: 2,
            hasDraft: hasDraft,
            draftStep: draftStep,
            error: null
        });
    } catch (err) {
        console.error('Job create step2 GET error:', err);
        res.redirect('/employer/dashboard/jobs');
    }
});

router.post('/jobs/create/step2', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const { minEducation, englishLevel, experienceLevel, additionalRequirements, jobDescription,
                preferredGender, preferredAgeMin, preferredAgeMax, preferredDegree, preferredIndustry } = req.body;

        if (!minEducation || !englishLevel || !experienceLevel) {
            const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
            const jobData = draft ? draft.toObject() : {};
            jobData.minEducation = minEducation || '';
            jobData.englishLevel = englishLevel || '';
            jobData.experienceLevel = experienceLevel || '';
            jobData.additionalRequirements = additionalRequirements ? additionalRequirements.split('|||').filter(Boolean) : [];
            jobData.jobDescription = jobDescription || '';
            jobData.preferredGender = preferredGender || '';
            jobData.preferredAgeMin = preferredAgeMin ? parseInt(preferredAgeMin) : 0;
            jobData.preferredAgeMax = preferredAgeMax ? parseInt(preferredAgeMax) : 0;
            jobData.preferredDegree = preferredDegree || '';
            jobData.preferredIndustry = preferredIndustry || '';

            return res.render('employer/job-post/step2', {
                title: 'JOBCARE - Candidate Requirements',
                employer: employer,
                job: jobData,
                currentStep: 2,
                hasDraft: false,
                draftStep: null,
                error: 'Please fill all required fields'
            });
        }

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
        if (!draft) return res.redirect('/employer/dashboard/jobs/create');

        const reqArray = additionalRequirements ? additionalRequirements.split('|||').filter(Boolean) : [];

        await Job.findByIdAndUpdate(draft._id, {
            minEducation,
            englishLevel,
            experienceLevel,
            additionalRequirements: reqArray,
            jobDescription: (jobDescription || '').trim(),
            preferredGender: preferredGender || '',
            preferredAgeMin: preferredAgeMin ? parseInt(preferredAgeMin) : 0,
            preferredAgeMax: preferredAgeMax ? parseInt(preferredAgeMax) : 0,
            preferredDegree: (preferredDegree || '').trim(),
            preferredIndustry: (preferredIndustry || '').trim(),
            currentStep: 3
        });

        return res.redirect('/employer/dashboard/jobs/create/step3');
    } catch (err) {
        console.error('Job create step2 POST error:', err);
        return res.redirect('/employer/dashboard/jobs/create/step2');
    }
});

/* ─── Step 3: Interviewer Information ─── */

router.get('/jobs/create/step3', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
        if (!draft || draft.currentStep < 3) return res.redirect('/employer/dashboard/jobs/create');

        const hasDraft = draft.currentStep > 3;
        const draftStep = hasDraft ? draft.currentStep : null;

        res.locals.layout = 'layouts/wizard';
        res.render('employer/job-post/step3', {
            title: 'JOBCARE - Interviewer Information',
            employer: employer,
            job: draft.toObject(),
            currentStep: 3,
            hasDraft: hasDraft,
            draftStep: draftStep,
            error: null
        });
    } catch (err) {
        console.error('Job create step3 GET error:', err);
        res.redirect('/employer/dashboard/jobs');
    }
});

router.post('/jobs/create/step3', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const {
            isWalkIn, companyAddressPreset, companyAddressCustom,
            walkInAddress, walkInFloorPlot, walkInStartDate, walkInEndDate,
            walkInStartTime, walkInEndTime, walkInInstructions,
            contactPreference, recruiterName, recruiterWhatsApp, recruiterEmail,
            whatsappAlerts
        } = req.body;

        /* Determine company address */
        const finalCompanyAddress = companyAddressPreset === 'Other'
            ? (companyAddressCustom || '').trim()
            : (companyAddressPreset || '').trim();

        /* Validation */
        const errors = [];
        if (!isWalkIn) errors.push('Please select walk-in interview option');
        if (isWalkIn === 'no' && !finalCompanyAddress) errors.push('Please provide the company address');
        if (isWalkIn === 'yes') {
            if (!walkInAddress) errors.push('Please provide the walk-in address');
            if (!walkInStartDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(walkInStartDate)) errors.push('Please enter a valid start date (dd/mm/yyyy)');
            if (!walkInEndDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(walkInEndDate)) errors.push('Please enter a valid end date (dd/mm/yyyy)');
            if (!walkInStartTime) errors.push('Please select walk-in start time');
            if (!walkInEndTime) errors.push('Please select walk-in end time');
        }
        if (!contactPreference) errors.push('Please select a communication preference');
        if (contactPreference === 'other') {
            if (!recruiterName) errors.push("Please provide the recruiter's name");
            if (!recruiterWhatsApp || !/^[0-9]{10}$/.test(recruiterWhatsApp)) errors.push("Please provide a valid 10-digit WhatsApp number");
            if (!recruiterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterEmail)) errors.push("Please provide a valid email address");
        }
        if (!whatsappAlerts) errors.push('Please select a notification preference');

        if (errors.length > 0) {
            const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
            const jobData = draft ? draft.toObject() : {};
            Object.assign(jobData, req.body);
            jobData.companyAddress = finalCompanyAddress;

            return res.render('employer/job-post/step3', {
                title: 'JOBCARE - Interviewer Information',
                employer: employer,
                job: jobData,
                currentStep: 3,
                hasDraft: false,
                draftStep: null,
                error: errors[0]
            });
        }

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
        if (!draft) return res.redirect('/employer/dashboard/jobs/create');

        await Job.findByIdAndUpdate(draft._id, {
            isWalkIn,
            companyAddress: finalCompanyAddress,
            walkInAddress: (walkInAddress || '').trim(),
            walkInFloorPlot: (walkInFloorPlot || '').trim(),
            walkInStartDate: (walkInStartDate || '').trim(),
            walkInEndDate: (walkInEndDate || '').trim(),
            walkInStartTime: walkInStartTime || '',
            walkInEndTime: walkInEndTime || '',
            walkInInstructions: (walkInInstructions || '').trim(),
            contactPreference,
            recruiterName: (recruiterName || '').trim(),
            recruiterWhatsApp: (recruiterWhatsApp || '').trim(),
            recruiterEmail: (recruiterEmail || '').trim(),
            whatsappAlerts,
            currentStep: 4
        });

        return res.redirect('/employer/dashboard/jobs/create/step4');
    } catch (err) {
        console.error('Job create step3 POST error:', err);
        return res.redirect('/employer/dashboard/jobs/create/step3');
    }
});

/* ─── Step 4: Job Preview ─── */

router.get('/jobs/create/step4', async (req, res) => {
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/logout');

        const draft = await Job.findOne({ employer: employer._id, status: 'draft' }).sort({ updatedAt: -1 });
        if (!draft || draft.currentStep < 4) return res.redirect('/employer/dashboard/jobs/create');

        res.locals.layout = 'layouts/wizard';
        res.render('employer/job-post/step4', {
            title: 'JOBCARE - Job Preview',
            employer: employer,
            job: draft.toObject(),
            currentStep: 4,
            error: null
        });
    } catch (err) {
        console.error('Job create step4 GET error:', err);
        res.redirect('/employer/dashboard/jobs');
    }
});

module.exports = router;
