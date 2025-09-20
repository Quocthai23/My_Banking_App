const express = require('express');
const router = express.Router();
const twoFactorAuthController = require('../controllers/twoFactorAuthController');
const { auth } = require('../middlewares/auth'); // Middleware xác thực token chính

// Tất cả các route này yêu cầu người dùng phải đăng nhập
router.use(auth);

// Route để bắt đầu quá trình cài đặt 2FA
router.post('/setup', twoFactorAuthController.setup);

// Route để xác thực và kích hoạt 2FA
router.post('/verify', twoFactorAuthController.verifyAndEnable);

// Route để vô hiệu hóa 2FA
router.post('/disable', twoFactorAuthController.disable);


module.exports = router;