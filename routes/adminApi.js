/* ============================================================
   InkDraft Admin API Routes — JSON endpoints for React panel
   All routes protected by Bearer JWT via protectApi middleware
   ============================================================ */

const express = require('express');
const router = express.Router();
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
const { protectApi } = require('../middleware/auth');
const path = require('path');
const connectDb = require('../config/connectDb');

// Ensure DB connected on every API call
router.use(async (req, res, next) => {
  await connectDb();
  next();
});

// ── Auth ──────────────────────────────────────────────────
// POST /admin/api/login → returns JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'inkdraft_jwt_secret', { expiresIn: '7d' });
    admin.lastLogin = new Date();
    await admin.save();
    res.json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// GET /admin/api/me → current user info
router.get('/me', protectApi, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ── Dashboard ──────────────────────────────────────────────
router.get('/dashboard', protectApi, async (req, res) => {
  try {
    const [totalOrders, pendingOrders, totalArtists, totalDesigns, recentOrders, ordersByStatus] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Artist.countDocuments({ isActive: true }),
      Design.countDocuments({ isActive: true }),
      Order.find().sort('-createdAt').limit(5).populate('preferredArtist', 'name'),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, data: { totalOrders, pendingOrders, totalArtists, totalDesigns, recentOrders, ordersByStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Artists ────────────────────────────────────────────────
router.get('/artists', protectApi, async (req, res) => {
  try {
    const artists = await Artist.find().sort('order');
    res.json({ success: true, data: artists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/artists', protectApi, async (req, res) => {
  try {
    const { name, specialty, experience, bio, instagram, rating } = req.body;
    let image = '/images/default-artist.jpg';
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      image = '/uploads/' + path.basename(uploadPath);
    }
    const artist = await Artist.create({ name, specialty, experience, bio, instagram, rating, image });
    res.json({ success: true, message: 'Artist created', data: artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/artists/:id', protectApi, async (req, res) => {
  try {
    const { name, specialty, experience, bio, instagram, rating, isActive } = req.body;
    const update = { name, specialty, experience, bio, instagram, rating, isActive: isActive === true || isActive === 'true' };
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      update.image = '/uploads/' + path.basename(uploadPath);
    }
    const artist = await Artist.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: 'Artist updated', data: artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/artists/:id', protectApi, async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Designs ────────────────────────────────────────────────
router.get('/designs', protectApi, async (req, res) => {
  try {
    const designs = await Design.find().populate('artist', 'name').sort('-createdAt');
    res.json({ success: true, data: designs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/designs', protectApi, async (req, res) => {
  try {
    const { title, category, artist, tags, isFeatured } = req.body;
    let image = '';
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      image = '/uploads/' + path.basename(uploadPath);
    }
    const tagsArr = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];
    const design = await Design.create({ title, category, artist: artist || undefined, tags: tagsArr, isFeatured: isFeatured === true || isFeatured === 'true', image });
    res.json({ success: true, message: 'Design created', data: design });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/designs/:id', protectApi, async (req, res) => {
  try {
    const { title, category, artist, tags, isFeatured, isActive } = req.body;
    const update = { title, category, artist: artist || undefined, isFeatured: isFeatured === true || isFeatured === 'true', isActive: isActive === true || isActive === 'true' };
    if (tags) update.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      update.image = '/uploads/' + path.basename(uploadPath);
    }
    const design = await Design.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: 'Design updated', data: design });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/designs/:id', protectApi, async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Design deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Categories ─────────────────────────────────────────────
router.get('/categories', protectApi, async (req, res) => {
  try {
    const categories = await Category.find().sort('order');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/categories', protectApi, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    let image = '';
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      image = '/uploads/' + path.basename(uploadPath);
    }
    const category = await Category.create({ name, slug, description, image });
    res.json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/categories/:id', protectApi, async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;
    const update = { name, slug, description, isActive: isActive === true || isActive === 'true' };
    if (req.files && req.files.image) {
      const file = req.files.image;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      update.image = '/uploads/' + path.basename(uploadPath);
    }
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/categories/:id', protectApi, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Orders ─────────────────────────────────────────────────
router.get('/orders', protectApi, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(query).populate('preferredArtist', 'name').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    res.json({ success: true, data: { orders, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders/:id', protectApi, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('preferredArtist', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/orders/:id', protectApi, async (req, res) => {
  try {
    const { status, quotedPrice, adminNotes, appointmentDate } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, quotedPrice, adminNotes, appointmentDate }, { new: true });
    res.json({ success: true, message: 'Order updated', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Testimonials ───────────────────────────────────────────
router.get('/testimonials', protectApi, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort('-createdAt');
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/testimonials', protectApi, async (req, res) => {
  try {
    const { name, location, rating, review, tattooStyle, isApproved, isFeatured } = req.body;
    let avatar = '';
    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      const uploadPath = path.join(__dirname, '../public/uploads/', Date.now() + '_' + file.name);
      await file.mv(uploadPath);
      avatar = '/uploads/' + path.basename(uploadPath);
    }
    const testimonial = await Testimonial.create({ name, location, rating, review, tattooStyle, isApproved: isApproved === true || isApproved === 'true', isFeatured: isFeatured === true || isFeatured === 'true', avatar });
    res.json({ success: true, message: 'Testimonial created', data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/testimonials/:id', protectApi, async (req, res) => {
  try {
    const { name, location, rating, review, tattooStyle, isApproved, isFeatured } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, {
      name, location, rating, review, tattooStyle,
      isApproved: isApproved === true || isApproved === 'true',
      isFeatured: isFeatured === true || isFeatured === 'true'
    }, { new: true });
    res.json({ success: true, message: 'Testimonial updated', data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/testimonials/:id', protectApi, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Pricing ────────────────────────────────────────────────
router.get('/pricing', protectApi, async (req, res) => {
  try {
    const plans = await Pricing.find().sort('order');
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/pricing', protectApi, async (req, res) => {
  try {
    const { name, price, period, description, features, isPopular, ctaText } = req.body;
    const featuresArr = features ? (Array.isArray(features) ? features : features.split('\n').map(f => f.trim()).filter(Boolean)) : [];
    const plan = await Pricing.create({ name, price, period, description, features: featuresArr, isPopular: isPopular === true || isPopular === 'true', ctaText });
    res.json({ success: true, message: 'Pricing plan created', data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/pricing/:id', protectApi, async (req, res) => {
  try {
    const { name, price, period, description, features, isPopular, isActive, ctaText } = req.body;
    const featuresArr = features ? (Array.isArray(features) ? features : features.split('\n').map(f => f.trim()).filter(Boolean)) : [];
    const plan = await Pricing.findByIdAndUpdate(req.params.id, {
      name, price, period, description, features: featuresArr,
      isPopular: isPopular === true || isPopular === 'true',
      isActive: isActive === true || isActive === 'true', ctaText
    }, { new: true });
    res.json({ success: true, message: 'Plan updated', data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/pricing/:id', protectApi, async (req, res) => {
  try {
    await Pricing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Settings ───────────────────────────────────────────────
router.get('/settings', protectApi, async (req, res) => {
  try {
    const settingsArr = await Settings.find({});
    const settings = {};
    settingsArr.forEach(s => settings[s.key] = s.value);
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/settings', protectApi, async (req, res) => {
  try {
    const updates = req.body;
    const ops = Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Users Management ───────────────────────────────────────
router.get('/users', protectApi, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id', protectApi, async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (isActive !== undefined) update.isActive = isActive === true || isActive === 'true';
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/users/:id', protectApi, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
