const nftService = require('../services/nftService');

exports.getMyNfts = async (req, res) => {
  try {
    const nfts = await nftService.getOwnedNfts(req.user.walletAddress);
    res.json({ nfts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};