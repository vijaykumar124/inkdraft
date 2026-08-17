const Artist = require('../models/Artist');
const Design = require('../models/Design');
const Category = require('../models/Category');
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
    console.error('Settings query fallback:', err.message);
    return {};
  }
};

exports.getHomePage = async (req, res) => {
  try {
    // Ensure DB is connected or fail gracefully
    await connectDb();

    let artists = [], featuredDesigns = [], categories = [], testimonials = [], pricingPlans = [], settings = {}, galleryDesigns = [];

    try {
      const results = await Promise.allSettled([
        Artist.find({ isActive: true }).sort('order').limit(5),
        Design.find({ isFeatured: true, isActive: true }).sort('order').limit(6),
        Category.find({ isActive: true }).sort('order').limit(8),
        Testimonial.find({ isApproved: true, isFeatured: true }).sort('order').limit(6),
        Pricing.find({ isActive: true }).sort('order'),
        getSettings(),
        Design.find({ isActive: true }).sort('-createdAt').limit(8)
      ]);

      if (results[0].status === 'fulfilled') artists = results[0].value || [];
      if (results[1].status === 'fulfilled') featuredDesigns = results[1].value || [];
      if (results[2].status === 'fulfilled') categories = results[2].value || [];
      if (results[3].status === 'fulfilled') testimonials = results[3].value || [];
      if (results[4].status === 'fulfilled') pricingPlans = results[4].value || [];
      if (results[5].status === 'fulfilled') settings = results[5].value || {};
      if (results[6].status === 'fulfilled') galleryDesigns = results[6].value || [];
    } catch (dbErr) {
      console.error('DB query error:', dbErr.message);
    }

    res.render('index', {
      title: settings.siteTitle || 'InkDraft - Design Your Next Tattoo',
      metaDescription: settings.metaDescription || 'Premium tattoo studio with world-class artists.',
      artists, featuredDesigns, categories, testimonials, pricingPlans, settings, galleryDesigns,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('Homepage Error:', err);
    res.render('index', {
      title: 'InkDraft - Design Your Next Tattoo',
      metaDescription: 'Premium tattoo studio with world-class artists.',
      artists: [], featuredDesigns: [], categories: [], testimonials: [], pricingPlans: [], settings: {}, galleryDesigns: [],
      layout: 'layouts/main'
    });
  }
};

exports.submitOrder = async (req, res) => {
  try {
    await connectDb();
    const { clientName, clientEmail, clientPhone, tattooStyle, placement, size, description, budget, preferredArtist } = req.body;
    const order = new Order({
      clientName, clientEmail, clientPhone, tattooStyle,
      placement, size, description, budget,
      preferredArtist: preferredArtist || undefined
    });
    await order.save();
    res.json({ success: true, message: 'Order submitted! We will contact you within 24 hours.', orderNumber: order.orderNumber });
  } catch (err) {
    console.error('Order Submission Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to submit order.' });
  }
};
