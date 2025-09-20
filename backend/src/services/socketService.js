const { Server } = require('socket.io');
const { logger } = require('../config');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // Lưu trữ socketId cho mỗi userId

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  // Middleware xác thực token cho mỗi kết nối socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.userId = decoded.userId;
      next();
    });
  });

  io.on('connection', (socket) => {
    logger.info(`User connected via WebSocket: ${socket.userId} with socket ID ${socket.id}`);
    
    // Lưu lại kết nối của người dùng
    userSockets.set(socket.userId, socket.id);

    socket.on('disconnect', () => {
      logger.info(`User disconnected via WebSocket: ${socket.userId}`);
      userSockets.delete(socket.userId);
    });
  });

  logger.info('Socket.io service initialized.');
}

// Hàm để gửi thông báo đến một người dùng cụ thể
function sendNotificationToUser(userId, notification) {
  const socketId = userSockets.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit('new_notification', notification);
    logger.info(`Sent real-time notification to user ${userId}`);
  } else {
    logger.info(`User ${userId} is not connected. Notification will be available in history.`);
  }
}

module.exports = {
  initializeSocket,
  sendNotificationToUser,
};