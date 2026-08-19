/* ============================================================
   InkDraft Public API Routes — JSON endpoints for Public React site
   ============================================================ */

const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const Design = require('../models/Design');
const Category = require('../models/Category');
const CategoryImage = require('../models/CategoryImage');
const Testimonial = require('../models/Testimonial');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const connectDb = require('../config/connectDb');

const getSettings = async () => {
  try {
    const settings = await Settings.find({});
    const result = {};
    settings.forEach(s => result[s.key] = s.value);
    return result;
  } catch (err) {
    return {};
  }
};

// GET /api/public/homepage — Returns all homepage data for React frontend
router.get('/homepage', async (req, res) => {
  try {
    await connectDb();
    const results = await Promise.allSettled([
      Artist.find({ isActive: true }).sort('order').limit(6),
      Design.find({ isFeatured: true, isActive: true }).sort('order').limit(8),
      Category.find({ isActive: true }).sort('order').limit(12),
      Testimonial.find({ isApproved: true, isFeatured: true }).sort('order').limit(6),
      Pricing.find({ isActive: true }).sort('order'),
      getSettings(),
      Design.find({ isActive: true }).sort('-createdAt').limit(12)
    ]);

    const artists = results[0].status === 'fulfilled' ? results[0].value : [];
    const featuredDesigns = results[1].status === 'fulfilled' ? results[1].value : [];
    const categories = results[2].status === 'fulfilled' ? results[2].value : [];
    const testimonials = results[3].status === 'fulfilled' ? results[3].value : [];
    const pricingPlans = results[4].status === 'fulfilled' ? results[4].value : [];
    const settings = results[5].status === 'fulfilled' ? results[5].value : {};
    const galleryDesigns = results[6].status === 'fulfilled' ? results[6].value : [];

    res.json({
      success: true,
      data: {
        artists,
        featuredDesigns,
        categories,
        testimonials,
        pricingPlans,
        settings,
        galleryDesigns
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/public/order — Order submission endpoint
router.post('/order', async (req, res) => {
  try {
    await connectDb();
    const { clientName, clientEmail, clientPhone, tattooStyle, placement, size, description, budget, preferredArtist } = req.body;
    if (!clientName || !clientEmail || !description) {
      return res.status(400).json({ success: false, message: 'Name, email, and description are required.' });
    }
    const order = new Order({
      clientName, clientEmail, clientPhone, tattooStyle,
      placement, size, description, budget,
      preferredArtist: preferredArtist || undefined
    });
    await order.save();
    res.json({ success: true, message: 'Consultation request submitted! We will contact you within 24 hours.', orderNumber: order.orderNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit request.' });
  }
});

// GET /api/public/category/:slug — Category info + all gallery images
router.get('/category/:slug', async (req, res) => {
  try {
    await connectDb();
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const images = await CategoryImage.find({ categoryId: category._id }).sort('order createdAt');
    res.json({ success: true, data: { category, images } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
