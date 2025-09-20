const accountService = require('../services/accountService');
const { logger } = require('../config');

exports.getAccounts = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const accounts = await accountService.getAccountsByUserId(userId);
        res.status(200).json(accounts);
    } catch (error) {
        logger.error(`Get accounts controller error: ${error.message}`);
        next(error);
    }
};

exports.createAccount = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const accountDetails = req.body;

        const newAccount = await accountService.createAccount(userId, accountDetails);

        res.status(201).json({
            message: "Account created successfully",
            account: newAccount,
        });
    } catch (error) {
        // --- SỬA LỖI: Xử lý lỗi tài khoản đã tồn tại một cách tường minh ---
        if (error.statusCode === 409) {
            // Trả về lỗi 409 với thông báo rõ ràng cho người dùng
            return res.status(409).json({ message: error.message });
        }
        
        // Ghi log và chuyển các lỗi khác (500) đến error handler chung
        logger.error(`Create account controller error: ${error.message}`);
        next(error);
    }
};

exports.closeAccount = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { accountId } = req.params;

        const closedAccount = await accountService.closeAccount(userId, accountId);

        res.status(200).json({
            message: "Account closed successfully",
            account: closedAccount,
        });
    } catch (error) {
        logger.error(`Close account controller error: ${error.message}`);
        next(error);
    }
};