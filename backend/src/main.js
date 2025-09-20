const path = require('path');
// Cập nhật: Chỉ định đường dẫn rõ ràng đến file .env ở thư mục gốc
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// --- Tải các module của ứng dụng ---
const { connectDB } = require('./config/database');
const { logger } = require('./config');

// Services cần khởi tạo
const { initializeSocket } = require('./services/socketService');
const { initializeScheduler } = require('./services/schedulerService');
const tierService = require('./services/tierService');

// Middlewares
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger } = require('./middlewares/logger');

// --- Import tất cả các Routes ---
const userRoutes = require('./routes/users');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const twoFactorAuthRoutes = require('./routes/twoFactorAuth');
const scheduledTransactionRoutes = require('./routes/scheduledTransactions');
const loanRoutes = require('./routes/loans');
const notificationRoutes = require('./routes/notifications');
const apiKeysRoutes = require('./routes/apiKeys');
const publicApiRoutes = require('./routes/publicApi');
const stakingRoutes = require('./routes/staking');
const tierRoutes = require('./routes/tiers');
const swapRoutes = require('./routes/swap');
const portfolioRoutes = require('./routes/portfolio');
const supportTicketRoutes = require('./routes/supportTickets');
const invoiceRoutes = require('./routes/invoices');
const strategyVaultRoutes = require('./routes/strategyVaults');
const governanceRoutes = require('./routes/governance');
const nftsRoutes = require('./routes/nfts');
const bridgeRoutes = require('./routes/bridge');
// THÊM MỚI: Import route cho referral
const referralRoutes = require('./routes/referral');
const apiKeyRoutes = require('./routes/apiKeys');

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.io và gắn vào server
initializeSocket(server);

// --- Cấu hình Middlewares ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// SỬA LỖI: Tăng giới hạn rate limit để cho phép tải dữ liệu ban đầu
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 300, // Tăng từ 100 lên 300 requests mỗi IP trong 15 phút
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' }
});

app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

const API_PREFIX = '/api/v1';

// --- Đăng ký các Routes với Express ---
app.use(API_PREFIX + '/users', userRoutes);
app.use(API_PREFIX + '/accounts', accountRoutes);
app.use(API_PREFIX + '/transactions', transactionRoutes);
app.use(API_PREFIX + '/admin', adminRoutes);
app.use(API_PREFIX + '/2fa', twoFactorAuthRoutes);
app.use(API_PREFIX + '/scheduledTransactions', scheduledTransactionRoutes);
app.use(API_PREFIX + '/loans', loanRoutes);
app.use(API_PREFIX + '/notifications', notificationRoutes);
app.use(API_PREFIX + '/api-keys', apiKeysRoutes); 
app.use(API_PREFIX + '/public', publicApiRoutes);
app.use(API_PREFIX + '/staking', stakingRoutes);
app.use(API_PREFIX + '/tiers', tierRoutes);
app.use(API_PREFIX + '/swap', swapRoutes);
app.use(API_PREFIX + '/portfolio', portfolioRoutes);
app.use(API_PREFIX + '/support-tickets', supportTicketRoutes);
app.use(API_PREFIX + '/invoices', invoiceRoutes);
app.use(API_PREFIX + '/strategy-vaults', strategyVaultRoutes);
app.use(API_PREFIX + '/governance', governanceRoutes);
app.use(API_PREFIX + '/nfts', nftsRoutes);
app.use(API_PREFIX + '/bridge', bridgeRoutes);
// THÊM MỚI: Đăng ký route cho referral
app.use(API_PREFIX + '/referrals', referralRoutes);
app.use(API_PREFIX +'/apiKeys', apiKeyRoutes);

// Middleware xử lý lỗi phải được đặt ở cuối cùng
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5052;
    server.listen(PORT, () => {
      logger.info(`Server đang chạy tại http://localhost:${PORT}`);
      initializeScheduler();
      tierService.startTierUpdateJob();
    });
  } catch (error) {
    logger.error(`Không thể khởi động server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

