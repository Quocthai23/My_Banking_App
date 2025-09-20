const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // THAY ĐỔI: Đổi tên 'walletAddress' thành 'address' để nhất quán với các service khác (ví dụ: portfolioService)
  address: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  tier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tier',
    default: null,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not be unique
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referrals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  is2faEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorAuthSecret: String,
  twoFactorAuthTempSecret: String, 
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
