const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Employer = require('../models/Employer');
const Otp = require('../models/Otp');
const Company = require('../models/Company');

router.use((req, res, next) => {
    res.locals.layout = 'layouts/auth';
    next();
});

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

router.get('/login', async (req, res) => {
    if (req.session && req.session.employer) {
        const exists = await Employer.findById(req.session.employer.id);
        if (exists) return res.redirect('/employer/dashboard');
        req.session.destroy();
    }
    res.render('employer/login', { title: 'JOBCARE - Employer Login', error: null });
});

router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    if (!mobile || mobile.trim().length < 10) {
        return res.render('employer/login', { title: 'JOBCARE - Employer Login', error: 'Please enter a valid mobile number' });
    }
    const cleanMobile = mobile.replace(/\s|-/g, '');
    try {
        await Otp.deleteMany({ mobile: cleanMobile, verified: false });
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.create({ mobile: cleanMobile, otp, expiresAt });
        res.render('employer/otp-verify', {
            title: 'JOBCARE - Verify OTP',
            mobile: cleanMobile,
            otp: otp,
            error: null
        });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.render('employer/login', { title: 'JOBCARE - Employer Login', error: 'Something went wrong. Please try again.' });
    }
});

router.get('/otp-verify', (req, res) => {
    const mobile = req.query.mobile;
    if (!mobile) return res.redirect('/employer/login');
    res.render('employer/otp-verify', {
        title: 'JOBCARE - Verify OTP',
        mobile: mobile,
        otp: null,
        error: null
    });
});

router.post('/verify-otp', async (req, res) => {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.redirect('/employer/login');
    try {
        const record = await Otp.findOne({
            mobile: mobile,
            otp: otp.trim(),
            verified: false,
            expiresAt: { $gt: new Date() }
        });
        if (!record) {
            return res.render('employer/otp-verify', {
                title: 'JOBCARE - Verify OTP',
                mobile: mobile,
                otp: null,
                error: 'Invalid or expired OTP. Please try again.'
            });
        }
        record.verified = true;
        await record.save();
        let employer = await Employer.findOne({ mobile: mobile });
        if (!employer) {
            employer = await Employer.create({ mobile: mobile });
        }
        req.session.employer = {
            id: employer._id,
            mobile: employer.mobile,
            name: employer.name,
            profileComplete: employer.profileComplete
        };
        if (employer.profileComplete) {
            return res.redirect('/employer/dashboard');
        }
        return res.redirect('/employer/onboarding');
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.render('employer/otp-verify', {
            title: 'JOBCARE - Verify OTP',
            mobile: mobile,
            otp: null,
            error: 'Something went wrong. Please try again.'
        });
    }
});

router.get('/onboarding', async (req, res) => {
    if (!req.session || !req.session.employer) return res.redirect('/employer/login');
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) return res.redirect('/employer/login');
        if (employer.profileComplete) return res.redirect('/employer/dashboard');
        const companies = await Company.find({}).sort({ name: 1 });
        res.render('employer/onboarding', {
            title: 'JOBCARE - Complete Your Profile',
            employer: employer,
            companies: companies.map(c => c.name),
            error: null
        });
    } catch (err) {
        console.error('Onboarding GET error:', err);
        res.redirect('/employer/login');
    }
});

router.post('/onboarding', async (req, res) => {
    if (!req.session || !req.session.employer) return res.redirect('/employer/login');
    const { name, companyName, isConsultancy, workEmail, companyAddress, agreedToToc } = req.body;
    if (!name || !name.trim()) {
        return res.render('employer/onboarding', {
            title: 'JOBCARE - Complete Your Profile',
            employer: req.session.employer,
            companies: [],
            error: 'Name is required'
        });
    }
    if (!companyName || !companyName.trim()) {
        return res.render('employer/onboarding', {
            title: 'JOBCARE - Complete Your Profile',
            employer: req.session.employer,
            companies: [],
            error: 'Company name is required'
        });
    }
    if (!workEmail || !workEmail.trim()) {
        return res.render('employer/onboarding', {
            title: 'JOBCARE - Complete Your Profile',
            employer: req.session.employer,
            companies: [],
            error: 'Work email is required'
        });
    }
    if (!agreedToToc) {
        return res.render('employer/onboarding', {
            title: 'JOBCARE - Complete Your Profile',
            employer: req.session.employer,
            companies: [],
            error: 'You must agree to the Terms & Conditions'
        });
    }
    try {
        const existingCompany = await Company.findOne({ name: companyName.trim() });
        if (!existingCompany) {
            await Company.create({ name: companyName.trim(), isDefault: false });
        }
        const employer = await Employer.findByIdAndUpdate(
            req.session.employer.id,
            {
                name: name.trim(),
                companyName: companyName.trim(),
                isConsultancy: isConsultancy === 'yes',
                workEmail: workEmail.trim(),
                companyAddress: companyAddress ? companyAddress.trim() : '',
                agreedToToc: true,
                profileComplete: true
            },
            { new: true }
        );
        req.session.employer.name = employer.name;
        req.session.employer.profileComplete = true;
        return res.redirect('/employer/dashboard');
    } catch (err) {
        console.error('Onboarding POST error:', err);
        res.render('employer/onboarding', {
            title: 'JOBCARE - Complete Your Profile',
            employer: req.session.employer,
            companies: [],
            error: 'Something went wrong. Please try again.'
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;
