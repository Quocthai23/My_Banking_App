const AuditLog = require('../models/AuditLog');
const { logger } = require('../config');

/**
 * Ghi lại một hành động vào cơ sở dữ liệu.
 * @param {string | null} userId - ID của người dùng, hoặc null nếu không áp dụng.
 * @param {string} action - Loại hành động (ví dụ: 'USER_LOGIN').
 * @param {string} details - Mô tả chi tiết về hành động.
 * @param {'success' | 'failure'} status - Trạng thái của hành động.
 */
const logAction = async (userId, action, details, status = 'success') => {
  try {
    const auditLog = new AuditLog({
      userId,
      action,
      details,
      status // Thêm trường status
    });
    await auditLog.save();
  } catch (error) {
    logger.error(`Không thể ghi vào audit log: ${error.message}`);
  }
};

module.exports = {
  logAction,
};

