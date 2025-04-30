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
  serviceFee: {
    type: Number,
    default: 0
  },
  transactionId: {
    type: String,
    required: true
  },
  khaltiToken: {
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
    default: 'khalti'
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