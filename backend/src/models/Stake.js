const mongoose = require('mongoose');

const StakeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  vaultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vault',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['staking', 'unstaked'], 
    default: 'staking',
  },
  stakeDate: {
    type: Date,
    default: Date.now,
  },
  unlockDate: {
    type: Date,
    required: true,
  },
  unstakeDate: { 
    type: Date,
  },
  rewardsEarned: {
    type: Number,
  },
  stakeTxHash: {
    type: String,
    required: true,
  },
  unstakeTxHash: {
    type: String,
  },
});

module.exports = mongoose.model('Stake', StakeSchema);