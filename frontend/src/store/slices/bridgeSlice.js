import { parseUnits } from 'ethers';
import { api } from '../../api/api'; // Import client API đã cấu hình của bạn

// CẤU HÌNH DỮ LIỆU TOKEN VÀ MẠNG LƯỚI
// Trong một ứng dụng thực tế, dữ liệu này nên được lấy từ một tệp cấu hình riêng hoặc từ API
const TOKEN_CONFIG = {
    ethereum: {
        eth: { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18 },
        usdc: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
        usdt: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    },
    polygon: {
        eth: { address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', decimals: 18 }, // Đây là WETH trên Polygon
        usdc: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
        usdt: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    },
    bsc: {
        eth: { address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', decimals: 18 }, // ETH token trên BSC
        usdc: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
        usdt: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    }
};

const CHAIN_ID_MAP = {
    'ethereum': 1,
    'polygon': 137,
    'bsc': 56,
};

/**
 * Slice quản lý trạng thái và logic cho chức năng Cross-Chain Bridge.
 */
export const createBridgeSlice = (set, get) => ({
  // --- STATE ---
  isBridging: false,      // Trạng thái cho biết quá trình bridge có đang diễn ra hay không
  bridgeError: null,      // Lưu lỗi nếu có
  bridgeQuote: null,      // Lưu báo giá nhận được từ API

  // --- ACTIONS ---

  /**
   * Hàm chính để điều phối toàn bộ quá trình bridge.
   * @param {object} bridgeParams - Các tham số cho giao dịch bridge.
   * @param {string} bridgeParams.fromChain - Tên mạng lưới nguồn (vd: 'ethereum').
   * @param {string} bridgeParams.toChain - Tên mạng lưới đích (vd: 'polygon').
   * @param {string} bridgeParams.token - Ký hiệu của token (vd: 'usdc').
   * @param {string} bridgeParams.amount - Số lượng token cần chuyển.
   */
  initiateBridge: async (bridgeParams) => {
    set({ isBridging: true, bridgeError: null, bridgeQuote: null });
    const { fromChain, toChain, token, amount } = bridgeParams;
    const { wallet, addNotification } = get(); // Lấy trạng thái ví và hàm thông báo từ store

    // 1. Kiểm tra điều kiện tiên quyết
    if (!wallet.isLinked || !wallet.address) {
      const errMsg = 'Vui lòng kết nối ví của bạn để bắt đầu.';
      set({ bridgeError: errMsg, isBridging: false });
      addNotification(errMsg, 'error');
      return;
    }

    try {
      // 2. Lấy thông tin cấu hình cần thiết
      const fromChainId = CHAIN_ID_MAP[fromChain];
      const toChainId = CHAIN_ID_MAP[toChain];
      const fromTokenConfig = TOKEN_CONFIG[fromChain]?.[token];
      const toTokenConfig = TOKEN_CONFIG[toChain]?.[token];

      if (!fromChainId || !toChainId || !fromTokenConfig || !toTokenConfig) {
        throw new Error("Cấu hình cho mạng hoặc token đã chọn không hợp lệ.");
      }

      const fromAmountInSmallestUnit = parseUnits(amount, fromTokenConfig.decimals).toString();

      // 3. Gọi API backend để lấy báo giá (Quote)
      const quoteParams = {
        fromChainId,
        toChainId,
        fromTokenAddress: fromTokenConfig.address,
        toTokenAddress: toTokenConfig.address,
        fromAmount: fromAmountInSmallestUnit,
        userAddress: wallet.address,
      };
      
      addNotification('Đang tìm kiếm tuyến đường tốt nhất...', 'info');
      const quoteResponse = await api.get('/bridge/quote', { params: quoteParams });

      if (!quoteResponse.data.result || !quoteResponse.data.result.routes || quoteResponse.data.result.routes.length === 0) {
        throw new Error("Không tìm thấy tuyến đường nào cho giao dịch của bạn.");
      }

      const selectedRoute = quoteResponse.data.result.routes[0]; // Chọn tuyến đường tốt nhất
      set({ bridgeQuote: selectedRoute });
      
      // 4. Gọi API backend để xây dựng dữ liệu giao dịch (Transaction Data)
      addNotification('Đang chuẩn bị giao dịch...', 'info');
      const txDataResponse = await api.post('/bridge/build-tx', { route: selectedRoute });
      const txData = txDataResponse.data.result;

      if (!txData || !txData.txTarget) {
         throw new Error("Không thể tạo dữ liệu giao dịch.");
      }

      // 5. Yêu cầu người dùng ký và gửi giao dịch
      const signer = get().wallet.getSigner();
      if (!signer) {
        throw new Error("Không thể kết nối tới ví. Vui lòng kết nối lại.");
      }
      
      // Đảm bảo người dùng đang ở đúng mạng lưới
       const currentNetwork = await signer.provider.getNetwork();
       if (currentNetwork.chainId !== fromChainId) {
           addNotification(`Vui lòng chuyển sang mạng ${fromChain} trong ví của bạn.`, 'warning');
           try {
               await window.ethereum.request({
                   method: 'wallet_switchEthereumChain',
                   params: [{ chainId: `0x${fromChainId.toString(16)}` }],
               });
           } catch (switchError) {
               throw new Error(`Giao dịch bị hủy. Bạn phải ở trên mạng ${fromChain}.`);
           }
       }
      
      const transactionRequest = {
        from: txData.from,
        to: txData.txTarget,
        data: txData.txData,
        value: txData.value,
        gasLimit: txData.gasLimit ? BigInt(txData.gasLimit) : undefined,
        gasPrice: txData.gasPrice ? BigInt(txData.gasPrice) : undefined,
      };

      addNotification('Vui lòng xác nhận giao dịch trong ví của bạn.', 'info');
      const txResponse = await signer.sendTransaction(transactionRequest);
      
      addNotification(`Đang xử lý giao dịch: ${txResponse.hash.substring(0,12)}...`, 'info');
      await txResponse.wait(); // Chờ giao dịch được xác nhận trên blockchain

      addNotification('Giao dịch Bridge đã hoàn tất thành công!', 'success');
      set({ isBridging: false });

    } catch (error) {
      console.error("Lỗi Bridge:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Đã xảy ra lỗi không xác định.';
      set({ bridgeError: errorMessage, isBridging: false });
      addNotification(errorMessage, 'error');
    }
  },
});

