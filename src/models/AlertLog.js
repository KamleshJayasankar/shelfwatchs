import mongoose from 'mongoose';

const alertLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  alertType: {
    type: String,
    enum: ['7-day', 'expired'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

alertLogSchema.index({ productId: 1, alertType: 1, sentAt: -1 });

export default mongoose.model('AlertLog', alertLogSchema);
