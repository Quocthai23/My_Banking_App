import { getStakingVaultInfo, getMyStakes, stakeTokens as stakeTokensApi, unstakeTokens as unstakeTokensApi } from '../../api/api';

// Slice này sẽ tạo và quản lý một đối tượng 'staking' trong state gốc của store.
export const createStakingSlice = (set, get) => ({
  // Khởi tạo state với cấu trúc mà các component mong đợi
  staking: {
    vaults: [],
    stakes: [],
    loading: false,
    error: null,
  },

  // Action chính để tải tất cả dữ liệu cần thiết cho trang staking
  fetchStakingData: async () => {
    // Ngăn việc tải lại nếu ví chưa kết nối hoặc đang trong quá trình tải
    if (get().staking.loading || !get().wallet?.isLinked) {
      return;
    }
    
    // Đặt trạng thái loading một cách an toàn bằng cách merge với state staking hiện có
    set(state => ({ 
      staking: { ...state.staking, loading: true, error: null } 
    }));

    try {
      // API getStakingVaultInfo nên trả về một đối tượng có chứa cả `vaults` và `myStakes`
      const data = await getStakingVaultInfo(); 

      set(state => ({
        staking: {
          ...state.staking,
          loading: false,
          // Cung cấp mảng rỗng mặc định nếu API không trả về dữ liệu
          vaults: data.vaults || [],
          stakes: data.myStakes || [], 
        }
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể tải dữ liệu staking.';
      set(state => ({
        staking: { ...state.staking, loading: false, error: errorMessage }
      }));
      get().addNotification(errorMessage, 'error');
    }
  },

  // Đổi tên hàm cho nhất quán
  stake: async (vaultId, amount) => {
    set(state => ({ staking: { ...state.staking, loading: true } }));
    try {
      await stakeTokensApi({ vaultId, amount });
      get().addNotification('Stake thành công!', 'success');
      // Sau khi thực hiện thành công, tải lại toàn bộ dữ liệu để cập nhật UI
      await get().fetchStakingData();
      if (get().fetchPortfolio) get().fetchPortfolio();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Stake thất bại.';
       set(state => ({
        staking: { ...state.staking, loading: false, error: errorMessage }
      }));
      get().addNotification(errorMessage, 'error');
    }
  },

  unstake: async (stakeId) => {
     set(state => ({ staking: { ...state.staking, loading: true } }));
    try {
      await unstakeTokensApi(stakeId);
      get().addNotification('Unstake thành công!', 'success');
      // Tải lại toàn bộ dữ liệu
      await get().fetchStakingData();
      if (get().fetchPortfolio) get().fetchPortfolio();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unstake thất bại.';
      set(state => ({
        staking: { ...state.staking, loading: false, error: errorMessage }
      }));
      get().addNotification(errorMessage, 'error');
    }
  },
});
