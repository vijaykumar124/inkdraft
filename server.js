require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// ── Connect MongoDB Atlas ─────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected!'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, createParentPath: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'inkdraft_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(flash());

// Global flash variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));

// 404
app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Page not found', layout: 'layouts/main' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 InkDraft running → http://localhost:${PORT}`);
  console.log(`📊 Admin panel  → http://localhost:${PORT}/admin/login`);
  console.log(`🔑 admin@inkdraft.com / admin123\n`);
});
