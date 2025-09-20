const swapService = require('../services/swapService');

// Lấy báo giá
exports.getQuote = async (req, res) => {
  try {
    const { fromTokenAddress, toTokenAddress, amount } = req.query;
    if (!fromTokenAddress || !toTokenAddress || !amount) {
      return res.status(400).json({ error: 'Missing required query parameters: fromTokenAddress, toTokenAddress, amount' });
    }
    const quoteData = await swapService.getSwapQuote(fromTokenAddress, toTokenAddress, amount);
    res.json(quoteData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy dữ liệu giao dịch để ký
exports.getSwapData = async (req, res) => {
  try {
    const { fromTokenAddress, toTokenAddress, amount, slippage = 1 } = req.body;
    const fromAddress = req.user.walletAddress; 

    if (!fromTokenAddress || !toTokenAddress || !amount) {
      return res.status(400).json({ error: 'Missing required body parameters: fromTokenAddress, toTokenAddress, amount' });
    }
    
    const swapData = await swapService.getSwapTransactionData(fromTokenAddress, toTokenAddress, amount, fromAddress, slippage);
    
    // Chỉ trả về các trường cần thiết cho frontend để ký
    res.json({
        from: swapData.tx.from,
        to: swapData.tx.to,
        data: swapData.tx.data,
        value: swapData.tx.value,
        gasPrice: swapData.tx.gasPrice,
        gas: swapData.tx.gas,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};