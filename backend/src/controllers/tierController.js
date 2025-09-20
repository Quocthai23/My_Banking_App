const tierService = require('../services/tierService');
const { logger } = require('../config/index'); // Import logger

exports.getUserTier = async (req, res) => {
  try {
    const { tier, totalVolume } = await tierService.calculateUserTier(req.user.userId);
    const allTiers = tierService.getTiers();
    
    const tiersArray = Object.keys(allTiers).sort((a, b) => allTiers[a].minVolume - allTiers[b].minVolume);
    const currentIndex = tiersArray.indexOf(tier);
    
    let nextTierData = null;
    // Đảm bảo currentIndex hợp lệ trước khi tiếp tục
    if (currentIndex > -1 && currentIndex < tiersArray.length - 1) {
        const nextTierName = tiersArray[currentIndex + 1];
        nextTierData = {
            name: nextTierName,
            minVolume: allTiers[nextTierName].minVolume,
        };
    }

    res.json({
      tier: tier,
      volume: totalVolume,
      benefits: allTiers[tier].benefits,
      nextTier: nextTierData,
    });
  } catch (err) {
    // NÂNG CẤP: Ghi lại lỗi chi tiết ở backend để dễ dàng gỡ lỗi
    logger.error(`Failed to get user tier for ${req.user.userId}: ${err.stack}`);
    res.status(500).json({ error: 'An unexpected error occurred while fetching your tier information.' });
  }
};

exports.getAllTiers = (req, res) => {
    try {
        const tiers = tierService.getTiers();
        res.json({ tiers });
    } catch(err) {
        logger.error(`Failed to get all tiers: ${err.stack}`);
        res.status(500).json({ error: 'Could not fetch tiers information.'});
    }
};