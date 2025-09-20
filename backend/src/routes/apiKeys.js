const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.post('/', apiKeyController.createApiKey);
router.get('/', apiKeyController.getApiKeys);
router.delete('/:id', apiKeyController.deleteApiKey);

module.exports = router;