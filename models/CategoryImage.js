const mongoose = require('mongoose');

const CategoryImageSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  categorySlug: { type: String, required: true, index: true },
  image: { type: String, required: true },   // URL or Base64 data URI
  title: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CategoryImage', CategoryImageSchema);
