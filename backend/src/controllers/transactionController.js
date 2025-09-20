const transactionService = require('../services/transactionService');
const { logger } = require('../config');

// Lấy lịch sử giao dịch (Giữ nguyên)
exports.getTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const history = await transactionService.getTransactionHistory(userId);
        res.json(history);
    } catch (error) {
        next(error);
    }
};

// Chuyển tiền nội bộ (Giữ nguyên)
exports.transferFunds = async (req, res, next) => {
    try {
        const senderUserId = req.user.userId;
        const { sourceAccountId, recipientEmail, amount, currency, description } = req.body;

        if (!sourceAccountId || !recipientEmail || !amount || !currency) {
            return res.status(400).json({ message: 'Source account, recipient email, amount, and currency are required.' });
        }

        const transaction = await transactionService.transferFunds({
            senderUserId,
            sourceAccountId,
            recipientEmail,
            amount,
            currency,
            description,
        });

        res.status(201).json({ message: 'Transfer successful!', transaction });
    } catch (error) {
        logger.error(`Transfer funds error in controller: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// --- NÂNG CẤP: Thêm chức năng Nạp tiền (off-chain) ---
exports.depositFunds = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { accountId, amount, currency } = req.body;

        if (!accountId || !amount || !currency || amount <= 0) {
            return res.status(400).json({ message: 'Account ID, amount, and currency are required, and amount must be positive.' });
        }

        const transaction = await transactionService.depositFunds({
            userId,
            accountId,
            amount,
            currency,
        });
        
        res.status(201).json({ message: 'Deposit successful!', transaction });
    } catch (error) {
        logger.error(`Deposit funds error in controller: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// --- NÂNG CẤP: Thêm chức năng Rút tiền (off-chain) ---
exports.withdrawFunds = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { accountId, amount, currency } = req.body;

        if (!accountId || !amount || !currency || amount <= 0) {
            return res.status(400).json({ message: 'Account ID, amount, and currency are required, and amount must be positive.' });
        }

        const transaction = await transactionService.withdrawFunds({
            userId,
            accountId,
            amount,
            currency,
        });

        res.status(201).json({ message: 'Withdrawal successful!', transaction });
    } catch (error) {
        logger.error(`Withdraw funds error in controller: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};