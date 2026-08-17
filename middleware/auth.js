const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

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

module.exports = { protect };
