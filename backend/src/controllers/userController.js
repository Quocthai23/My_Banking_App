const userService = require('../services/userService');
const { logger } = require('../config');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const auditLogService = require('../services/auditLogService');
const twoFactorAuthService = require('../services/twoFactorAuthService');
const User = require('../models/User');
const tokenBlacklistService = require('../services/tokenBlacklistService');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = require('../config/env');

exports.register = async (req, res, next) => {
  try {
    const { username, password, walletAddress, referralCode } = req.body;
    if (!username || !password || !walletAddress) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên người dùng, mật khẩu và địa chỉ ví.' });
    }

    // `userService.createUser` sẽ xử lý việc ánh xạ 'walletAddress' sang trường 'address' của model
    const newUser = await userService.createUser({
      username,
      password,
      walletAddress,
      referralCode,
    });

    await auditLogService.logAction(
      newUser._id,
      'USER_REGISTER',
      `Người dùng mới '${username}' đã đăng ký.`,
      'success'
    );

    logger.info(`Người dùng mới đã đăng ký: ${newUser.username}`);
    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: {
        id: newUser._id,
        username: newUser.username,
      },
    });
  } catch (error) {
    await auditLogService.logAction(
      null,
      'USER_REGISTER_FAILURE',
      `Nỗ lực đăng ký thất bại: ${error.message}`,
      'failure'
    );
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userService.findUserByUsername(username);

    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Đăng nhập thất bại cho người dùng: ${username}`);
      await auditLogService.logAction(null, 'USER_LOGIN_FAILURE', `Nỗ lực đăng nhập thất bại cho người dùng '${username}'.`, 'failure');
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    if (user.is2faEnabled) {
      const tempToken = twoFactorAuthService.generateTempToken(user._id);
      return res.status(200).json({
        requires2FA: true,
        tempToken,
        message: 'Vui lòng nhập mã xác thực 2FA của bạn.',
      });
    }

    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, jti: accessTokenId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );
    const refreshToken = jwt.sign(
      { userId: user._id, jti: refreshTokenId },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRATION }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await auditLogService.logAction(user._id, 'USER_LOGIN', `Người dùng '${username}' đã đăng nhập thành công.`, 'success');
    logger.info(`Người dùng đã đăng nhập: ${user.username}`);

    res.json({
      message: 'Đăng nhập thành công!',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyLogin2FA = async (req, res, next) => {
    try {
        const { tempToken, twoFactorCode } = req.body;

        const userId = twoFactorAuthService.verifyTempToken(tempToken);
        if (!userId) {
            return res.status(401).json({ message: 'Token tạm thời không hợp lệ hoặc đã hết hạn.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const isVerified = twoFactorAuthService.verify2FAToken(user.twoFactorAuthSecret, twoFactorCode);

        if (!isVerified) {
            return res.status(400).json({ message: 'Mã xác thực 2FA không chính xác.' });
        }

        const accessTokenId = uuidv4();
        const refreshTokenId = uuidv4();
        const accessToken = jwt.sign({ userId: user._id, role: user.role, jti: accessTokenId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
        const refreshToken = jwt.sign({ userId: user._id, jti: refreshTokenId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

        await auditLogService.logAction(user._id, 'USER_LOGIN_2FA', `Người dùng '${user.username}' đã đăng nhập thành công bằng 2FA.`, 'success');
        logger.info(`Người dùng đã đăng nhập (2FA): ${user.username}`);

        res.json({
            message: "Xác thực 2FA thành công!",
            accessToken,
            user: { id: user._id, username: user.username, role: user.role }
        });

    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { jti } = req.user;
        if (jti) {
            await tokenBlacklistService.add(jti, ACCESS_TOKEN_EXPIRATION);
        }
        res.clearCookie('refreshToken');
        logger.info(`Người dùng đã đăng xuất: ${req.user.userId}`);
        res.status(200).json({ message: 'Đăng xuất thành công.' });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Không tìm thấy Refresh Token.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            logger.warn(`Làm mới token thất bại: Không tìm thấy người dùng ID ${decoded.userId}.`);
            return res.status(403).json({ message: 'Không tìm thấy người dùng.' });
        }

        const accessTokenId = uuidv4();
        const newAccessToken = jwt.sign(
            { userId: user._id, role: user.role, jti: accessTokenId },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRATION }
        );

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        logger.error(`Lỗi làm mới token: ${error.message}`);
        return res.status(403).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn.' });
    }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { username, email } = req.body;

    const updatedUser = await userService.updateUser(userId, { username, email });
    await auditLogService.logAction(userId, 'USER_PROFILE_UPDATE', 'Hồ sơ người dùng đã được cập nhật.', 'success');

    res.status(200).json({
      message: 'Cập nhật hồ sơ thành công!',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
      }
    });
  } catch (error) {
    await auditLogService.logAction(req.user.userId, 'USER_PROFILE_UPDATE_FAILURE', `Cập nhật hồ sơ thất bại: ${error.message}`, 'failure');
    next(error);
  }
};

// --- TÍNH NĂNG MỚI: Thay đổi mật khẩu ---
exports.updatePassword = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
        }

        await userService.updatePassword(userId, currentPassword, newPassword);
        await auditLogService.logAction(userId, 'USER_PASSWORD_UPDATE', 'Mật khẩu đã được thay đổi thành công.', 'success');

        res.status(200).json({ message: 'Cập nhật mật khẩu thành công!' });
    } catch (error) {
        await auditLogService.logAction(req.user.userId, 'USER_PASSWORD_UPDATE_FAILURE', `Cập nhật mật khẩu thất bại: ${error.message}`, 'failure');
        next(error);
    }
};


// --- NÂNG CẤP: Xóa tài khoản người dùng ---
exports.deleteProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const deletedUser = await userService.deleteUser(userId);
    
    await auditLogService.logAction(userId, 'USER_DELETE', `Người dùng '${deletedUser.username}' đã xóa tài khoản.`, 'success');
    
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Tài khoản của bạn đã được xóa thành công.' });
  } catch (error) {
    await auditLogService.logAction(req.user.userId, 'USER_DELETE_FAILURE', `Xóa tài khoản thất bại: ${error.message}`, 'failure');
    next(error);
  }
};

// --- TÍNH NĂNG MỚI: Bật/tắt 2FA ---
exports.toggle2FA = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { enable } = req.body; // frontend sẽ gửi { enable: true } hoặc { enable: false }

        const result = await userService.toggle2FA(userId, enable);

        await auditLogService.logAction(userId, 'USER_2FA_TOGGLE', `2FA đã được ${enable ? 'bật' : 'tắt'}.`, 'success');

        res.status(200).json(result);

    } catch (error) {
        await auditLogService.logAction(req.user.userId, 'USER_2FA_TOGGLE_FAILURE', `Thay đổi trạng thái 2FA thất bại: ${error.message}`, 'failure');
        next(error);
    }
};

exports.getReferralInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('referralCode referrals').populate('referrals', 'username');
    if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    res.json({
        referralCode: user.referralCode,
        referralCount: user.referrals.length,
        referredUsers: user.referrals,
    });
  } catch (error) {
    next(error);
  }
};

// THÊM MỚI: Controller để xử lý việc cập nhật/liên kết địa chỉ ví
exports.updateWalletAddress = async (req, res, next) => {
    try {
        const { walletAddress } = req.body;
        const userId = req.user.userId;

        if (!walletAddress) {
            return res.status(400).json({ message: 'Địa chỉ ví là bắt buộc.' });
        }
        
        const updatedUser = await userService.linkWalletAddress(userId, walletAddress);
        
        await auditLogService.logAction(
            userId,
            'WALLET_ADDRESS_UPDATE',
            `Người dùng '${updatedUser.username}' đã cập nhật địa chỉ ví.`,
            'success'
        );

        logger.info(`User ${userId} updated wallet address to ${walletAddress}`);
        res.status(200).json({ 
            message: 'Cập nhật địa chỉ ví thành công.',
            user: updatedUser 
        });
    } catch (error) {
        await auditLogService.logAction(
            req.user.userId,
            'WALLET_ADDRESS_UPDATE_FAILURE',
            `Cập nhật địa chỉ ví thất bại: ${error.message}`,
            'failure'
        );
        next(error);
    }
};
exports.getBalance = async (req, res, next) => {
  res.status(501).json({ message: "Chức năng chưa được triển khai." });
};

exports.updateUser = async (req, res, next) => {
  res.status(501).json({ message: "Chức năng đã được chuyển qua /profile." });
};

exports.deleteUser = async (req, res, next) => {
  res.status(501).json({ message: "Chức năng đã được chuyển qua /profile." });
};
