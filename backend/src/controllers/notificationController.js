const Notification = require('../models/Notification');
const { logger } = require('../config');

// Lấy thông báo của người dùng, phân trang
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Notification.countDocuments({ userId });

    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    logger.error(`Error fetching notifications: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Đánh dấu một thông báo là đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found.' });
        }
        res.json(notification);
    } catch (err) {
        logger.error(`Error marking notification as read: ${err.message}`);
        res.status(500).json({ error: 'Failed to update notification.' });
    }
};