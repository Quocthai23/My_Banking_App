const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/', notificationController.getNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);

module.exports = router;