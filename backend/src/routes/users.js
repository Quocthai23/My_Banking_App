const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
// SỬA LỖI: Import đúng tên hàm 'validation' và các schema từ đúng file
const { validation, registerSchema, updateWalletSchema } = require('../middlewares/validation');

// Public routes
// SỬA LỖI: Sử dụng đúng tên hàm 'validation'
router.post('/register', validation(registerSchema), userController.register);
router.post('/login', userController.login);
router.post('/login/verify-2fa', userController.verifyLogin2FA);

// Routes for logout and refresh token
router.post('/logout', auth, userController.logout);
router.post('/refresh-token', userController.refreshToken);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.get('/balance', auth, userController.getBalance);
router.put('/update', auth, userController.updateUser);
router.delete('/:userIdToDelete', auth, userController.deleteUser);
router.get('/referral-info', auth, userController.getReferralInfo);


router.put('/wallet', auth, validation(updateWalletSchema), userController.updateWalletAddress);

module.exports = router;

