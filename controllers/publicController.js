const Artist = require('../models/Artist');
const Design = require('../models/Design');
const Category = require('../models/Category');
const Testimonial = require('../models/Testimonial');
const Pricing = require('../models/Pricing');
const Settings = require('../models/Settings');
const Order = require('../models/Order');

const getSettings = async () => {
  const settings = await Settings.find({});
  const result = {};
  settings.forEach(s => result[s.key] = s.value);
  return result;
};

exports.getHomePage = async (req, res) => {
  try {
    const [artists, featuredDesigns, categories, testimonials, pricingPlans, settings, galleryDesigns] = await Promise.all([
      Artist.find({ isActive: true }).sort('order').limit(5),
      Design.find({ isFeatured: true, isActive: true }).sort('order').limit(6),
      Category.find({ isActive: true }).sort('order').limit(8),
      Testimonial.find({ isApproved: true, isFeatured: true }).sort('order').limit(6),
      Pricing.find({ isActive: true }).sort('order'),
      getSettings(),
      Design.find({ isActive: true }).sort('-createdAt').limit(8)
    ]);

    res.render('index', {
      title: settings.siteTitle || 'InkDraft - Design Your Next Tattoo',
      metaDescription: settings.metaDescription || 'Premium tattoo studio with world-class artists.',
      artists, featuredDesigns, categories, testimonials, pricingPlans, settings, galleryDesigns,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('Homepage Error:', err);
    // On Vercel, return JSON so we can debug
    if (process.env.VERCEL) {
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
    res.status(500).render('error', { message: 'Server Error', layout: 'layouts/main' });
  }
};

exports.submitOrder = async (req, res) => {
  try {
    const { clientName, clientEmail, clientPhone, tattooStyle, placement, size, description, budget, preferredArtist } = req.body;
    const order = new Order({
      clientName, clientEmail, clientPhone, tattooStyle,
      placement, size, description, budget,
      preferredArtist: preferredArtist || undefined
    });
    await order.save();
    res.json({ success: true, message: 'Order submitted! We will contact you within 24 hours.', orderNumber: order.orderNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit order.' });
  }
};
