const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  support: {
    type: Boolean, 
    required: true,
  },
  votingPower: {
    type: Number,
    required: true,
  },
  txHash: {
      type: String,
  }
}, { timestamps: true });
VoteSchema.index({ voterId: 1, proposalId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);