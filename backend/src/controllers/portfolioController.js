const portfolioService = require('../services/portfolioService');

exports.getPortfolio = async (req, res) => {
  try {
    const portfolioData = await portfolioService.getPortfolio(req.user.userId);
    res.json(portfolioData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};