const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  period: { type: String, default: 'session' },
  description: { type: String },
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  ctaText: { type: String, default: 'Book Now' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Pricing', PricingSchema);
