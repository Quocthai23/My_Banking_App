const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
  },
  keyHint: {
      type: String,
      required: true,
  },
  label: { 
    type: String,
    required: true,
  },
  permissions: { 
    type: [String],
    required: true,
    enum: ['read:balance', 'read:transactions', 'write:transfer'],
    default: [],
  },
  lastUsedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);