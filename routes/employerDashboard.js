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
        if (draft && draft.currentStep > 1) {
            return res.redirect('/employer/dashboard/jobs/create/step' + draft.currentStep);
        }

        const companies = await Company.find({}).sort({ name: 1 });
        const job = draft ? draft.toObject() : { title: '', customTitle: '', role: '', customRole: '', jobType: '', workLocation: '', officeAddress: '', fieldAddress: '', payType: '', payMin: '', payMax: '', perks: [], customPerk: '', joiningFee: '', companyName: employer.companyName };
        res.locals.layout = 'layouts/wizard';
        res.render('employer/job-post/step1', {
            title: 'JOBCARE - Post a New Job',
            employer: employer,
            companies: companies.map(c => c.name),
            job: job,
            currentStep: 1,
            error: null
        });
    } catch (err) {
        console.error('Job create GET error:', err);
        res.redirect('/employer/dashboard/jobs');
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
            error: 'Something went wrong. Please try again.'
        });
    }
});

module.exports = router;
