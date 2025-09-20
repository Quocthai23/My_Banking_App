import { produce } from 'immer';
import { ethers } from 'ethers';
import { updateWalletAddress } from '../../api/api';

// --- TRẠNG THÁI KHỞI TẠO ---
// Sử dụng cấu trúc state chi tiết hơn từ đề xuất của bạn
const initialState = {
    wallet: {
        address: null,
        isLinked: false,
        balance: '0',
        provider: null,
        loading: false,
        error: null,
    }
};

export const createWalletSlice = (set, get) => ({
    ...initialState,

    // Action để kết nối với ví (sử dụng ethers)
    connectWallet: async () => {
        if (typeof window.ethereum === 'undefined') {
            get().addNotification('Vui lòng cài đặt MetaMask!', 'error');
            return;
        }

        set(produce(state => { 
            state.wallet.loading = true; 
            state.wallet.error = null;
        }));

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            const balanceBigInt = await provider.getBalance(address);
            
            // Lấy địa chỉ ví đã lưu trong user profile để kiểm tra
            const userWalletInDb = get().auth.user?.address;
            
            set(produce(state => {
                state.wallet.address = address;
                state.wallet.balance = ethers.formatEther(balanceBigInt);
                state.wallet.provider = provider;
                // Tự động xác nhận đã liên kết nếu địa chỉ ví trùng khớp
                state.wallet.isLinked = userWalletInDb ? address.toLowerCase() === userWalletInDb.toLowerCase() : false;
                state.wallet.loading = false;
            }));

            get().addNotification('Kết nối ví thành công.', 'success');
            
            // Nếu ví đã được liên kết sẵn, tải dữ liệu portfolio ngay
            if (get().wallet.isLinked) {
                get().fetchPortfolio();
            }

        } catch (error) {
            console.error("Lỗi khi kết nối ví:", error);
            const errorMessage = 'Kết nối ví thất bại.';
            set(produce(state => {
                state.wallet.loading = false;
                state.wallet.error = errorMessage;
            }));
            get().addNotification(errorMessage, 'error');
        }
    },
    
    // Action để ngắt kết nối ví
    disconnectWallet: () => {
        set({ ...initialState });
        get().addNotification('Đã ngắt kết nối ví.', 'info');
    },

    // Action để liên kết/lưu địa chỉ ví vào backend (được gọi từ UI)
    linkWallet: async (walletAddress) => {
        set(produce(state => { 
            state.wallet.loading = true; 
            state.wallet.error = null; 
        }));

        try {
            await updateWalletAddress({ walletAddress });
            set(produce(state => {
                state.wallet.isLinked = true;
                state.wallet.loading = false;
            }));
            get().addNotification('Liên kết ví với tài khoản thành công!', 'success');
            
            // Tải dữ liệu portfolio NGAY SAU KHI liên kết thành công
            get().fetchPortfolio();

        } catch (error) {
            const errorMessage = 'Không thể liên kết ví. Vui lòng thử lại.';
            console.error("Lỗi khi liên kết ví:", error);
            set(produce(state => {
                state.wallet.loading = false;
                state.wallet.error = errorMessage;
            }));
            get().addNotification(errorMessage, 'error');
        }
    },
});