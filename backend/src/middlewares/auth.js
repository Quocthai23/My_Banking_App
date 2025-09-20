const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config/env'); // SỬA LỖI: Import đúng secret key
const { logger } = require('../config');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Đây không phải là lỗi, chỉ là thiếu thông tin xác thực. Trả về 401.
    return res.status(401).json({ message: 'Không có token, yêu cầu xác thực bị từ chối.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Định dạng token không hợp lệ.' });
  }

  try {
    // SỬA LỖI: Sử dụng đúng secret key để xác thực
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    
    // Gắn thông tin người dùng đã được giải mã vào đối tượng request
    req.user = decoded;
    
    // Chuyển tiếp đến controller tiếp theo
    next();
  } catch (err) {
    // CẢI TIẾN: Xử lý các loại lỗi token khác nhau
    if (err.name === 'TokenExpiredError') {
      logger.error(`Invalid token: Đã hết hạn. ${err.message}`);
      return res.status(401).json({ message: 'Token đã hết hạn.' });
    }
    
    logger.error(`Invalid token: Không hợp lệ. ${err.message}`);
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = { auth };
