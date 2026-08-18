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
const connectDb = require('./config/connectDb');

const app = express();

// ── Connect MongoDB Atlas ─────────────────────────────────
connectDb();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Serve React Admin build at /admin
const reactAdminBuildPath = path.join(__dirname, 'admin-react/dist');
const fs = require('fs');
if (fs.existsSync(reactAdminBuildPath)) {
  app.use('/admin', express.static(reactAdminBuildPath));
}

// Serve React Public Website build at /react
const reactClientBuildPath = path.join(__dirname, 'client-react/dist');
if (fs.existsSync(reactClientBuildPath)) {
  app.use('/react', express.static(reactClientBuildPath));
  app.get('/react/*', (req, res) => {
    res.sendFile(path.join(reactClientBuildPath, 'index.html'));
  });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
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

// ── SEO Files ─────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /health\n\nSitemap: https://${req.hostname}/sitemap.xml`
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = `https://${req.hostname}`;
  const today = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  res.type('application/xml');
  res.send(sitemap);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? '✅ set' : '❌ missing',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set'
    }
  });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/public', require('./routes/publicApi'));    // Public API for React client
app.use('/api/user', require('./routes/userAuth'));       // User Signup / Login API
app.use('/admin/api', require('./routes/adminApi'));       // React Admin REST API
app.use('/admin-classic', require('./routes/admin'));     // Classic EJS admin backup

// Redirect old /admin-panel URLs to /admin
app.use('/admin-panel*', (req, res) => {
  const newPath = req.originalUrl.replace('/admin-panel', '/admin');
  res.redirect(301, newPath);
});

// Direct /admin and /admin/ to /admin/login
app.get(['/admin', '/admin/'], (req, res) => {
  res.redirect('/admin/login');
});

// React Admin SPA route (handles /admin/login, /admin/dashboard, etc.)
if (fs.existsSync(reactAdminBuildPath)) {
  app.get('/admin*', (req, res) => {
    res.sendFile(path.join(reactAdminBuildPath, 'index.html'));
  });
}

app.use('/', require('./routes/index'));

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { title: '404', message: 'Page not found', layout: 'layouts/main' });
});

// ── Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err.stack);
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ error: err.message });
  }
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
});

const PORT = process.env.PORT || 3000;

// On Vercel, the app is handled as a serverless function — don't call listen()
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 InkDraft running → http://localhost:${PORT}`);
    console.log(`📊 Admin panel  → http://localhost:${PORT}/admin/login`);
    console.log(`⚛️  React admin → http://localhost:${PORT}/admin-panel`);
    console.log(`🔑 admin@inkdraft.com / admin123\n`);
  });
}

module.exports = app;
