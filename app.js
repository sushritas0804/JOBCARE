const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index', { title: 'JOBCARE - AI-Powered Job Matching', current: 'home' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'JOBCARE - About Us', current: 'about' });
});

app.get('/jobs', (req, res) => {
    res.render('jobs', { title: 'JOBCARE - Find Jobs', current: 'jobs' });
});

app.get('/ai-voice', (req, res) => {
    res.render('ai-voice', { title: 'JOBCARE - AI Voice Search', current: 'ai-voice' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'JOBCARE - Sign In', current: 'login' });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'JOBCARE - Create Account', current: 'signup' });
});

app.listen(PORT, () => {
    console.log(`JOBCARE server running at http://localhost:${PORT}`);
});
