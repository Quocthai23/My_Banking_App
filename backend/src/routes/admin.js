const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.use(auth, admin);

// Định nghĩa các route cho admin
router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.get('/transactions', adminController.getAllTransactions);
router.get('/loans', adminController.getAllLoans);
router.post('/loans/:loanId/approve', adminController.approveLoan);
router.post('/loans/:loanId/reject', adminController.rejectLoan);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', adminController.getTicketDetailsForAdmin);
router.post('/tickets/:id/reply', adminController.replyToTicket);
router.patch('/tickets/:id/status', adminController.changeTicketStatus);

module.exports = router;