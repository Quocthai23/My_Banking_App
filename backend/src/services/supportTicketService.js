const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');
const notificationService = require('./notificationService');
const { logger } = require('../config');

// User tạo một ticket mới
exports.createTicket = async (userId, subject, category, message) => {
  const newTicket = new Ticket({ userId, subject, category });
  await newTicket.save();

  const firstMessage = new TicketMessage({
    ticketId: newTicket._id,
    senderId: userId,
    message,
  });
  await firstMessage.save();

  // Tùy chọn: Gửi thông báo cho admin (có thể bỏ qua nếu admin có dashboard riêng)
  logger.info(`New support ticket ${newTicket._id} created by user ${userId}.`);
  return newTicket;
};

// Thêm một tin nhắn vào ticket (cho cả user và admin)
exports.addMessageToTicket = async (ticketId, senderId, message) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error('Ticket not found.');

  const newMessage = new TicketMessage({ ticketId, senderId, message });
  await newMessage.save();

  // Cập nhật ticket
  ticket.lastReplyBy = senderId;
  if(ticket.status === 'Resolved') ticket.status = 'In Progress'; // Mở lại ticket nếu đã giải quyết
  await ticket.save();
  
  // Gửi thông báo cho bên còn lại
  const sender = await require('../models/User').findById(senderId);
  if (sender.role === 'admin') {
      // Admin trả lời -> thông báo cho user
      await notificationService.createNotification(ticket.userId, 'general_alert', `You have a new reply on your support ticket #${ticket._id}.`);
  } else {
      // User trả lời -> Tùy chọn thông báo cho admin
  }

  return newMessage;
};

// Admin thay đổi trạng thái ticket
exports.changeTicketStatus = async (ticketId, status) => {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found.');
    
    ticket.status = status;
    await ticket.save();

    await notificationService.createNotification(ticket.userId, 'general_alert', `The status of your support ticket #${ticket._id} has been updated to "${status}".`);

    return ticket;
};

// Lấy ticket và tin nhắn
exports.getTicketWithMessages = async (ticketId) => {
    const ticket = await Ticket.findById(ticketId).populate('userId', 'username');
    const messages = await TicketMessage.find({ ticketId }).populate('senderId', 'username role').sort({ createdAt: 'asc' });
    return { ticket, messages };
};