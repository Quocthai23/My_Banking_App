const express = require('express');
const router = express.Router();
const scheduledTransactionController = require('../controllers/scheduledTransactionController');
const { auth } = require('../middlewares/auth');

// Tất cả các route này đều yêu cầu đăng nhập
router.use(auth);

// Lên lịch giao dịch mới
router.post('/', scheduledTransactionController.scheduleTransaction);

// Lấy danh sách các giao dịch đã lên lịch
router.get('/', scheduledTransactionController.getScheduledTransactions);

// Hủy một giao dịch
router.delete('/:id', scheduledTransactionController.cancelScheduledTransaction);

module.exports = router;