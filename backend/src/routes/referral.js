const express = require('express');
const router = express.Router();

// Import controller function
const { getMyReferralInfo } = require('../controllers/referralController');

// SỬA LỖI: Import chính xác hàm 'auth' từ đối tượng được export trong middlewares/auth.js
const { auth } = require('../middlewares/auth');

// @route   GET /api/v1/referrals/me
// @desc    Lấy thông tin giới thiệu của người dùng đang đăng nhập
// @access  Private
// SỬA LỖI: Sử dụng đúng tên hàm middleware là 'auth'
router.get('/me', auth, getMyReferralInfo);

module.exports = router;

