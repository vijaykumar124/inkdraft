const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Session-based auth (EJS admin panel)
const protect = async (req, res, next) => {
  try {
    const token = req.session.adminToken;
    if (!token) return res.redirect('/admin/login');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inkdraft_jwt_secret');
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      req.session.destroy();
      return res.redirect('/admin/login');
    }
    req.admin = admin;
    res.locals.admin = admin;
    next();
  } catch (err) {
    req.session.destroy();
    res.redirect('/admin/login');
  }
};

// API auth — Bearer token for React admin panel
const protectApi = async (req, res, next) => {
  try {
    let token = null;
    // Check Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    // Fallback: check session (hybrid support)
    if (!token && req.session && req.session.adminToken) {
      token = req.session.adminToken;
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized — no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'inkdraft_jwt_secret');
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized — invalid admin' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized — token expired or invalid' });
  }
};

module.exports = { protect, protectApi };
