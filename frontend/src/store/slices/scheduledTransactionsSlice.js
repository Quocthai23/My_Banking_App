import { api } from '../../api/api';

export const createScheduledTransactionsSlice = (set, get) => ({
    scheduledTransactions: [],
    scheduledTxLoading: false,

    fetchScheduledTransactions: async () => {
        set({ scheduledTxLoading: true });
        try {
            const response = await api.get('/scheduledTransactions');
            set({ scheduledTransactions: response.data.transactions, scheduledTxLoading: false });
        } catch (error) {
            console.error('Failed to fetch scheduled transactions:', error);
            get().addNotification('Không thể tải danh sách giao dịch định kỳ.', 'error');
            set({ scheduledTxLoading: false });
        }
    },

    scheduleTransaction: async (txData) => {
        set({ scheduledTxLoading: true });
        try {
            const response = await api.post('/scheduledTransactions', txData);
            set(state => ({
                scheduledTransactions: [...state.scheduledTransactions, response.data].sort((a, b) => new Date(a.executeAt) - new Date(b.executeAt)),
            }));
            get().addNotification('Lên lịch giao dịch thành công!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to schedule transaction:', error);
            const errorMessage = error.response?.data?.error || 'Lên lịch giao dịch thất bại.';
            get().addNotification(errorMessage, 'error');
            return false;
        } finally {
            set({ scheduledTxLoading: false });
        }
    },

    cancelScheduledTransaction: async (txId) => {
        try {
            await api.delete(`/scheduledTransactions/${txId}`);
            set(state => ({
                scheduledTransactions: state.scheduledTransactions.map(tx =>
                    tx._id === txId ? { ...tx, status: 'cancelled' } : tx
                ),
            }));
            get().addNotification('Đã hủy giao dịch định kỳ.', 'success');
        } catch (error) {
            console.error('Failed to cancel scheduled transaction:', error);
            const errorMessage = error.response?.data?.error || 'Hủy giao dịch thất bại.';
            get().addNotification(errorMessage, 'error');
        }
    },
});
