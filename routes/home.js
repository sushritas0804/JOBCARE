const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'JOBCARE - AI-Powered Job Matching', current: 'home' });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'JOBCARE - About Us', current: 'about' });
});

router.get('/jobs', (req, res) => {
    res.render('jobs', { title: 'JOBCARE - Find Jobs', current: 'jobs' });
});

router.get('/ai-voice', (req, res) => {
    res.render('ai-voice', { title: 'JOBCARE - AI Voice Search', current: 'ai-voice' });
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'JOBCARE - Sign In', current: 'login' });
});

router.get('/signup', (req, res) => {
    res.render('signup', { title: 'JOBCARE - Create Account', current: 'signup' });
});

module.exports = router;
