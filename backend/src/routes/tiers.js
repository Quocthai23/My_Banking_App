const express = require('express');
const router = express.Router();
const tierController = require('../controllers/tierController');
const { auth } = require('../middlewares/auth');

router.get('/my-tier', auth, tierController.getUserTier);
router.get('/', tierController.getAllTiers); // Route công khai

module.exports = router;