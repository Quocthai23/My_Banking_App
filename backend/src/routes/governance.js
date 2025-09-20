const express = require('express');
const router = express.Router();
const governanceController = require('../controllers/governanceController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.post('/proposals', governanceController.createProposal);
router.get('/proposals', governanceController.getProposals);
router.post('/proposals/:proposalId/vote', governanceController.castVote);

module.exports = router;