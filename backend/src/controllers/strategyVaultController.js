const strategyVaultService = require('../services/strategyVaultService');
const StrategyVault = require('../models/StrategyVault');
const { logger } = require('../config');

exports.getVaults = async (req, res) => {
  try {
    const vaults = await strategyVaultService.getAvailableVaults();
    res.json({ vaults });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve strategy vaults.' });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { vaultId, amount } = req.body;
    const deposit = await strategyVaultService.deposit(req.user.userId, vaultId, parseFloat(amount));
    res.status(201).json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMyDeposits = async (req, res) => {
    try {
        const deposits = await strategyVaultService.getUserDeposits(req.user.userId);
        res.json({ deposits });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve user deposits.' });
    }
};

exports.createVault = async (req, res) => {
  try {
    const newVault = new StrategyVault(req.body);
    await newVault.save();
    res.status(201).json(newVault);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};