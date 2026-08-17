const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Design', DesignSchema);
