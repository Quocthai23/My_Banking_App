const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { apiKeyAuth, hasPermission } = require('../middlewares/apiKeyAuth');

// Tất cả các route trong file này đều yêu cầu xác thực bằng API Key
router.use(apiKeyAuth);

// Endpoint để lấy số dư, yêu cầu quyền 'read:balance'
router.get('/balance', hasPermission('read:balance'), userController.getBalance);

module.exports = router;