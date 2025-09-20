const invoiceService = require('../services/invoiceService');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

// Tạo hóa đơn
exports.createInvoice = async (req, res) => {
  try {
    const invoice = await invoiceService.createInvoice(req.user.userId, req.body);
    res.status(201).json(invoice);
  } catch (err) {
    // Trả về lỗi cụ thể hơn cho client
    res.status(400).json({ error: err.message });
  }
};

// Lấy danh sách hóa đơn người dùng đã tạo hoặc nhận
exports.getMyInvoices = async (req, res) => {
    try {
        const userId = req.user.userId;
        const invoices = await Invoice.find({ 
            $or: [{ creatorId: userId }, { recipientId: userId }] 
        }).sort({ createdAt: -1 });
        
        // Thêm một trường để frontend biết vai trò của người dùng trong hóa đơn
        const processedInvoices = invoices.map(invoice => {
            const plainInvoice = invoice.toObject();
            plainInvoice.role = plainInvoice.creatorId.toString() === userId ? 'creator' : 'recipient';
            return plainInvoice;
        });

        res.json({ invoices: processedInvoices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy thông tin công khai của một hóa đơn
exports.getPublicInvoice = async (req, res) => {
    try {
        const invoice = await invoiceService.getInvoiceByShortId(req.params.shortId);
        res.json(invoice);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// Xác nhận thanh toán
exports.confirmPayment = async (req, res) => {
    try {
        const { txHash } = req.body;
        if (!txHash) return res.status(400).json({ error: 'Transaction hash is required.' });

        const invoice = await invoiceService.confirmPayment(req.params.shortId, txHash);
        res.json({ message: 'Payment confirmed successfully.', invoice });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Hủy hóa đơn
exports.cancelInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ shortId: req.params.shortId, creatorId: req.user.userId });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found or you do not have permission.' });
        if (invoice.status !== 'pending') return res.status(400).json({ error: 'Only pending invoices can be cancelled.' });

        invoice.status = 'cancelled';
        await invoice.save();
        res.json({ message: 'Invoice cancelled successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
