const { ethers } = require('ethers');
// SỬA LỖI: Bỏ `ethersService` và import trực tiếp từ cấu hình blockchain tập trung
const { getContract } = require('../config/blockchain');
const logger = require('../middlewares/logger');
const User = require('../models/User');

const getVaultInfo = async () => {
    try {
        // Sử dụng getContract để lấy instance đã được khởi tạo
        const stakingVault = getContract('stakingVault');
        
        const [totalStaked, rewardRatePerSecond, lockDuration] = await Promise.all([
            stakingVault.totalStaked(),
            stakingVault.rewardRatePerSecond(),
            stakingVault.lockDuration()
        ]);

        // Giữ nguyên logic tính toán cũ
        const apy = (parseFloat(ethers.utils.formatEther(rewardRatePerSecond)) * 31536000) * 100;

        return {
            address: stakingVault.address,
            rewardRatePerSecond: rewardRatePerSecond.toString(),
            lockDurationInSeconds: lockDuration.toString(),
            totalStaked: ethers.utils.formatEther(totalStaked),
            apy: apy.toFixed(2)
        };
    } catch (err) {
        logger.error(`Error fetching vault info: ${err.message}`);
        throw new Error('Could not fetch vault info from blockchain.');
    }
};

const getStakedBalances = async (walletAddress) => {
    if (!walletAddress) return [];
    
    try {
        const stakingVault = getContract('stakingVault');
        const governanceToken = getContract('governanceToken');
        
        const userStake = await stakingVault.userStakes(walletAddress);

        if (userStake.amount.isZero()) {
            return [];
        }
        
        const tokenSymbol = await governanceToken.symbol();
        const tokenName = await governanceToken.name();
        
        return [{
            tokenName: tokenName,
            tokenSymbol: tokenSymbol,
            amount: ethers.utils.formatEther(userStake.amount),
            tokenAddress: governanceToken.address,
        }];

    } catch (error) {
        logger.error(`Error fetching staked balance for ${walletAddress}: ${error.message}`);
        return [];
    }
};

const getUserStake = async (userId) => {
    const user = await User.findById(userId);
    // Đồng bộ với User model đã đổi tên trường
    if (!user || !user.address) {
      throw new Error('User or wallet address not found');
    }
    
    const stakingContract = getContract('stakingVault');
    const userStake = await stakingContract.userStakes(user.address);

    if (userStake.amount.isZero()) {
        return null;
    }
    const pendingRewards = await stakingContract.calculateRewards(user.address);
    const lockDuration = await stakingContract.lockDuration();
    const unlockTimestamp = userStake.startTime.add(lockDuration).toNumber();
 
    return {
        amount: ethers.utils.formatEther(userStake.amount),
        startTime: new Date(userStake.startTime.toNumber() * 1000),
        rewardsPaid: ethers.utils.formatEther(userStake.rewardsPaid),
        pendingRewards: ethers.utils.formatEther(pendingRewards),
        unlockTime: new Date(unlockTimestamp * 1000),
        isLocked: Date.now() / 1000 < unlockTimestamp,
    };
};

module.exports = {
    getVaultInfo,
    getStakedBalances,
    getUserStake
};

