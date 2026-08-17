const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String },
  tattooStyle: { type: String, required: true },
  placement: { type: String, required: true },
  size: { type: String, required: true },
  description: { type: String, required: true },
  referenceImages: [{ type: String }],
  budget: { type: String },
  preferredArtist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  quotedPrice: { type: Number },
  notes: { type: String },
  adminNotes: { type: String },
  appointmentDate: { type: Date }
}, { timestamps: true });

OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `INK-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
