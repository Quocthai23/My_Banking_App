const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { logger } = require('../config');
const cron = require('node-cron');

const TIERS = {
  Bronze: {
    minVolume: 0,
    benefits: {
      loanInterestRateDiscount: 0,
      transactionFeeDiscount: 0,
    },
  },
  Silver: {
    minVolume: 100,
    benefits: {
      loanInterestRateDiscount: 0.01,
      transactionFeeDiscount: 0.1,
    },
  },
  Gold: {
    minVolume: 1000,
    benefits: {
      loanInterestRateDiscount: 0.02,
      transactionFeeDiscount: 0.25,
    },
  },
  Platinum: {
    minVolume: 5000,
    benefits: {
      loanInterestRateDiscount: 0.03,
      transactionFeeDiscount: 0.5,
    },
  },
};

exports.calculateUserTier = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }
  
  if (!user.walletAddress) {
      // SỬA LỖI: Thay thế logger.warn bằng logger.info
      logger.info(`User ${userId} does not have a wallet address. Skipping tier calculation.`);
      return { tier: user.tier || 'Bronze', totalVolume: 0 };
  }

  const outgoingTransactions = await Transaction.find({ 
    from: new RegExp(`^${user.walletAddress}$`, 'i') 
  });
  
  const totalVolume = outgoingTransactions.reduce((sum, tx) => {
      const amount = parseFloat(tx.amount);
      return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const sortedTiers = Object.keys(TIERS).sort((a, b) => TIERS[b].minVolume - TIERS[a].minVolume);
  const newTier = sortedTiers.find(tier => totalVolume >= TIERS[tier].minVolume) || 'Bronze';

  if (user.tier !== newTier) {
    user.tier = newTier;
    await user.save();
    logger.info(`User ${user.username} tier updated to ${newTier}.`);
  }
  
  return { tier: newTier, totalVolume };
};

exports.startTierUpdateJob = () => {
    cron.schedule('0 0 * * *', async () => {
        logger.info('Starting daily user tier update job...');
        try {
            const users = await User.find();
            for (const user of users) {
                await this.calculateUserTier(user._id);
            }
            logger.info('Daily user tier update job completed.');
        } catch (err) {
            logger.error(`Error during tier update job: ${err.message}`);
        }
    });
};

exports.getTiers = () => TIERS;