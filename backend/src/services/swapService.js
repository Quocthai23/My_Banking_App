const axios = require('axios');
const { logger } = require('../config');

const oneInchApi = axios.create({
  baseURL: process.env.ONEINCH_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.ONEINCH_API_KEY}`,
    'Accept': 'application/json'
  }
});

/**
 * Lấy báo giá cho một cặp giao dịch.
 * @param {string} fromTokenAddress - Địa chỉ token muốn bán.
 * @param {string} toTokenAddress - Địa chỉ token muốn mua.
 * @param {string} amount - Số lượng token muốn bán (đơn vị nhỏ nhất, ví dụ: wei).
 * @returns {Promise<object>} Dữ liệu báo giá từ 1inch.
 */
exports.getSwapQuote = async (fromTokenAddress, toTokenAddress, amount) => {
  try {
    const response = await oneInchApi.get('/quote', {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount,
      },
    });
    logger.info(`Fetched swap quote from ${fromTokenAddress} to ${toTokenAddress}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching swap quote from 1inch: ${error.response?.data?.description || error.message}`);
    throw new Error('Could not fetch swap quote.');
  }
};

/**
 * Lấy dữ liệu giao dịch thô để thực hiện swap.
 * @param {string} fromTokenAddress - Địa chỉ token muốn bán.
 * @param {string} toTokenAddress - Địa chỉ token muốn mua.
 * @param {string} amount - Số lượng token muốn bán.
 * @param {string} fromAddress - Địa chỉ ví của người dùng thực hiện swap.
 * @param {number} slippage - Mức trượt giá cho phép (ví dụ: 1 cho 1%).
 * @returns {Promise<object>} Dữ liệu giao dịch từ 1inch.
 */
exports.getSwapTransactionData = async (fromTokenAddress, toTokenAddress, amount, fromAddress, slippage) => {
  try {
    const response = await oneInchApi.get('/swap', {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount,
        fromAddress,
        slippage,
      },
    });
    logger.info(`Fetched swap transaction data for user ${fromAddress}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching swap data from 1inch: ${error.response?.data?.description || error.message}`);
    throw new Error('Could not get swap transaction data.');
  }
};