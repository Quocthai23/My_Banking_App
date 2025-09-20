const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const { logger } = require('../config');

// Tạo một secret mới cho người dùng
exports.generateSecret = async (userId) => {
  const secret = speakeasy.generateSecret({
    name: `MyBankingApp (${userId})`,
  });

  await User.findByIdAndUpdate(userId, { twoFactorSecret: secret });
  
  logger.info(`Generated 2FA secret for user ${userId}`);
  return secret;
};

// Tạo mã QR từ otpauth_url
exports.generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (err) {
    logger.error(`Failed to generate QR code: ${err.message}`);
    throw new Error('Could not generate QR code');
  }
};

// Xác thực mã token do người dùng cung cấp
exports.verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
  });
};