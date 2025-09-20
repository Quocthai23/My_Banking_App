const StrategyVault = require('../models/StrategyVault');
const Deposit = require('../models/Deposit');
const User = require('../models/User');
const transactionService = require('./transactionService');
const { web3, logger } = require('../config');

exports.getAvailableVaults = () => StrategyVault.find({ isActive: true });
exports.getUserDeposits = (userId) => Deposit.find({ userId }).populate('vaultId');

exports.deposit = async (userId, vaultId, amount) => {
  const vault = await StrategyVault.findById(vaultId);
  const user = await User.findById(userId);
  if (!vault || !user) throw new Error('Vault or user not found.');

  const bankWallet = process.env.BANK_WALLET_ADDRESS;
  const depositTxHash = await transactionService.transfer(
    user.walletAddress, bankWallet, web3.utils.toWei(amount.toString(), 'ether')
  );

  let shares;
  if (vault.totalValueLocked === 0 || vault.totalShares === 0) {
    shares = amount;
  } else {
    const sharePrice = vault.totalValueLocked / vault.totalShares;
    shares = amount / sharePrice;
  }
  
  vault.totalValueLocked += amount;
  vault.totalShares += shares;
  await vault.save();

  const newDeposit = new Deposit({ userId, vaultId, amount, shares, depositTxHash });
  await newDeposit.save();

  logger.info(`User ${userId} deposited ${amount} into vault ${vaultId} and received ${shares} shares.`);
  return newDeposit;
};