const cron = require('node-cron');
const ScheduledTransaction = require('../models/ScheduledTransaction');
const transactionService = require('./transactionService');
const { web3, logger } = require('../config');
const StrategyVault = require('../models/StrategyVault');
const uniswapService = require('./uniswapService');
// Hàm xử lý các giao dịch đến hạn
const processDueTransactions = async () => {
  logger.info('Scheduler: Checking for due transactions...');
  const now = new Date();

  // Tìm các giao dịch đang chờ và đã đến hạn
  const dueTransactions = await ScheduledTransaction.find({
    status: 'pending',
    executeAt: { $lte: now },
  });

  if (dueTransactions.length === 0) {
    logger.info('Scheduler: No due transactions found.');
    return;
  }

  logger.info(`Scheduler: Found ${dueTransactions.length} transaction(s) to process.`);

  // Xử lý từng giao dịch
  for (const tx of dueTransactions) {
    try {
      logger.info(`Scheduler: Processing transaction ID ${tx._id} for user ${tx.userId}`);
      
      const amountInWei = web3.utils.toWei(tx.amount.toString(), 'ether');
      // Giả định hàm transferFromBank đã tồn tại để ký giao dịch bằng private key của ví ngân hàng
      const txHash = await transactionService.transferFromBank(tx.toWallet, amountInWei);
      
      // Cập nhật trạng thái thành công
      tx.status = 'completed';
      tx.txHash = txHash;
      await tx.save();

      // Lưu giao dịch off-chain vào bảng Transaction
      await transactionService.saveTransaction({
          from: tx.fromWallet,
          to: tx.toWallet,
          amount: tx.amount,
          txHash,
      });

      logger.info(`Scheduler: Successfully processed transaction ${tx._id}. TxHash: ${txHash}`);

    } catch (err) {
      logger.error(`Scheduler: Failed to process transaction ${tx._id}. Error: ${err.message}`);
      // Cập nhật trạng thái thất bại
      tx.status = 'failed';
      tx.failureReason = err.message;
      await tx.save();
    }
  }
};

// Hàm mới để thu hoạch lợi nhuận từ các hầm chiến lược
async function harvestStrategyVaults() {
    logger.info('Keeper: Checking for strategy vaults to harvest...');
    const vaults = await StrategyVault.find({ isActive: true, uniswapPositionId: { $ne: null } });

    if (vaults.length === 0) {
        logger.info('Keeper: No active strategy vaults with positions found.');
        return;
    }
    for (const vault of vaults) {
        try {
            await uniswapService.collectFees(vault.uniswapPositionId);
        } catch (error) {
            logger.error(`Keeper: Failed to harvest for vault ${vault.name}. Error: ${error.message}`);
        }
    }
}

exports.initializeScheduler = () => {
  cron.schedule('* * * * *', processDueTransactions);
  logger.info('Transaction scheduler initialized. Will run every minute.');
  
  // Chạy công việc thu hoạch mỗi 4 giờ
  cron.schedule('0 */4 * * *', harvestStrategyVaults);
  logger.info('Keeper bot for strategy vaults initialized. Will run every 4 hours.');
};