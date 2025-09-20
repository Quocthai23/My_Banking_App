const bridgeService = require('../services/bridgeService');
const { logger } = require('../config'); // Import logger để ghi lại lỗi

/**
 * Lấy báo giá cho một giao dịch bridge.
 * NÂNG CẤP: Thêm validation để đảm bảo tất cả các tham số cần thiết đều có mặt.
 */
exports.getQuote = async (req, res) => {
  try {
    const { fromChainId, fromTokenAddress, toChainId, toTokenAddress, fromAmount } = req.query;
    const userAddress = req.user?.walletAddress;

    // --- NÂNG CẤP: Validation ---
    if (!fromChainId || !fromTokenAddress || !toChainId || !toTokenAddress || !fromAmount || !userAddress) {
      return res.status(400).json({ 
        error: 'Thiếu các tham số bắt buộc.',
        required: ['fromChainId', 'fromTokenAddress', 'toChainId', 'toTokenAddress', 'fromAmount']
      });
    }

    const quoteParams = {
        fromChainId,
        fromTokenAddress,
        toChainId,
        toTokenAddress,
        amount: fromAmount, // SỬA LỖI: Sử dụng 'fromAmount' từ query
        userAddress, 
    };
    
    const quote = await bridgeService.getBridgeQuote(quoteParams);
    res.json(quote);

  } catch (err) {
    logger.error(`[getQuote] Lỗi khi lấy báo giá: ${err.message}`);
    res.status(500).json({ error: 'Không thể lấy báo giá cho giao dịch bridge.' });
  }
};

/**
 * Lấy dữ liệu giao dịch để ký.
 */
exports.getTransactionData = async (req, res) => {
  try {
    const { route } = req.body;
    if (!route) {
        return res.status(400).json({ error: 'Đối tượng `route` là bắt buộc.'});
    }
    const txData = await bridgeService.getBridgeTransactionData(route);
    res.json(txData);
  } catch (err) {
    logger.error(`[getTransactionData] Lỗi khi xây dựng giao dịch: ${err.message}`);
    res.status(500).json({ error: 'Không thể tạo dữ liệu giao dịch.' });
  }
};

/**
 * Lấy trạng thái của một giao dịch bridge.
 */
exports.getTransactionStatus = async (req, res) => {
    try {
        const { transactionHash, fromChainId, toChainId } = req.query;
        if (!transactionHash || !fromChainId || !toChainId) {
            return res.status(400).json({ error: 'Thiếu các tham số `transactionHash`, `fromChainId`, hoặc `toChainId`.' });
        }
        const status = await bridgeService.getBridgeTransactionStatus(transactionHash, fromChainId, toChainId);
        res.json(status);
    } catch (err) {
        logger.error(`[getTransactionStatus] Lỗi khi lấy trạng thái giao dịch: ${err.message}`);
        res.status(500).json({ error: 'Không thể lấy trạng thái giao dịch.' });
    }
};