const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Các trường dành cho chuyển tiền nội bộ (off-chain)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        required: true,
    },

    // Trường tùy chọn cho các giao dịch liên quan đến blockchain
    txHash: {
        type: String,
        unique: true,
        sparse: true, // Cho phép nhiều bản ghi có giá trị null
    },
}, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;