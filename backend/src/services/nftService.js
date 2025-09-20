const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../middlewares/logger');

const collectionCache = new NodeCache({ stdTTL: 900 });

const openseaApi = axios.create({
    baseURL: process.env.OPENSEA_API_URL,
    headers: {
        'X-API-KEY': process.env.OPENSEA_API_KEY,
        'Accept': 'application/json'
    }
});

const getNftsForOwner = async (walletAddress) => {
    // --- BƯỚC 3: SỬA LỖI GỌI API OPENSEA Ở MÔI TRƯỜNG DEV ---
    // Nếu không phải môi trường production, trả về dữ liệu giả để tránh lỗi
    if (process.env.NODE_ENV !== 'production') {
        logger.info(`[DEV MODE] Trả về dữ liệu NFT giả cho địa chỉ ${walletAddress}`);
        return [
            { name: 'Mock Dev NFT #1', collection: 'Mock Collection', image_url: 'https://via.placeholder.com/200', floorPrice: 0.1 },
            { name: 'Mock Dev NFT #2', collection: 'Mock Collection', image_url: 'https://via.placeholder.com/200', floorPrice: 0.25 },
        ];
    }
    
    // --- GIỮ NGUYÊN LOGIC CŨ CHO MÔI TRƯỜNG PRODUCTION ---
    if (!process.env.OPENSEA_API_KEY || !process.env.OPENSEA_API_URL) {
        logger.warn('OPENSEA_API_KEY or OPENSEA_API_URL is not set. Skipping NFT fetch.');
        return [];
    }
    
    if (!walletAddress || typeof walletAddress !== 'string') {
        logger.warn(`getNftsForOwner called with an invalid wallet address: ${walletAddress}`);
        return [];
    }
    
    try {
        const response = await openseaApi.get(`/chain/ethereum/account/${walletAddress}/nfts`);

        if (response && response.data && Array.isArray(response.data.nfts)) {
            logger.info(`Fetched ${response.data.nfts.length} NFTs for wallet ${walletAddress}`);
            return response.data.nfts;
        } else {
            logger.warn(`Unexpected response structure from OpenSea for wallet ${walletAddress}. Data:`, response.data);
            return [];
        }
        
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        logger.error(`Error fetching NFTs from OpenSea for wallet ${walletAddress}: ${errorMessage}`);
        return [];
    }
};

const getCollectionStats = async (collectionSlug) => {
    const cachedData = collectionCache.get(collectionSlug);
    if (cachedData) return cachedData;
    
    if (!process.env.OPENSEA_API_KEY) return null;

    try {
        const response = await openseaApi.get(`/collections/${collectionSlug}`);
        const collectionData = response.data;
        
        const stats = {
            name: collectionData.name,
            imageUrl: collectionData.image_url,
            floorPrice: collectionData.total_supply > 0 ? (collectionData.stats?.floor_price || 0) : 0,
        };
        
        collectionCache.set(collectionSlug, stats);
        return stats;

    } catch (error) {
        logger.error(`Error fetching collection stats for ${collectionSlug}: ${error.message}`);
        return null;
    }
};

module.exports = {
    getNftsForOwner,
    getCollectionStats
};
