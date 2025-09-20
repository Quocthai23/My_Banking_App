const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, nftController.getMyNfts);

module.exports = router;