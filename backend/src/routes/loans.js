const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { auth } = require('../middlewares/auth');

// Tất cả các route này yêu cầu đăng nhập
router.use(auth);

// Yêu cầu một khoản vay mới
router.post('/request', loanController.requestLoan);

// Lấy các khoản vay của người dùng hiện tại
router.get('/', loanController.getUserLoans);

module.exports = router;