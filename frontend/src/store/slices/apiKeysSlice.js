import { api } from '../../api/api';

export const createApiKeysSlice = (set, get) => ({
    apiKeys: [],
    apiKeysLoading: false,

    fetchApiKeys: async () => {
        set({ apiKeysLoading: true });
        try {
            const response = await api.get('/apiKeys');
            set({ apiKeys: response.data.keys, apiKeysLoading: false });
        } catch (error) {
            console.error('Failed to fetch API keys:', error);
            get().addNotification('Không thể tải danh sách khóa API.', 'error');
            set({ apiKeysLoading: false });
        }
    },

    createApiKey: async ({ label, permissions }) => {
        set({ apiKeysLoading: true });
        try {
            const response = await api.post('/apiKeys', { label, permissions });
            const { apiKey, record } = response.data;
            
            // Thêm bản ghi của khóa mới vào state, không phải khóa thực tế
            set(state => ({ apiKeys: [record, ...state.apiKeys] }));
            get().addNotification('Tạo khóa API thành công!', 'success');
            
            // Trả về khóa API thực tế để hiển thị một lần cho người dùng
            return apiKey; 
        } catch (error) {
            console.error('Failed to create API key:', error);
            const errorMessage = error.response?.data?.error || 'Tạo khóa API thất bại.';
            get().addNotification(errorMessage, 'error');
            return null;
        } finally {
            set({ apiKeysLoading: false });
        }
    },

    deleteApiKey: async (keyId) => {
        try {
            await api.delete(`/apiKeys/${keyId}`);
            set(state => ({
                apiKeys: state.apiKeys.filter(key => key._id !== keyId)
            }));
            get().addNotification('Đã xóa khóa API.', 'success');
        } catch (error) {
            console.error('Failed to delete API key:', error);
            get().addNotification('Xóa khóa API thất bại.', 'error');
        }
    },
});
