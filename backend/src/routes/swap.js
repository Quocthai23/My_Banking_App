const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const { auth } = require('../middlewares/auth');

// Lấy báo giá - có thể là route công khai không cần đăng nhập
router.get('/quote', swapController.getQuote);

// Lấy dữ liệu giao dịch - yêu cầu người dùng phải đăng nhập để biết `fromAddress`
router.post('/transaction', auth, swapController.getSwapData);

module.exports = router;