const Employer = require('../models/Employer');

async function isEmployer(req, res, next) {
    if (!req.session || !req.session.employer) {
        return res.redirect('/employer/login');
    }
    try {
        const employer = await Employer.findById(req.session.employer.id);
        if (!employer) {
            req.session.destroy();
            return res.redirect('/employer/login');
        }
        next();
    } catch (err) {
        req.session.destroy();
        return res.redirect('/employer/login');
    }
}

module.exports = isEmployer;
