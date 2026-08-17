const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String, default: '5+ years' },
  bio: { type: String },
  image: { type: String, default: '/images/default-artist.jpg' },
  instagram: { type: String },
  portfolio: [{ type: String }],
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Artist', ArtistSchema);
