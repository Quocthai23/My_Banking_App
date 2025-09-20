const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
    default: 0.05, 
  },
  term: { 
    type: Number,
    required: true,
    default: 30, 
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paid', 'rejected', 'defaulted'],
    default: 'pending',
  },
  repaymentAmount: {
    type: Number,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  approvalDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  paidDate: {
      type: Date,
  },
  disbursementTxHash: {
    type: String,
  }
});

module.exports = mongoose.model('Loan', LoanSchema);