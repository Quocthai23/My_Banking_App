const mongoose = require('mongoose');

const StrategyVaultSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  depositToken: {
    address: { type: String, required: true },
    symbol: { type: String, required: true },
  },
  strategy: {
    name: { type: String, default: 'UniswapV3-Liquidity-Provision' },
    pool: {
      token0: { address: String, symbol: String },
      token1: { address: String, symbol: String },
      fee: Number,
    },
  },
  totalValueLocked: { type: Number, default: 0 },
  totalShares: { type: Number, default: 0 },
  uniswapPositionId: { type: Number }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('StrategyVault', StrategyVaultSchema);