const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { auth } = require('../middlewares/auth');

// Routes cần đăng nhập
router.post('/', auth, invoiceController.createInvoice);
router.get('/', auth, invoiceController.getMyInvoices);
router.patch('/:shortId/cancel', auth, invoiceController.cancelInvoice);

// Routes công khai
router.get('/:shortId', invoiceController.getPublicInvoice);
router.post('/:shortId/confirm', invoiceController.confirmPayment);


module.exports = router;