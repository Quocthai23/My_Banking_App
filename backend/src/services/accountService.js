const Account = require('../models/Account');
const { logger } = require('../config');

exports.getAccountsByUserId = async (userId) => {
    try {
        const accounts = await Account.find({ user: userId, isActive: true });
        return accounts;
    } catch (error) {
        logger.error(`Error in getAccountsByUserId service: ${error.message}`);
        throw error;
    }
};

exports.createAccount = async (userId, accountDetails) => {
    try {
        const { accountType, currency } = accountDetails;

        // --- SỬA LỖI: Kiểm tra xem tài khoản đã tồn tại chưa ---
        const existingAccount = await Account.findOne({ user: userId, accountType, currency });

        if (existingAccount) {
            // Nếu đã tồn tại, tạo ra một lỗi cụ thể để controller xử lý
            const error = new Error(`Bạn đã có một tài khoản loại '${accountType}' với đơn vị tiền tệ '${currency}'.`);
            error.statusCode = 409; // 409 Conflict - cho biết tài nguyên đã tồn tại
            throw error;
        }

        // Generate a unique account number
        const accountNumber = `ACC${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const newAccount = new Account({
            user: userId,
            accountNumber,
            accountType,
            currency,
            balance: 0,
            isActive: true,
        });

        await newAccount.save();

        logger.info(`New account created for user ${userId} with type ${accountType}`);
        return newAccount;
    } catch (error) {
        // Ghi log nếu đây là lỗi không mong muốn, không phải lỗi 409 chúng ta tự tạo
        if (error.statusCode !== 409) {
            logger.error(`Error in createAccount service: ${error.message}`);
        }
        // Ném lỗi ra để controller bắt được
        throw error;
    }
};

exports.closeAccount = async (userId, accountId) => {
    try {
        const account = await Account.findOneAndUpdate(
            { _id: accountId, user: userId },
            { isActive: false },
            { new: true }
        );

        if (!account) {
            throw new Error('Account not found or user does not have permission to close it.');
        }

        logger.info(`Account ${accountId} closed for user ${userId}`);
        return account;
    } catch (error) {
        logger.error(`Error in closeAccount service: ${error.message}`);
        throw error;
    }
};