import { produce } from 'immer';
import { transferFunds } from '../../api/api';

const initialState = {
    // Cấu trúc state lồng nhau để quản lý trạng thái giao dịch
    transactions: {
        loading: false,
        error: null,
    }
};

export const createTransactionsSlice = (set, get) => ({
    ...initialState,

    // --- ACTION: Chuyển tiền ---
    transferFunds: async (transferDetails) => {
        set(produce(state => { state.transactions.loading = true; state.transactions.error = null; }));
        try {
            await transferFunds(transferDetails);
            set(produce(state => { state.transactions.loading = false; }));
            get().addNotification('Chuyển tiền thành công!', 'success');
            // Sau khi thành công, làm mới dữ liệu tài khoản để cập nhật số dư
            if (get().fetchAccounts) {
                get().fetchAccounts();
            }
            return true; // Báo hiệu thành công
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Giao dịch thất bại.";
            console.error("Transfer funds error:", error);
            set(produce(state => {
                state.transactions.loading = false;
                state.transactions.error = errorMessage;
            }));
            get().addNotification(errorMessage, 'error');
            return false; // Báo hiệu thất bại
        }
    },
});
