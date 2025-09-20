import { getUserLoans, requestLoan } from '../../api/api'; // Sửa lỗi: Import named

export const createLoansSlice = (set, get) => ({
    userLoans: [],
    loansLoading: false,

    fetchUserLoans: async () => {
        set({ loansLoading: true });
        try {
            const loans = await getUserLoans();
            set({ userLoans: loans, loansLoading: false });
        } catch (error) {
            console.error("Lỗi khi tải các khoản vay:", error);
            get().addNotification('Không thể tải danh sách khoản vay.', 'error');
            set({ loansLoading: false });
        }
    },

    createLoan: async (loanData) => {
        try {
            const newLoan = await requestLoan(loanData);
            set(state => ({ userLoans: [...state.userLoans, newLoan] }));
            get().addNotification('Yêu cầu vay đã được tạo thành công!', 'success');
        } catch (error) {
            console.error("Lỗi khi tạo khoản vay:", error);
            get().addNotification(error.response?.data?.message || 'Tạo khoản vay thất bại.', 'error');
            throw error;
        }
    },

    repayLoan: async (loanId, amount) => {
        // Cần thêm hàm repayLoan vào api.js nếu muốn dùng ở đây
        // Tạm thời giữ lại cách gọi trực tiếp
        try {
            const { api } = await import('../../api/api');
            await api.post(`/loans/${loanId}/repay`, { amount });
            get().addNotification(`Đã trả ${amount} cho khoản vay thành công.`, 'success');
            get().fetchUserLoans();
        } catch (error) {
            console.error("Lỗi khi trả nợ:", error);
            get().addNotification(error.response?.data?.message || 'Trả nợ thất bại.', 'error');
        }
    },
});