const supportTicketService = require('../services/supportTicketService');
const Ticket = require('../models/Ticket');

// Tạo ticket mới
exports.createTicket = async (req, res) => {
  try {
    const { subject, category, message } = req.body;
    const ticket = await supportTicketService.createTicket(req.user.userId, subject, category, message);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách ticket của user
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
        res.json({ tickets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy chi tiết một ticket
exports.getTicketDetails = async (req, res) => {
    try {
        const { ticket, messages } = await supportTicketService.getTicketWithMessages(req.params.id);
        if (ticket.userId._id.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.json({ ticket, messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Gửi tin nhắn
exports.addMessage = async (req, res) => {
    try {
        const { message } = req.body;
        // Kiểm tra quyền sở hữu
        const ticket = await Ticket.findById(req.params.id);
        if (ticket.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const newMessage = await supportTicketService.addMessageToTicket(req.params.id, req.user.userId, message);
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};