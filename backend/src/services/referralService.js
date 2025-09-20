const User = require('../models/User');
const { logger } = require('../config');
const crypto = require('crypto');

const REFERRAL_BONUS_AMOUNT = 0.01; // Ví dụ: thưởng 0.01 ETH (off-chain)

/**
 * Tạo một mã giới thiệu duy nhất.
 * @returns {Promise<string>} Mã giới thiệu.
 */
async function generateUniqueReferralCode() {
  let code;
  let isUnique = false;
  while (!isUnique) {
    // Tạo một chuỗi ngẫu nhiên 6 ký tự, viết hoa
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const existingUser = await User.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }
  return code;
}

/**
 * Xử lý logic khi một người dùng mới đăng ký với mã giới thiệu.
 * @param {object} newUser - Đối tượng người dùng mới được tạo.
 * @param {string} referrerCode - Mã giới thiệu được cung cấp.
 */
exports.processReferral = async (newUser, referrerCode) => {
  if (!referrerCode) {
    return; // Bỏ qua nếu không có mã
  }

  try {
    const referrer = await User.findOne({ referralCode: referrerCode });
    if (!referrer) {
      logger.warn(`Referral code "${referrerCode}" provided during sign up does not exist.`);
      return;
    }

    // Cập nhật thông tin cho cả hai người dùng
    newUser.referredBy = referrer._id;
    newUser.referralBonus += REFERRAL_BONUS_AMOUNT; // Thưởng cho người mới

    referrer.referralBonus += REFERRAL_BONUS_AMOUNT; // Thưởng cho người giới thiệu

    await Promise.all([newUser.save(), referrer.save()]);

    logger.info(`Processed referral: User ${newUser.username} was referred by ${referrer.username}. Both received a bonus.`);

    // Tùy chọn: Gửi thông báo cho người giới thiệu
    // const notificationService = require('./notificationService');
    // await notificationService.createNotification(referrer._id, 'general_alert', `Congratulations! ${newUser.username} has signed up using your referral code. You've earned a bonus!`);

  } catch (error) {
    logger.error(`Error processing referral code ${referrerCode}: ${error.message}`);
  }
};


exports.generateUniqueReferralCode = generateUniqueReferralCode;