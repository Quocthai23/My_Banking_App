const twoFactorAuthService = require('../services/twoFactorAuthService');
const User = require('../models/User');
const { logger } = require('../config');

// Bắt đầu quá trình thiết lập 2FA
exports.setup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const secret = await twoFactorAuthService.generateSecret(userId);
    const qrCode = await twoFactorAuthService.generateQRCode(secret.otpauth_url);

    res.json({
      message: 'Scan this QR code with your authenticator app, then verify.',
      qrCode,
      secret: secret.base32,
    });
  } catch (err) {
    logger.error(`2FA setup error: ${err.message}`);
    res.status(500).json({ error: 'Failed to set up 2FA' });
  }
};

// Xác thực và kích hoạt 2FA
exports.verifyAndEnable = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;
    
    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: '2FA secret not found. Please set up first.' });
    }

    const isVerified = twoFactorAuthService.verifyToken(user.twoFactorSecret.base32, token);

    if (!isVerified) {
      return res.status(400).json({ error: 'Invalid 2FA token.' });
    }

    // Nếu xác thực thành công, kích hoạt 2FA cho người dùng
    user.isTwoFactorEnabled = true;
    await user.save();
    
    logger.info(`2FA enabled for user ${userId}`);
    res.json({ message: '2FA has been enabled successfully.' });

  } catch (err) {
    logger.error(`2FA verification error: ${err.message}`);
    res.status(500).json({ error: 'Failed to verify 2FA token' });
  }
};

// Vô hiệu hóa 2FA
exports.disable = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user.isTwoFactorEnabled) {
            return res.status(400).json({ error: '2FA is not currently enabled.' });
        }

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();

        logger.info(`2FA disabled for user ${userId}`);
        res.json({ message: '2FA has been disabled.' });
    } catch (err) {
        logger.error(`2FA disable error: ${err.message}`);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
};