const fs = require('fs');
const path = require('path');

// Đảm bảo rằng file log được ghi vào đúng thư mục gốc của backend
const logStream = fs.createWriteStream(path.join(__dirname, '../../activity.log'), { flags: 'a' });

const info = (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()}: ${message}\n`;
    console.log(logMessage.trim());
    logStream.write(logMessage);
};

// SỬA LỖI: Thêm hàm 'warn' còn thiếu
const warn = (message) => {
    const logMessage = `[WARN] ${new Date().toISOString()}: ${message}\n`;
    console.warn(logMessage.trim());
    logStream.write(logMessage);
};

const error = (message) => {
    const logMessage = `[ERROR] ${new Date().toISOString()}: ${message}\n`;
    console.error(logMessage.trim());
    logStream.write(logMessage);
};

module.exports = {
    info,
    warn, // SỬA LỖI: Export hàm 'warn' để các module khác có thể sử dụng
    error,
    requestLogger: (req, res, next) => {
        info(`Request: ${req.method} ${req.originalUrl}`);
        next();
    }
};
