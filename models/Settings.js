const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  group: { type: String, default: 'general' },
  label: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
