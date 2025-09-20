import { produce } from 'immer';
import { getAccounts, createAccount, closeAccount } from '../../api/api';

const initialState = {
    // --- SỬA LỖI: Chuẩn hóa cấu trúc state lồng nhau ---
    accounts: {
        data: [],
        loading: true,
        error: null,
    }
};

export const createAccountsSlice = (set, get) => ({
    ...initialState,

    // --- ACTION: Lấy danh sách tài khoản ---
    fetchAccounts: async () => {
        set(produce(state => { state.accounts.loading = true; state.accounts.error = null; }));
        try {
            const accountsData = await getAccounts();
            set(produce(state => {
                state.accounts.data = accountsData;
                state.accounts.loading = false;
            }));
        } catch (error) {
            const errorMessage = "Không thể tải danh sách tài khoản.";
            console.error("Fetch accounts error:", error);
            set(produce(state => {
                state.accounts.loading = false;
                state.accounts.error = errorMessage;
            }));
            get().addNotification(errorMessage, 'error');
        }
    },

    // --- ACTION: Tạo tài khoản mới ---
    createAccount: async (accountDetails) => {
        set(produce(state => { state.accounts.loading = true; }));
        try {
            const { account } = await createAccount(accountDetails);
            set(produce(state => {
                state.accounts.data.push(account);
                state.accounts.loading = false;
            }));
            get().addNotification('Tạo tài khoản thành công!', 'success');
            return true; // Trả về true để modal biết và tự đóng
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Tạo tài khoản thất bại.";
            console.error("Create account error:", error);
            set(produce(state => { state.accounts.loading = false; }));
            get().addNotification(errorMessage, 'error');
            return false; // Trả về false
        }
    },

    // --- ACTION: Đóng một tài khoản ---
    closeAccount: async (accountId) => {
        set(produce(state => { state.accounts.loading = true; }));
        try {
            await closeAccount(accountId);
            set(produce(state => {
                state.accounts.data = state.accounts.data.filter(acc => acc._id !== accountId);
                state.accounts.loading = false;
            }));
            get().addNotification('Đóng tài khoản thành công.', 'info');
        } catch (error) {
            const errorMessage = "Đóng tài khoản thất bại.";
            console.error("Close account error:", error);
            set(produce(state => { state.accounts.loading = false; }));
            get().addNotification(errorMessage, 'error');
        }
    },
});
