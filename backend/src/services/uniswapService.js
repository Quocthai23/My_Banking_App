const { NonfungiblePositionManager } = require('@uniswap/v3-sdk');
const { ethers } = require('ethers');
const { keeperWallet } = require('./ethersService');
const { logger } = require('../config');

const POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

// Hàm thu hoạch phí (harvest)
exports.collectFees = async (positionId) => {
    if (!keeperWallet) throw new Error('Keeper wallet is not configured.');

    const positionManager = new ethers.Contract(
        POSITION_MANAGER_ADDRESS,
        ['function collect(tuple(uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external payable returns (uint256 amount0, uint256 amount1)'],
        keeperWallet
    );
    
    const collectParams = {
        tokenId: positionId,
        recipient: keeperWallet.address,
        amount0Max: ethers.constants.MaxUint128,
        amount1Max: ethers.constants.MaxUint128,
    };
    
    const tx = await positionManager.collect(collectParams, { gasLimit: 1000000 });
    const receipt = await tx.wait();
    logger.info(`Harvested fees for position ${positionId}. TxHash: ${receipt.transactionHash}`);
    return receipt;
};