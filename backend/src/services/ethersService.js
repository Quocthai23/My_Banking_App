const { ethers } = require('ethers');
// SỬA LỖI: Import các thành phần cần thiết từ cấu hình blockchain tập trung
const { provider, erc20Tokens } = require('../config/blockchain');
const logger = require('../middlewares/logger');

// SỬA LỖI: Định nghĩa một ABI tối thiểu, chuẩn cho ERC20 ngay tại đây.
// Điều này là cần thiết để tương tác với các token như DAI, USDC, WETH.
const genericErc20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
];

/**
 * Lấy số dư của tất cả các token ERC20 đã được cấu hình cho một địa chỉ ví.
 * @param {string} walletAddress Địa chỉ ví để kiểm tra.
 * @returns {Promise<Array>} Một mảng các đối tượng token với số dư của chúng.
 */
const getTokenBalances = async (walletAddress) => {
    const balances = [];

    // Lặp qua các token đã được định nghĩa trong `erc20.json` (từ file blockchain.js)
    for (const tokenSymbol in erc20Tokens) {
        const tokenAddress = erc20Tokens[tokenSymbol];
        try {
            const contract = new ethers.Contract(tokenAddress, genericErc20Abi, provider);
            
            const [balance, name, decimals] = await Promise.all([
                contract.balanceOf(walletAddress),
                contract.name(),
                contract.decimals()
            ]);

            const formattedBalance = ethers.utils.formatUnits(balance, decimals);

            // Chỉ thêm vào danh sách nếu có số dư
            if (parseFloat(formattedBalance) > 0) {
                balances.push({
                    tokenName: name,
                    tokenSymbol: tokenSymbol.toUpperCase(),
                    amount: formattedBalance,
                    tokenAddress: tokenAddress,
                });
            }
        } catch (error) {
            // Ghi log lỗi nhưng không làm sập toàn bộ quy trình
            logger.error(`Could not fetch balance for ${tokenSymbol.toUpperCase()} for wallet ${walletAddress}: ${error.message}`);
        }
    }
    return balances;
};

module.exports = {
    getTokenBalances,
};

