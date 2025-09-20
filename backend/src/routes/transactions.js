const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth } = require('../middlewares/auth');

// Lấy lịch sử giao dịch của người dùng đã đăng nhập
router.get('/history', auth, transactionController.getTransactionHistory);

// Chuyển tiền nội bộ giữa các người dùng
router.post('/transfer', auth, transactionController.transferFunds);

// --- NÂNG CẤP: Thêm route cho chức năng Nạp tiền ---
router.post('/deposit', auth, transactionController.depositFunds);

// --- NÂNG CẤP: Thêm route cho chức năng Rút tiền ---
router.post('/withdraw', auth, transactionController.withdrawFunds);

module.exports = router;