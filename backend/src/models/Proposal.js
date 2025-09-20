const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  proposerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'succeeded', 'defeated', 'queued', 'executed'],
    default: 'pending',
  },
  actions: {
    type: [mongoose.Schema.Types.Mixed],
  },
  forVotes: { type: Number, default: 0 },
  againstVotes: { type: Number, default: 0 },
  startBlock: { type: Number },
  endBlock: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);