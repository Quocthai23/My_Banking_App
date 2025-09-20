const userService = require('../services/userService');
const transactionService = require('../services/transactionService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { logger } = require('../config');
const loanService = require('../services/loanService');
const auditLogService = require('../services/auditLogService');
const supportTicketService = require('../services/supportTicketService');
const Ticket = require('../models/Ticket');


exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    res.json({
      totalUsers,
      totalTransactions,
    });
  } catch (err) {
    logger.error(`Get dashboard stats error: ${err.message}`);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.findUserById(userId);
    user.password = undefined;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllLoans = async (req, res) => {
    try {
        const loans = await loanService.getAllLoans();
        // [SỬA LỖI] Trả về mảng trực tiếp thay vì một đối tượng
        res.json(loans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const adminId = req.user.userId;
        const loan = await loanService.approveLoan(loanId, adminId);
        // [SỬA LỖI] Trả về đối tượng "loan" trực tiếp để frontend cập nhật state
        res.json(loan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const adminId = req.user.userId;
        const loan = await loanService.rejectLoan(loanId, adminId);
        // [SỬA LỖI] Trả về đối tượng "loan" trực tiếp để frontend cập nhật state
        res.json(loan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const { page, limit, action, actorId } = req.query;
        const result = await auditLogService.getLogs({ page, limit, action, actorId });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('userId', 'username').sort({ updatedAt: -1 });
        res.json({ tickets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTicketDetailsForAdmin = async (req, res) => {
    try {
        const { ticket, messages } = await supportTicketService.getTicketWithMessages(req.params.id);
        res.json({ ticket, messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.replyToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const newMessage = await supportTicketService.addMessageToTicket(req.params.id, req.user.userId, message);
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changeTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedTicket = await supportTicketService.changeTicketStatus(req.params.id, status);
        res.json(updatedTicket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

