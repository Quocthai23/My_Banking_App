const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { auth } = require('../middlewares/auth');

// Protected routes
router.post('/create', auth, accountController.createAccount);
router.get('/', auth, accountController.getAccounts);
router.delete('/close/:accountId', auth, accountController.closeAccount);

module.exports = router;