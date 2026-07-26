const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');
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

module.exports = router;
