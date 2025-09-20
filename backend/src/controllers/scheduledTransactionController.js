const ScheduledTransaction = require('../models/ScheduledTransaction');
const User = require('../models/User');
const { logger } = require('../config');

exports.scheduleTransaction = async (req, res) => {
  try {
    // NÂNG CẤP: Nhận thêm 'token', mặc định là 'ETH'
    const { toWallet, amount, executeAt, token = 'ETH' } = req.body;
    const userId = req.user.userId;

    // NÂNG CẤP: Validation chặt chẽ hơn
    if (!toWallet || !amount || !executeAt) {
      return res.status(400).json({ error: 'Missing required fields: toWallet, amount, executeAt' });
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }
    if (new Date(executeAt) <= new Date()) {
      return res.status(400).json({ error: 'Scheduled execution time must be in the future.' });
    }

    const user = await User.findById(userId);
    if (!user || !user.walletAddress) {
        return res.status(404).json({ error: 'User or user wallet not found' });
    }

    const newScheduledTx = new ScheduledTransaction({
      userId,
      fromWallet: user.walletAddress,
      toWallet,
      amount: parseFloat(amount),
      token,
      executeAt,
    });

    await newScheduledTx.save();
    logger.info(`New transaction scheduled for user ${userId} to ${toWallet} to be executed at ${executeAt}`);
    res.status(201).json(newScheduledTx);
  } catch (err) {
    logger.error(`Error scheduling transaction: ${err.message}`);
    res.status(500).json({ error: 'Failed to schedule transaction' });
  }
};

exports.getScheduledTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await ScheduledTransaction.find({ userId }).sort({ executeAt: 1 });
    res.json({ transactions });
  } catch (err) {
    logger.error(`Error fetching scheduled transactions: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch scheduled transactions' });
  }
};

exports.cancelScheduledTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const tx = await ScheduledTransaction.findOne({ _id: id, userId });

        if (!tx) {
            return res.status(404).json({ error: 'Scheduled transaction not found or you do not have permission to cancel it.' });
        }
        if (tx.status !== 'pending') {
            return res.status(400).json({ error: `Cannot cancel a transaction with status '${tx.status}'.` });
        }

        tx.status = 'cancelled';
        await tx.save();

        logger.info(`User ${userId} cancelled scheduled transaction ${id}`);
        res.json({ message: 'Transaction successfully cancelled.', transaction: tx });
    } catch (err) {
        logger.error(`Error cancelling scheduled transaction: ${err.message}`);
        res.status(500).json({ error: 'Failed to cancel scheduled transaction' });
    }
};
