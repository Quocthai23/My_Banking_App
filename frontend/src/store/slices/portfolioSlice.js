import { produce } from 'immer';
import { getPortfolio } from '../../api/api';

// --- SỬA LỖI: Sử dụng cấu trúc state lồng nhau để nhất quán ---
const initialState = {
    portfolio: {
        data: null,
        loading: true, // Bắt đầu bằng true
        error: null,
    }
};

export const createPortfolioSlice = (set, get) => ({
    ...initialState,

    fetchPortfolio: async () => {
        // Sử dụng isWalletLinked từ walletSlice (giả định nó tồn tại ở top-level)
        if (!get().wallet.isLinked) {
            set(produce(state => { state.portfolio.loading = false; }));
            return;
        }

        set(produce(state => { state.portfolio.loading = true; state.portfolio.error = null; }));
        
        try {
            const portfolioData = await getPortfolio();
            set(produce(state => {
                state.portfolio.data = portfolioData;
                state.portfolio.loading = false;
            }));
        } catch (error) {
            console.error("Lỗi khi tải portfolio:", error);
            const errorMessage = 'Không thể tải dữ liệu portfolio.';
            set(produce(state => {
                state.portfolio.loading = false;
                state.portfolio.error = errorMessage;
            }));
            get().addNotification(errorMessage, 'error');
        }
    },
});
