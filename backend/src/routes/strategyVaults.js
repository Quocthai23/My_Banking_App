const express = require('express');
const router = express.Router();
const strategyVaultController = require('../controllers/strategyVaultController');
const { auth } = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', auth, strategyVaultController.getVaults);
router.post('/deposit', auth, strategyVaultController.deposit);
router.get('/my-deposits', auth, strategyVaultController.getMyDeposits);
router.post('/', auth, admin, strategyVaultController.createVault);

module.exports = router;