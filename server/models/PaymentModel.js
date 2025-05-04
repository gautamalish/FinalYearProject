const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'completed', 'failed', 'refunded'],
    default: 'initiated'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'khalti', 'other'],
    default: 'stripe'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Payment', paymentSchema);