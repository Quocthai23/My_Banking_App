const mongoose = require('mongoose');

const VaultSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  apy: { 
    type: Number,
    required: true,
  },
  lockDurationDays: {
    type: Number,
    required: true,
  },
  minStakeAmount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Vault', VaultSchema);