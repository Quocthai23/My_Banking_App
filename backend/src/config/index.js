const { connectDB, logger } = require('./database');
const { web3, contract } = require('./blockchain');
const envConfig = require('./env');

module.exports = {
  connectDB,
  logger,
  web3,
  contract,
  envConfig,
};