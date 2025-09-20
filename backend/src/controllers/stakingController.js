const Vault = require('../models/Vault');
const Stake = require('../models/Stake');
const stakingService = require('../services/stakingService');

/**
 * Lấy danh sách tất cả các Staking Vaults.
 */
exports.getVaults = async (req, res, next) => {
    try {
        const vaults = await Vault.find({});
        res.status(200).json(vaults);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách staking vaults:", error);
        next(error);
    }
};

/**
 * Lấy các khoản stake của người dùng đang đăng nhập.
 */
exports.getMyStakes = async (req, res, next) => {
    try {
        // Populate giúp lấy cả thông tin chi tiết của vault liên quan
        const stakes = await Stake.find({ user: req.user.id }).populate('vault');
        res.status(200).json(stakes);
    } catch (error) {
        next(error);
    }
};

/**
 * Tạo một vault mới (chỉ dành cho Admin).
 */
exports.createVault = async (req, res, next) => {
    try {
        const newVault = await stakingService.createVault(req.body);
        res.status(201).json(newVault);
    } catch (error) {
        next(error);
    }
};

/**
 * Xử lý khi người dùng stake.
 */
exports.stake = async (req, res, next) => {
    const { vaultId, amount, txHash } = req.body;
    const userId = req.user.id;

    try {
        const isValid = await stakingService.verifyStakeTransaction(txHash, userId, vaultId, amount);
        if (!isValid) {
            return res.status(400).json({ message: "Giao dịch stake không hợp lệ hoặc đã được sử dụng." });
        }
        
        const newStake = await stakingService.stake(userId, vaultId, amount, txHash);
        res.status(201).json(newStake);
    } catch (error) {
        next(error);
    }
};

/**
 * Xử lý khi người dùng unstake.
 */
exports.unstake = async (req, res, next) => {
    const { stakeId } = req.params;
    const userId = req.user.id;

    try {
        const result = await stakingService.unstake(userId, stakeId);
        res.status(200).json(result);
    } catch (error) {
        if (error.message.includes("chưa đủ thời gian")) {
             return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * [FIX & UPGRADE] Lấy tất cả dữ liệu cần thiết cho trang Staking.
 * Loại bỏ bước kiểm tra req.user thừa, vì middleware 'auth' đã đảm nhiệm việc này.
 * Điều này giúp giải quyết race condition với cơ chế refresh token của frontend.
 */
exports.getVaultInfo = async (req, res, next) => {
    try {
        // Middleware 'auth' đã đảm bảo req.user.id tồn tại ở đây.
        const userId = req.user.id;

        // Thực hiện 2 truy vấn song song để tăng hiệu suất
        const [vaults, myStakes] = await Promise.all([
            Vault.find({}),
            Stake.find({ user: userId }) 
        ]);

        // Trả về đối tượng chứa cả hai mảng dữ liệu
        res.status(200).json({ vaults, myStakes });

    } catch (error) {
        // Lỗi sẽ chỉ xảy ra ở đây nếu có vấn đề về cơ sở dữ liệu.
        console.error("Lỗi khi tổng hợp dữ liệu cho trang staking:", error);
        next(error);
    }
};