const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'StrategyVault', required: true },
  amount: { type: Number, required: true },
  shares: { type: Number, required: true },
  status: { type: String, enum: ['active', 'withdrawn'], default: 'active' },
  depositTxHash: { type: String, required: true },
  withdrawTxHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Deposit', DepositSchema);