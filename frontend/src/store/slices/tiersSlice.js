import { api } from '../../api/api';

export const createTiersSlice = (set, get) => ({
    myTier: null,
    tiers: null,
    tiersLoading: false,

    fetchTiersData: async () => {
        set({ tiersLoading: true });
        try {
            // Sử dụng Promise.all để gọi API song song, tăng hiệu suất
            const [myTierResponse, allTiersResponse] = await Promise.all([
                api.get('/tiers/my-tier'),
                api.get('/tiers/')
            ]);

            set({
                myTier: myTierResponse.data,
                tiers: allTiersResponse.data.tiers,
                tiersLoading: false,
            });

        } catch (error) {
            console.error('Failed to fetch tiers data:', error);
            get().addNotification('Không thể tải dữ liệu cấp bậc.', 'error');
            set({ tiersLoading: false });
        }
    },
});
