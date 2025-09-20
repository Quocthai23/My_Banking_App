const axios = require('axios');
const { logger } = require('../config');

// NÂNG CẤP: Kiểm tra xem các biến môi trường có tồn tại không
if (!process.env.SOCKET_API_URL || !process.env.SOCKET_API_KEY) {
  logger.error("Biến môi trường SOCKET_API_URL hoặc SOCKET_API_KEY chưa được thiết lập!");
  // Trong môi trường production, bạn có thể muốn dừng ứng dụng ở đây
  // process.exit(1); 
}

const socketApi = axios.create({
  baseURL: process.env.SOCKET_API_URL,
  headers: {
    'API-KEY': process.env.SOCKET_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * Lấy báo giá cho một giao dịch cầu nối.
 * @param {object} params - Các tham số cho báo giá.
 * @returns {Promise<object>} Dữ liệu báo giá từ Socket.
 */
exports.getBridgeQuote = async (params) => {
  const { fromChainId, fromTokenAddress, toChainId, toTokenAddress, amount, userAddress } = params;
  try {
    const response = await socketApi.get('/quote', {
      params: {
        fromChainId,
        fromTokenAddress,
        toChainId,
        toTokenAddress,
        fromAmount: amount, // 'amount' nội bộ được map tới 'fromAmount' của Socket API
        userAddress,
        uniqueRoutesPerBridge: true,
        sort: 'output', // Sắp xếp theo lượng nhận được
      }
    });
    logger.info(`Lấy báo giá thành công từ chain ${fromChainId} đến ${toChainId}`);
    return response.data;
  } catch (error) {
    // NÂNG CẤP: Xử lý lỗi Axios chi tiết hơn
    let errorMessage = 'Lỗi không xác định khi lấy báo giá.';
    if (error.response) {
      // Server đã phản hồi với mã trạng thái ngoài 2xx
      errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // Yêu cầu đã được gửi đi nhưng không nhận được phản hồi
      errorMessage = 'Không nhận được phản hồi từ dịch vụ bridge.';
    } else {
      // Lỗi xảy ra khi thiết lập yêu cầu
      errorMessage = error.message;
    }
    logger.error(`[getBridgeQuote] ${errorMessage}`);
    throw new Error('Không thể lấy báo giá từ dịch vụ bridge.');
  }
};

/**
 * Bắt đầu một giao dịch và lấy dữ liệu để ký.
 * @param {object} route - Đối tượng route nhận được từ API báo giá.
 * @returns {Promise<object>} Dữ liệu giao dịch từ Socket.
 */
exports.getBridgeTransactionData = async (route) => {
    try {
        const response = await socketApi.post('/build-tx', { route });
        logger.info(`Lấy dữ liệu giao dịch cho route thành công.`);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`[getBridgeTransactionData] Lỗi khi xây dựng giao dịch từ Socket: ${errorMessage}`);
        throw new Error('Không thể lấy dữ liệu giao dịch bridge.');
    }
};

/**
 * Lấy trạng thái của một giao dịch cầu nối đang diễn ra.
 * @param {string} transactionHash - Hash của giao dịch trên chuỗi nguồn.
 * @param {number} fromChainId - ID của chuỗi nguồn.
 * @param {number} toChainId - ID của chuỗi đích.
 * @returns {Promise<object>} Trạng thái giao dịch.
 */
exports.getBridgeTransactionStatus = async (transactionHash, fromChainId, toChainId) => {
    try {
        const response = await socketApi.get('/bridge-status', {
            params: { transactionHash, fromChainId, toChainId }
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`[getBridgeTransactionStatus] Lỗi khi lấy trạng thái bridge: ${errorMessage}`);
        throw new Error('Không thể lấy trạng thái giao dịch bridge.');
    }
};
