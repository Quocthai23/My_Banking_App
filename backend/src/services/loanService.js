const Loan = require('../models/Loan');
const User = require('../models/User');
const transactionService = require('./transactionService');
const { logger } = require('../config');
const notificationService = require('./notificationService');
const auditLogService = require('./auditLogService');
const tierService = require('./tierService');

const requestLoan = async (userId, amount, term) => {
  const newLoan = new Loan({
    borrowerId: userId,
    amount,
    term,
  });
  await newLoan.save();
  logger.info(`User ${userId} requested a loan of ${amount} for ${term} days.`);
  return newLoan;
};

const approveLoan = async (loanId, adminId) => {
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== 'pending') {
        throw new Error('Loan not found or cannot be approved.');
    }
    const borrower = await User.findById(loan.borrowerId);
    if (!borrower) {
        throw new Error('Borrower not found.');
    }
    loan.status = 'approved';
    await loan.save();

    await notificationService.createNotification(
        loan.borrowerId,
        'loan_approved',
        `Your loan request for ${loan.amount} ETH has been approved.`
    );
    return loan;
};

const rejectLoan = async (loanId, adminId) => {
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== 'pending') {
        throw new Error('Loan not found or cannot be rejected.');
    }
    loan.status = 'rejected';
    await loan.save();

    await notificationService.createNotification(
        loan.borrowerId,
        'loan_rejected',
        `Your loan request for ${loan.amount} ETH has been rejected.`
    );
    return loan;
};

const getUserLoans = async (userId) => {
  return await Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
};

const getLoansByUserId = async (userId) => {
    return await getUserLoans(userId);
};

// SỬA LỖI: Export tất cả các hàm cần thiết
module.exports = {
    requestLoan,
    approveLoan,
    rejectLoan,
    getUserLoans,
    getLoansByUserId
};

