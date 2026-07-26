require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const Company = require('./models/Company');
const defaultCompanies = require('./seed/companies');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
    const count = await Company.countDocuments();
    if (count === 0) {
        const docs = defaultCompanies.map(name => ({ name, isDefault: true }));
        await Company.insertMany(docs);
        console.log('Seeded', docs.length, 'default companies');
    }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'jobcare_fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const homeRoutes = require('./routes/home');
const employerAuthRoutes = require('./routes/employerAuth');
const employerDashboardRoutes = require('./routes/employerDashboard');

app.use('/', homeRoutes);
app.use('/employer', employerAuthRoutes);
app.use('/employer/dashboard', employerDashboardRoutes);

app.get('/api/companies', async (req, res) => {
    const q = req.query.q || '';
    try {
        const regex = new RegExp(q, 'i');
        const companies = await Company.find({ name: regex }).sort({ name: 1 }).limit(10);
        res.json(companies.map(c => c.name));
    } catch (err) {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`JOBCARE server running at http://localhost:${PORT}`);
});
