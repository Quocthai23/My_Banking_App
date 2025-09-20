const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ApiKey = require('../models/ApiKey');
const { logger } = require('../config');

const API_KEY_PREFIX = 'mbk_';

// Tạo một cặp khóa API (khóa gốc và hash)
exports.generateApiKey = async (userId, label, permissions) => {
  // Tạo một chuỗi ngẫu nhiên, an toàn
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const apiKey = API_KEY_PREFIX + randomBytes;

  // Băm khóa API để lưu trữ an toàn
  const keyHash = await bcrypt.hash(apiKey, 10);
  const keyHint = apiKey.slice(-4);

  const newApiKeyRecord = new ApiKey({
    userId,
    keyHash,
    keyHint,
    label,
    permissions,
  });
  await newApiKeyRecord.save();
  logger.info(`Generated new API key for user ${userId} with label "${label}"`);

  // Quan trọng: Trả về khóa API gốc. Đây là lần duy nhất người dùng thấy nó.
  return { apiKey, record: newApiKeyRecord };
};

// Lấy tất cả các khóa của một người dùng (không bao gồm hash)
exports.getUserApiKeys = async (userId) => {
  return ApiKey.find({ userId }).select('-keyHash');
};

// Xóa một khóa API
exports.deleteApiKey = async (keyId, userId) => {
  const result = await ApiKey.deleteOne({ _id: keyId, userId });
  if (result.deletedCount === 0) {
    throw new Error('API key not found or you do not have permission to delete it.');
  }
  logger.info(`Deleted API key ${keyId} for user ${userId}`);
  return true;
};

// Xác thực một khóa API được cung cấp
exports.validateApiKey = async (providedKey) => {
    const keys = await ApiKey.find(); // Tạm thời lấy hết để so sánh
    
    for (const keyRecord of keys) {
        const isMatch = await bcrypt.compare(providedKey, keyRecord.keyHash);
        if (isMatch) {
            // Cập nhật lastUsedAt (không cần chờ)
            ApiKey.updateOne({ _id: keyRecord._id }, { lastUsedAt: new Date() }).catch(err => {
                logger.error(`Failed to update lastUsedAt for key ${keyRecord._id}: ${err.message}`);
            });
            return keyRecord; // Trả về bản ghi đầy đủ nếu hợp lệ
        }
    }
    return null; // Không tìm thấy khóa hợp lệ
};