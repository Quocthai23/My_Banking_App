const User = require('../models/User');
const { contract, web3, logger } = require('../config');
const referralService = require('./referralService');

exports.createUser = async (userData) => {
  const { username, password, walletAddress, referralCode: referrerCode } = userData;

  try {
    const user = new User({ username, password, address: walletAddress }); // Sửa 'walletAddress' thành 'address' để khớp model

    user.referralCode = await referralService.generateUniqueReferralCode();

    if (referrerCode) {
        await referralService.processReferral(user, referrerCode);
    }

    await user.save();
    logger.info(`User created: ${user.username} with referral code ${user.referralCode}`);

    return user;
  } catch (err) {
    logger.error(`Create user error: ${err.message}`);
    throw err;
  }
};

exports.findUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (err) {
    logger.error(`Find user by username error: ${err.message}`);
    throw err;
  }
};

exports.findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  } catch (err) {
    logger.error(`Find user by id error: ${err.message}`);
    throw err;
  }
};
exports.updateUser = async (userId, updateData) => {
  try {
    // Chỉ cho phép cập nhật các trường cụ thể để bảo mật
    const allowedUpdates = ['username', 'email'];
    const finalUpdateData = {};
    for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
            finalUpdateData[key] = updateData[key];
        }
    }

    if (Object.keys(finalUpdateData).length === 0) {
        throw new Error("Không có dữ liệu hợp lệ để cập nhật.");
    }
    
    const user = await User.findByIdAndUpdate(userId, finalUpdateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw new Error('Không tìm thấy người dùng');
    logger.info(`User updated: ${user.username}`);
    return user;
  } catch (err) {
    logger.error(`Update user error: ${err.message}`);
    throw err;
  }
};

// --- TÍNH NĂNG MỚI: Cập nhật mật khẩu ---
exports.updatePassword = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('Không tìm thấy người dùng.');

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không chính xác.');
        }

        user.password = newPassword;
        await user.save();
        logger.info(`Password updated for user: ${user.username}`);
        return true;
    } catch (err) {
        logger.error(`Update password error: ${err.message}`);
        throw err;
    }
};


exports.deleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');
    logger.info(`User deleted: ${user.username}`);
    return user;
  } catch (err) {
    logger.error(`Delete user error: ${err.message}`);
    throw err;
  }
};

// --- TÍNH NĂNG MỚI: Bật/Tắt 2FA ---
exports.toggle2FA = async (userId, enable) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('Không tìm thấy người dùng.');

        if (enable) {
            if (user.is2faEnabled) {
                return { message: "2FA đã được bật từ trước." };
            }
            const secret = twoFactorAuthService.generate2FASecret();
            user.twoFactorAuthSecret = secret;
            user.is2faEnabled = true;
            await user.save();

            const qrCode = await twoFactorAuthService.generateQRCode(secret, user.email);
            return {
                message: "Bật 2FA thành công. Quét mã QR này bằng ứng dụng xác thực của bạn.",
                qrCode, // Frontend sẽ hiển thị mã QR này
                secret, // Gửi secret để người dùng có thể nhập thủ công
            };
        } else {
            user.is2faEnabled = false;
            user.twoFactorAuthSecret = undefined;
            await user.save();
            return { message: "Đã tắt 2FA thành công." };
        }
    } catch (err) {
        logger.error(`Toggle 2FA error: ${err.message}`);
        throw err;
    }
};

exports.getBalanceFromBlockchain = async (walletAddress) => {
  try {
    const balance = await contract.methods.getBalance(walletAddress).call();
    return web3.utils.fromWei(balance, 'ether');
  } catch (err) {
    logger.error(`Get balance from blockchain error: ${err.message}`);
    throw err;
  }
};

exports.getAllUsers = async () => {
  try {
    const users = await User.find().select('-password');
    return users;
  } catch (err) {
    logger.error(`Get all users error: ${err.message}`);
    throw err;
  }
};

exports.getReferralInfo = async (userId) => {
    const user = await User.findById(userId).select('referralCode');
    if (!user) throw new Error('User not found');

    const referralsCount = await User.countDocuments({ referredBy: userId });

    return {
        referralCode: user.referralCode,
        referralsCount
    };
};

// THÊM MỚI: Hàm để liên kết địa chỉ ví, không ảnh hưởng đến các hàm hiện có.
exports.linkWalletAddress = async (userId, walletAddress) => {
  try {
    const user = await User.findByIdAndUpdate(
        userId,
        { address: walletAddress }, // Cập nhật trường 'address' trong model
        { new: true, runValidators: true }
    ).select('-password');
    if (!user) throw new Error('User not found');
    logger.info(`Wallet address updated for user: ${user.username}`);
    return user;
  } catch (err) {
    logger.error(`Link wallet address error: ${err.message}`);
    throw err;
  }
};
