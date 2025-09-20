const express = require('express');
const router = express.Router();
const stakingController = require('../controllers/stakingController');
const { auth } = require('../middlewares/auth');
const admin = require('../middlewares/admin');


// Routes cho mọi người dùng đã đăng nhập
router.get('/vaults', auth, stakingController.getVaults);
router.get('/my-stakes', auth, stakingController.getMyStakes);
router.post('/stake', auth, stakingController.stake);
router.post('/unstake/:stakeId', auth, stakingController.unstake);

// [SỬA LỖI] Thêm middleware 'auth' để bảo vệ route và cung cấp req.user
router.get('/info', auth, stakingController.getVaultInfo);

// Routes chỉ dành cho Admin
router.post('/vaults', auth, admin, stakingController.createVault);

module.exports = router;
