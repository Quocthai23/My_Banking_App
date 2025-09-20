const loanService = require('../services/loanService');

// Người dùng yêu cầu khoản vay
exports.requestLoan = async (req, res) => {
  try {
    const { amount, term } = req.body;
    const loan = await loanService.requestLoan(req.user.userId, amount, term);
    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Người dùng xem các khoản vay của họ
exports.getUserLoans = async (req, res) => {
  try {
    const loans = await loanService.getUserLoans(req.user.userId);
    res.json({ loans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};