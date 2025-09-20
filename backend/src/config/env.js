// Tập tin này chịu trách nhiệm tải và xác thực các biến môi trường.
// Nó giúp bắt các lỗi cấu hình từ sớm.

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// CẢI TIẾN: Thêm kiểm tra để đảm bảo các biến môi trường quan trọng đã được thiết lập.
// Nếu không, máy chủ sẽ không khởi động được, giúp phát hiện lỗi cấu hình ngay lập tức.
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  console.error("LỖI NGHIÊM TRỌNG: ACCESS_TOKEN_SECRET hoặc REFRESH_TOKEN_SECRET chưa được định nghĩa trong tệp .env.");
  process.exit(1); // Thoát khỏi tiến trình nếu thiếu biến môi trường
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5052,
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION || '15m',
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
};
