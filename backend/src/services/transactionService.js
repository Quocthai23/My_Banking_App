const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const User = require('../models/User');
const mongoose = require('mongoose');
const { logger } = require('../config');

// Chuyển tiền nội bộ giữa các tài khoản
exports.transferFunds = async (transferData) => {
    const { senderUserId, sourceAccountId, recipientEmail, amount, currency, description } = transferData;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const recipient = await User.findOne({ username: recipientEmail }).session(session);
        if (!recipient) {
            const err = new Error('Không tìm thấy người nhận.');
            err.statusCode = 404;
            throw err;
        }

        if (recipient._id.equals(senderUserId)) {
            const err = new Error('Không thể chuyển tiền cho chính mình.');
            err.statusCode = 400;
            throw err;
        }

        const senderAccount = await Account.findOne({ _id: sourceAccountId, user: senderUserId }).session(session);
        if (!senderAccount) {
            const err = new Error('Không tìm thấy tài khoản nguồn hoặc tài khoản không thuộc về bạn.');
            err.statusCode = 404;
            throw err;
        }
        
        if (senderAccount.currency !== currency) {
            const err = new Error(`Loại tiền tệ của tài khoản nguồn (${senderAccount.currency}) không khớp với loại tiền tệ giao dịch (${currency}).`);
            err.statusCode = 400;
            throw err;
        }

        if (senderAccount.balance < amount) {
            const err = new Error('Số dư không đủ.');
            err.statusCode = 400;
            throw err;
        }

        const recipientAccount = await Account.findOne({ user: recipient._id, currency }).session(session);
        if (!recipientAccount) {
            const err = new Error(`Không tìm thấy tài khoản của người nhận với loại tiền tệ ${currency}. Người nhận phải tạo một tài khoản cho loại tiền tệ này trước.`);
            err.statusCode = 404;
            throw err;
        }

        senderAccount.balance -= amount;
        recipientAccount.balance += amount;

        await senderAccount.save({ session });
        await recipientAccount.save({ session });

        const transaction = new Transaction({
            sender: senderUserId,
            recipient: recipient._id,
            fromAccount: senderAccount._id,
            toAccount: recipientAccount._id,
            amount,
            currency,
            description,
            status: 'completed',
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Chuyển tiền thành công: ${amount} ${currency} từ ${senderUserId} đến ${recipient._id}`);
        return transaction;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Lỗi dịch vụ chuyển tiền: ${error.message}`);
        throw error;
    }
};

// Lấy lịch sử giao dịch
exports.getTransactionHistory = async (userId) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ sender: userId }, { recipient: userId }]
        })
        .populate('fromAccount', 'accountNumber currency')
        .populate('toAccount', 'accountNumber currency')
        .populate('sender', 'username')
        .populate('recipient', 'username')
        .sort({ createdAt: -1 });

        return transactions;
    } catch (error) {
        logger.error(`Lỗi khi lấy lịch sử giao dịch: ${error.message}`);
        throw error;
    }
};

// Nạp tiền (off-chain)
exports.depositFunds = async (depositData) => {
    const { userId, accountId, amount, currency } = depositData;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const account = await Account.findOne({ _id: accountId, user: userId }).session(session);
        if (!account) {
            const err = new Error('Không tìm thấy tài khoản hoặc tài khoản không thuộc về bạn.');
            err.statusCode = 404;
            throw err;
        }
        if (account.currency !== currency) {
            const err = new Error(`Loại tiền tệ của tài khoản (${account.currency}) không khớp với loại tiền tệ nạp vào (${currency}).`);
            err.statusCode = 400;
            throw err;
        }

        account.balance += amount;
        await account.save({ session });

        const transaction = new Transaction({
            toAccount: account._id,
            recipient: userId,
            amount,
            currency,
            status: 'completed',
            description: 'Người dùng nạp tiền',
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        logger.info(`Nạp tiền thành công: ${amount} ${currency} vào tài khoản ${accountId}`);
        return transaction;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Lỗi dịch vụ nạp tiền: ${error.message}`);
        throw error;
    }
};

// Rút tiền (off-chain)
exports.withdrawFunds = async (withdrawalData) => {
    const { userId, accountId, amount, currency } = withdrawalData;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const account = await Account.findOne({ _id: accountId, user: userId }).session(session);
        if (!account) {
            const err = new Error('Không tìm thấy tài khoản hoặc tài khoản không thuộc về bạn.');
            err.statusCode = 404;
            throw err;
        }
        if (account.currency !== currency) {
            const err = new Error(`Loại tiền tệ của tài khoản (${account.currency}) không khớp với loại tiền tệ rút ra (${currency}).`);
            err.statusCode = 400;
            throw err;
        }
        if (account.balance < amount) {
            const err = new Error('Số dư không đủ để rút tiền.');
            err.statusCode = 400;
            throw err;
        }

        account.balance -= amount;
        await account.save({ session });

        const transaction = new Transaction({
            fromAccount: account._id,
            sender: userId,
            amount,
            currency,
            status: 'completed',
            description: 'Người dùng rút tiền',
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        logger.info(`Rút tiền thành công: ${amount} ${currency} từ tài khoản ${accountId}`);
        return transaction;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error(`Lỗi dịch vụ rút tiền: ${error.message}`);
        throw error;
    }
};