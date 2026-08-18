const jwt = require('jsonwebtoken');
const User = require('../models/User');
const connectDb = require('../config/connectDb');

exports.signup = async (req, res) => {
  try {
    await connectDb();
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }
    const user = await User.create({ name, email, password, phone });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'inkdraft_jwt_secret', { expiresIn: '30d' });
    req.session.userToken = token;
    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({
      success: true,
      message: 'Account created successfully!',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
      token
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Signup failed' });
  }
};

exports.login = async (req, res) => {
  try {
    await connectDb();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'inkdraft_jwt_secret', { expiresIn: '30d' });
    req.session.userToken = token;
    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
      token
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
};

exports.logout = (req, res) => {
  req.session.userToken = null;
  req.session.user = null;
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.json({ success: true, message: 'Logged out' });
  }
  res.redirect('/');
};

exports.getMe = async (req, res) => {
  try {
    if (!req.session.userToken && !req.session.user) {
      return res.json({ success: false, loggedIn: false });
    }
    await connectDb();
    let userId = req.session.user?.id;
    if (req.session.userToken) {
      try {
        const decoded = jwt.verify(req.session.userToken, process.env.JWT_SECRET || 'inkdraft_jwt_secret');
        userId = decoded.id;
      } catch (e) {}
    }
    if (!userId) return res.json({ success: false, loggedIn: false });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.json({ success: false, loggedIn: false });
    res.json({ success: true, loggedIn: true, user });
  } catch (err) {
    res.json({ success: false, loggedIn: false });
  }
};
