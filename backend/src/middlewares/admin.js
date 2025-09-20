const User = require('../models/User');
const { logger } = require('../config');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      logger.error(`Forbidden: User ${user.username} with role '${user.role}' tried to access admin route.`);
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    logger.error(`Admin middleware error: ${err.message}`);
    res.status(500).json({ error: 'Server error during admin check' });
  }
};

module.exports = admin;