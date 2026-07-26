function isEmployer(req, res, next) {
    if (req.session && req.session.employer) {
        return next();
    }
    return res.redirect('/employer/login');
}

module.exports = isEmployer;
