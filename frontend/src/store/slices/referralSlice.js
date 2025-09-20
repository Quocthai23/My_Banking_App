import { getReferralInfo } from '../../api/api'; // Sửa lỗi: Import named

export const createReferralSlice = (set, get) => ({
    referralInfo: {
        referralCode: '',
        referrals: [],
        earnings: 0,
    },
    referralLoading: false,

    fetchReferralInfo: async () => {
        set({ referralLoading: true });
        try {
            const info = await getReferralInfo();
            set({ referralInfo: info, referralLoading: false });
        } catch (error) {
            console.error("Lỗi khi tải thông tin giới thiệu:", error);
            get().addNotification('Không thể tải thông tin giới thiệu.', 'error');
            set({ referralLoading: false });
        }
    },
});