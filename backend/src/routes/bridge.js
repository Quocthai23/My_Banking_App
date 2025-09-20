const express = require('express');
const router = express.Router();
const bridgeController = require('../controllers/bridgeController');
const { auth } = require('../middlewares/auth');

router.get('/quote', auth, bridgeController.getQuote);

router.post('/build-tx', auth, bridgeController.getTransactionData);

router.get('/status', bridgeController.getTransactionStatus);

module.exports = router;