const express = require('express');
const router = express.Router();
const supportTicketController = require('../controllers/supportTicketController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.post('/', supportTicketController.createTicket);
router.get('/', supportTicketController.getMyTickets);
router.get('/:id', supportTicketController.getTicketDetails);
router.post('/:id/messages', supportTicketController.addMessage);

module.exports = router;