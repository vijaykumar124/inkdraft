/* ============================================================
   InkDraft Admin API Routes — JSON endpoints for React panel
   All routes protected by Bearer JWT via protectApi middleware
   ============================================================ */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const Admin = require('../models/Admin');
const Design = require('../models/Design');
const Category = require('../models/Category');
const CategoryImage = require('../models/CategoryImage');
const Testimonial = require('../models/Testimonial');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');
const User = require('../models/User');
const { protectApi } = require('../middleware/auth');
const connectDb = require('../config/connectDb');

// Helper to safely handle file uploads locally or fallback to Base64 (Vercel serverless read-only disk)
const handleFileUpload = async (file, fallbackUrl = '') => {
  if (!file) return fallbackUrl;
  try {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const uploadPath = path.join(uploadsDir, filename);
    await file.mv(uploadPath);
    return '/uploads/' + filename;
  } catch (err) {
    console.warn('Local file move failed (Vercel read-only filesystem), converting to Base64 Data URI:', err.message);
    const mime = file.mimetype || 'image/png';
    const base64 = file.data ? file.data.toString('base64') : '';
    return base64 ? `data:${mime};base64,${base64}` : fallbackUrl;
  }
};

// Ensure DB connected on every API call
router.use(async (req, res, next) => {
  await connectDb();
  next();
});

// ── Auth ──────────────────────────────────────────────────
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
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/me', protectApi, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ── Dashboard ──────────────────────────────────────────────
router.get('/dashboard', protectApi, async (req, res) => {
  try {
    const [totalOrders, pendingOrders, totalDesigns, totalCategories, totalUsers, recentOrders, ordersByStatus] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Design.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.find().sort('-createdAt').limit(5),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, data: { totalOrders, pendingOrders, totalDesigns, totalCategories, totalUsers, recentOrders, ordersByStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Designs ────────────────────────────────────────────────
router.get('/designs', protectApi, async (req, res) => {
  try {
    const designs = await Design.find().sort('-createdAt');
    res.json({ success: true, data: designs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/designs', protectApi, async (req, res) => {
  try {
    const { title, category, tags, isFeatured, imageUrl } = req.body;
    let image = imageUrl || '';
    if (req.files && req.files.image) {
      image = await handleFileUpload(req.files.image, image);
    }
    const tagsArr = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];
    const design = await Design.create({
      title,
      category,
      tags: tagsArr,
      isFeatured: isFeatured === true || isFeatured === 'true',
      image: image || 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80'
    });
    res.json({ success: true, message: 'Design created', data: design });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/designs/:id', protectApi, async (req, res) => {
  try {
    const { title, category, tags, isFeatured, isActive, imageUrl } = req.body;
    const update = {
      title,
      category,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isActive: isActive === true || isActive === 'true'
    };
    if (tags) update.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (imageUrl) update.image = imageUrl;
    if (req.files && req.files.image) {
      update.image = await handleFileUpload(req.files.image, update.image || '');
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
    const { name, slug, description, imageUrl } = req.body;
    let image = imageUrl || '';
    if (req.files && req.files.image) {
      image = await handleFileUpload(req.files.image, image);
    }
    const category = await Category.create({ name, slug, description, image });
    res.json({ success: true, message: 'Category created', data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/categories/:id', protectApi, async (req, res) => {
  try {
    const { name, slug, description, isActive, imageUrl } = req.body;
    const update = { name, slug, description, isActive: isActive === true || isActive === 'true' };
    if (imageUrl) update.image = imageUrl;
    if (req.files && req.files.image) {
      update.image = await handleFileUpload(req.files.image, update.image || '');
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
      Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    res.json({ success: true, data: { orders, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders/:id', protectApi, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/orders/:id', protectApi, async (req, res) => {
  try {
    const { status, quotedPrice, appointmentDate, adminNotes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, quotedPrice, appointmentDate, adminNotes },
      { new: true }
    );
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
    const { name, location, rating, review, tattooStyle, isApproved, isFeatured, avatarUrl } = req.body;
    let avatar = avatarUrl || '';
    if (req.files && req.files.avatar) {
      avatar = await handleFileUpload(req.files.avatar, avatar);
    }
    const testimonial = await Testimonial.create({
      name, location, rating, review, tattooStyle,
      isApproved: isApproved === true || isApproved === 'true',
      isFeatured: isFeatured === true || isFeatured === 'true',
      avatar
    });
    res.json({ success: true, message: 'Testimonial created', data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/testimonials/:id', protectApi, async (req, res) => {
  try {
    const { name, location, rating, review, tattooStyle, isApproved, isFeatured, avatarUrl } = req.body;
    const update = {
      name, location, rating, review, tattooStyle,
      isApproved: isApproved === true || isApproved === 'true',
      isFeatured: isFeatured === true || isFeatured === 'true'
    };
    if (avatarUrl) update.avatar = avatarUrl;
    if (req.files && req.files.avatar) {
      update.avatar = await handleFileUpload(req.files.avatar, update.avatar || '');
    }
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true });
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

// ── Pricing Plans ──────────────────────────────────────────
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
    const { name, price, period, description, features, isPopular } = req.body;
    const feats = Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : []);
    const plan = await Pricing.create({ name, price, period, description, features: feats, isPopular: isPopular === true || isPopular === 'true' });
    res.json({ success: true, message: 'Pricing plan created', data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/pricing/:id', protectApi, async (req, res) => {
  try {
    const { name, price, period, description, features, isPopular, isActive } = req.body;
    const update = { name, price, period, description, isPopular: isPopular === true || isPopular === 'true', isActive: isActive === true || isActive === 'true' };
    if (features) update.features = Array.isArray(features) ? features : features.split(',').map(f => f.trim());
    const plan = await Pricing.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: 'Pricing plan updated', data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/pricing/:id', protectApi, async (req, res) => {
  try {
    await Pricing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pricing plan deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Settings (Comprehensive Site & Section Settings) ───────
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
    let updates = { ...req.body };
    if (req.files) {
      for (const [fieldName, file] of Object.entries(req.files)) {
        const uploadedUrl = await handleFileUpload(file);
        if (uploadedUrl) updates[fieldName] = uploadedUrl;
      }
    }
    const ops = Object.entries(updates).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    );
    await Promise.all(ops);
    res.json({ success: true, message: 'Settings saved successfully' });
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

// ── Category Images (Gallery) ───────────────────────────────
// GET all images for a category
router.get('/category-images/:categoryId', protectApi, async (req, res) => {
  try {
    const images = await CategoryImage.find({ categoryId: req.params.categoryId }).sort('order createdAt');
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload one or more images to a category
router.post('/category-images/:categoryId', protectApi, async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const saved = [];

    // Handle file uploads (single or multiple — field name: 'images' or 'image')
    const fileFields = req.files ? Object.values(req.files) : [];
    const allFiles = [];
    fileFields.forEach(f => {
      if (Array.isArray(f)) allFiles.push(...f);
      else allFiles.push(f);
    });

    for (const file of allFiles) {
      const url = await handleFileUpload(file);
      if (url) {
        const img = await CategoryImage.create({
          categoryId: category._id,
          categorySlug: category.slug,
          image: url,
          title: req.body.title || ''
        });
        saved.push(img);
      }
    }

    // Handle imageUrls (comma-separated or array from body)
    const urls = req.body.imageUrls
      ? (Array.isArray(req.body.imageUrls) ? req.body.imageUrls : req.body.imageUrls.split(',').map(u => u.trim()).filter(Boolean))
      : (req.body.imageUrl ? [req.body.imageUrl.trim()] : []);

    for (const url of urls) {
      if (url) {
        const img = await CategoryImage.create({
          categoryId: category._id,
          categorySlug: category.slug,
          image: url,
          title: req.body.title || ''
        });
        saved.push(img);
      }
    }

    if (saved.length === 0) return res.status(400).json({ success: false, message: 'No images provided' });
    res.json({ success: true, message: `${saved.length} image(s) uploaded`, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE a single category image
router.delete('/category-images/:id', protectApi, async (req, res) => {
  try {
    await CategoryImage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
