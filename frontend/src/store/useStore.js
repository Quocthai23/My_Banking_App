import { create } from 'zustand';

// Import các slice
import { createAccountsSlice } from './slices/accountsSlice';
import { createAuthSlice } from './slices/authSlice';
import { createWalletSlice } from './slices/walletSlice';
import { createPortfolioSlice } from './slices/portfolioSlice';
import { createNotificationsSlice } from './slices/notificationsSlice';
import { createReferralSlice } from './slices/referralSlice';
import { createStakingSlice } from './slices/stakingSlice';
import { createLoansSlice } from './slices/loansSlice';
import { createGovernanceSlice } from './slices/governanceSlice';
import { createTransactionsSlice } from './slices/transactionsSlice';
import { createBridgeSlice } from './slices/bridgeSlice';
import { createInvoicesSlice } from './slices/invoicesSlice';
import { createProfileSlice } from './slices/profileSlice';
import { createSupportSlice } from './slices/supportSlice';
import { createTiersSlice } from './slices/tiersSlice';
import { createApiKeysSlice } from './slices/apiKeysSlice';
import { createScheduledTransactionsSlice } from './slices/scheduledTransactionsSlice';
import { createSettingsSlice } from './slices/settingsSlice';

export default create((set, get) => ({
    // Cấu trúc này không thay đổi, nó sẽ tự động nhận cấu trúc lồng nhau mới từ walletSlice
    ...createAuthSlice(set, get),
    ...createWalletSlice(set, get),
    ...createAccountsSlice(set, get),
    ...createPortfolioSlice(set, get),
    ...createNotificationsSlice(set, get),
    ...createReferralSlice(set, get),
    ...createStakingSlice(set, get),
    ...createLoansSlice(set, get),
    ...createGovernanceSlice(set, get),
    ...createTransactionsSlice(set, get),
    ...createBridgeSlice(set, get),
    ...createInvoicesSlice(set, get),
    ...createProfileSlice(set, get),
    ...createSupportSlice(set, get),
    ...createTiersSlice(set, get),
    ...createApiKeysSlice(set, get),
    ...createScheduledTransactionsSlice(set ,get),
    ...createSettingsSlice(set, get),

    // Hàm "nhạc trưởng" để tải dữ liệu ban đầu một cách có kiểm soát
    initAutoFetch: () => {
        if (get().auth.isDataInitialized || !get().auth.isAuthenticated) {
            return;
        }
        
        set(state => ({ auth: { ...state.auth, isDataInitialized: true } }));
        
        console.log("Bắt đầu tự động tải dữ liệu...");

        // Bắt đầu tải tất cả dữ liệu cần thiết
        if (get().initSocket) get().initSocket();
        if (get().fetchNotifications) get().fetchNotifications();
        if (get().fetchReferralInfo) get().fetchReferralInfo();
        if (get().fetchAccounts) get().fetchAccounts();
        if (get().fetchUserLoans) get().fetchUserLoans();
        
        // Truy cập `isLinked` qua đường dẫn đúng `get().wallet.isLinked`
        if (get().wallet.isLinked) {
            if (get().fetchPortfolio) get().fetchPortfolio();
            if (get().fetchStakingData) get().fetchStakingData();
            if (get().fetchProposals) get().fetchProposals();
        }
    },
}));

