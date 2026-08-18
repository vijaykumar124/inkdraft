const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Artist = require('../models/Artist');
const Design = require('../models/Design');
const Category = require('../models/Category');
const Testimonial = require('../models/Testimonial');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// ── Auth ──────────────────────────────────────────────
exports.getLogin = (req, res) => {
  if (req.session.adminToken) return res.redirect('/admin/dashboard');
  res.render('admin/login', { title: 'Admin Login', layout: false, error: req.flash('error') });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    req.session.adminToken = token;
    admin.lastLogin = new Date();
    await admin.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    req.flash('error', 'Login failed');
    res.redirect('/admin/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
};

// ── Dashboard ─────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const [totalOrders, pendingOrders, totalArtists, totalDesigns, recentOrders, ordersByStatus] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Artist.countDocuments({ isActive: true }),
    Design.countDocuments({ isActive: true }),
    Order.find().sort('-createdAt').limit(5).populate('preferredArtist'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  res.render('admin/dashboard', {
    title: 'Dashboard', layout: 'layouts/admin',
    totalOrders, pendingOrders, totalArtists, totalDesigns, recentOrders, ordersByStatus
  });
};

// ── Artists ───────────────────────────────────────────
exports.getArtists = async (req, res) => {
  const artists = await Artist.find().sort('order');
  res.render('admin/artists', { title: 'Artists', layout: 'layouts/admin', artists });
};

exports.createArtist = async (req, res) => {
  try {
    const { name, specialty, experience, bio, instagram, rating } = req.body;
    let image = '/images/default-artist.jpg';
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      image = '/uploads/' + path.basename(uploadPath);
    }
    await Artist.create({ name, specialty, experience, bio, instagram, rating, image });
    res.json({ success: true, message: 'Artist created successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const { name, specialty, experience, bio, instagram, rating, isActive } = req.body;
    const update = { name, specialty, experience, bio, instagram, rating, isActive: isActive === 'true' };
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      update.image = '/uploads/' + path.basename(uploadPath);
    }
    await Artist.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, message: 'Artist updated successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Artist deleted' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Designs ───────────────────────────────────────────
exports.getDesigns = async (req, res) => {
  const designs = await Design.find().populate('artist').sort('-createdAt');
  const artists = await Artist.find({ isActive: true });
  res.render('admin/designs', { title: 'Designs', layout: 'layouts/admin', designs, artists });
};

exports.createDesign = async (req, res) => {
  try {
    const { title, category, artist, tags, isFeatured } = req.body;
    let image = '';
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      image = '/uploads/' + path.basename(uploadPath);
    }
    const tagsArr = tags ? tags.split(',').map(t => t.trim()) : [];
    await Design.create({ title, category, artist: artist || undefined, tags: tagsArr, isFeatured: isFeatured === 'true', image });
    res.json({ success: true, message: 'Design created' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateDesign = async (req, res) => {
  try {
    const { title, category, artist, tags, isFeatured, isActive } = req.body;
    const update = { title, category, artist: artist || undefined, isFeatured: isFeatured === 'true', isActive: isActive === 'true' };
    if (tags) update.tags = tags.split(',').map(t => t.trim());
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      update.image = '/uploads/' + path.basename(uploadPath);
    }
    await Design.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, message: 'Design updated' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteDesign = async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Design deleted' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Categories ────────────────────────────────────────
exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort('order');
  res.render('admin/categories', { title: 'Categories', layout: 'layouts/admin', categories });
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    let image = '';
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      image = '/uploads/' + path.basename(uploadPath);
    }
    await Category.create({ name, slug, description, image });
    res.json({ success: true, message: 'Category created' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;
    const update = { name, slug, description, isActive: isActive === 'true' };
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      update.image = '/uploads/' + path.basename(uploadPath);
    }
    await Category.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, message: 'Category updated' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Orders ────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  const { status, page = 1 } = req.query;
  const limit = 10;
  const query = status ? { status } : {};
  const [orders, total] = await Promise.all([
    Order.find(query).populate('preferredArtist').sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Order.countDocuments(query)
  ]);
  res.render('admin/orders', {
    title: 'Orders', layout: 'layouts/admin',
    orders, total, page: Number(page), pages: Math.ceil(total / limit), status
  });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('preferredArtist');
  res.json(order);
};

exports.updateOrder = async (req, res) => {
  try {
    const { status, quotedPrice, adminNotes, appointmentDate } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status, quotedPrice, adminNotes, appointmentDate });
    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Testimonials ──────────────────────────────────────
exports.getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find().sort('-createdAt');
  res.render('admin/testimonials', { title: 'Testimonials', layout: 'layouts/admin', testimonials });
};

exports.createTestimonial = async (req, res) => {
  try {
    const { name, location, rating, review, tattooStyle, isApproved, isFeatured } = req.body;
    let avatar = '';
    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      avatar = '/uploads/' + path.basename(uploadPath);
    }
    await Testimonial.create({ name, location, rating, review, tattooStyle, isApproved: isApproved === 'true', isFeatured: isFeatured === 'true', avatar });
    res.json({ success: true, message: 'Testimonial created' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const { name, location, rating, review, tattooStyle, isApproved, isFeatured } = req.body;
    await Testimonial.findByIdAndUpdate(req.params.id, {
      name, location, rating, review, tattooStyle,
      isApproved: isApproved === 'true', isFeatured: isFeatured === 'true'
    });
    res.json({ success: true, message: 'Testimonial updated' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Pricing ───────────────────────────────────────────
exports.getPricing = async (req, res) => {
  const plans = await Pricing.find().sort('order');
  res.render('admin/pricing', { title: 'Pricing', layout: 'layouts/admin', plans });
};

exports.createPricing = async (req, res) => {
  try {
    const { name, price, period, description, features, isPopular, ctaText } = req.body;
    const featuresArr = features ? features.split('\n').map(f => f.trim()).filter(Boolean) : [];
    await Pricing.create({ name, price, period, description, features: featuresArr, isPopular: isPopular === 'true', ctaText });
    res.json({ success: true, message: 'Pricing plan created' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const { name, price, period, description, features, isPopular, isActive, ctaText } = req.body;
    const featuresArr = features ? features.split('\n').map(f => f.trim()).filter(Boolean) : [];
    await Pricing.findByIdAndUpdate(req.params.id, {
      name, price, period, description, features: featuresArr,
      isPopular: isPopular === 'true', isActive: isActive === 'true', ctaText
    });
    res.json({ success: true, message: 'Pricing plan updated' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deletePricing = async (req, res) => {
  try {
    await Pricing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Settings ──────────────────────────────────────────
exports.getSettings = async (req, res) => {
  const settingsArr = await Settings.find({});
  const settings = {};
  settingsArr.forEach(s => settings[s.key] = s.value);
  res.render('admin/settings', { title: 'Settings', layout: 'layouts/admin', settings });
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Users ─────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.render('admin/users', { title: 'Registered Users', layout: 'layouts/admin', users });
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (isActive !== undefined) update.isActive = isActive === 'true' || isActive === true;
    await User.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

