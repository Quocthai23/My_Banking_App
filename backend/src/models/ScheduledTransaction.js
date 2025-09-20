const mongoose = require('mongoose');

const ScheduledTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromWallet: {
    type: String,
    required: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'],
  },
  toWallet: {
    type: String,
    required: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'],
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  // NÂNG CẤP: Thêm trường token để hỗ trợ trong tương lai
  token: {
    type: String,
    default: 'ETH',
  },
  executeAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  txHash: {
    type: String,
    default: null,
  },
  failureReason: {
      type: String,
      default: null,
  },
}, { timestamps: true });

ScheduledTransactionSchema.index({ status: 1, executeAt: 1 });

module.exports = mongoose.model('ScheduledTransaction', ScheduledTransactionSchema);
