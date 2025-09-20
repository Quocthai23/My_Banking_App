const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('./socketService');
const { logger } = require('../config');

// Hàm tạo và gửi thông báo
exports.createNotification = async (userId, type, message, link = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      link,
    });
    await notification.save();

    // Gửi thông báo real-time
    sendNotificationToUser(userId, notification);

    return notification;
  } catch (error) {
    logger.error(`Failed to create notification for user ${userId}: ${error.message}`);
  }
};