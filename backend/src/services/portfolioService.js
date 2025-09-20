const User = require('../models/User');
const ethersService = require('./ethersService');
const priceService = require('./priceService');
const stakingService = require('./stakingService');
const loanService = require('./loanService');
const nftService = require('./nftService');
const logger = require('../middlewares/logger'); // Import logger để sử dụng

const getPortfolio = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        logger.error(`User not found with ID: ${userId}`);
        throw new Error('User not found');
    }

    const { address } = user;

    // THAY ĐỔI: Thay vì trả về portfolio rỗng, ném ra lỗi để frontend có thể xử lý.
    // Logic này chỉ ảnh hưởng đến trường hợp người dùng chưa có ví, logic cũ vẫn được giữ nguyên.
    if (!address) {
        logger.warn(`User ${userId} does not have a wallet address. Throwing error.`);
        const error = new Error('Wallet address not linked to the user account.');
        error.statusCode = 400; // Frontend sẽ bắt status code này
        throw error;
    }
    
    // --- LOGIC CŨ VẪN GIỮ NGUYÊN TỪ ĐÂY TRỞ XUỐNG ---
    
    let tokenBalances = [], stakedBalances = [], nfts = [], loans = [];

    try {
        tokenBalances = await ethersService.getTokenBalances(address);
    } catch (error) {
        logger.error(`Could not fetch token balances for ${address}:`, error.message);
    }

    try {
        stakedBalances = await stakingService.getStakedBalances(address); 
    } catch (error) {
        logger.error(`Could not fetch staked balances for ${address}:`, error.message);
    }
    
    try {
        nfts = await nftService.getNftsForOwner(address);
    } catch (error) {
        logger.error(`Could not fetch NFTs for ${address}:`, error.message);
    }
    
    try {
        loans = await loanService.getLoansByUserId(userId);
    } catch (error) {
        logger.error(`Could not fetch loans for user ${userId}:`, error.message);
    }

    const allTokens = [
        ...tokenBalances.map(t => ({ ...t, type: 'wallet' })),
        ...stakedBalances.map(t => ({ ...t, type: 'staked' }))
    ];

    const tokenAddresses = [...new Set(allTokens.map(t => t.tokenAddress))];

    let prices = {};
    try {
        if (tokenAddresses.length > 0) {
            prices = await priceService.getPrices(tokenAddresses);
        }
    } catch (error) {
        logger.error('Could not fetch token prices for portfolio:', error.message);
        tokenAddresses.forEach(addr => { prices[addr] = 0; });
    }

    let tokenValue = 0;
    const tokenHoldings = allTokens.map(token => {
        const price = prices[token.tokenAddress] || 0;
        const value = parseFloat(token.amount) * price;
        tokenValue += value;
        return { ...token, price, value };
    });
    
    const nftValue = nfts.reduce((total, nft) => total + (nft.floorPrice || 0), 0);
    const loanValue = loans.reduce((total, loan) => total + loan.amount, 0);
    const totalValue = tokenValue + nftValue - loanValue;

    return {
        summary: { totalValue, tokenValue, nftValue, loanValue },
        tokenHoldings,
        nftHoldings: nfts,
        loanHoldings: loans,
    };
};

module.exports = {
    getPortfolio,
};
