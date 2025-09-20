const axios = require('axios');
const NodeCache = require('node-cache');
const { logger } = require('../config');

// Cache giá trong 5 phút
const priceCache = new NodeCache({ stdTTL: 300 });

const COINGECKO_API_URL = process.env.COINGECKO_API_URL;

// Ánh xạ từ symbol sang coingecko_id (quan trọng)
const TOKEN_ID_MAP = {
    'ETH': 'ethereum',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'WBTC': 'wrapped-bitcoin',
    // Thêm các token khác bạn muốn hỗ trợ
};

/**
 * Lấy giá hiện tại của nhiều token.
 * @param {string[]} tokenSymbols - Mảng các symbol (ví dụ: ['ETH', 'USDT']).
 * @returns {Promise<object>} Một đối tượng với key là symbol và value là giá USD.
 */
exports.getPrices = async (tokenSymbols) => {
    const prices = {};
    const tokensToFetch = [];

    // Kiểm tra cache trước
    tokenSymbols.forEach(symbol => {
        const cachedPrice = priceCache.get(symbol);
        if (cachedPrice) {
            prices[symbol] = cachedPrice;
        } else if (TOKEN_ID_MAP[symbol]) {
            tokensToFetch.push(TOKEN_ID_MAP[symbol]);
        }
    });

    if (tokensToFetch.length > 0) {
        try {
            const ids = tokensToFetch.join(',');
            const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
                params: {
                    ids: ids,
                    vs_currencies: 'usd',
                },
            });
            const data = response.data;

            // Cập nhật kết quả và cache
            Object.keys(data).forEach(coingeckoId => {
                const symbol = Object.keys(TOKEN_ID_MAP).find(key => TOKEN_ID_MAP[key] === coingeckoId);
                if (symbol) {
                    const price = data[coingeckoId].usd;
                    prices[symbol] = price;
                    priceCache.set(symbol, price);
                }
            });
        } catch (error) {
            logger.error(`Failed to fetch prices from CoinGecko: ${error.message}`);
        }
    }
    
    return prices;
};