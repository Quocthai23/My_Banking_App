import { api } from '../../api/api';

export const createSettingsSlice = (set, get) => ({
    settingsLoading: false,

    updateProfile: async (profileData) => {
        set({ settingsLoading: true });
        try {
            const response = await api.put('/users/profile', profileData);
            get().addNotification('Cập nhật hồ sơ thành công!', 'success');
            // Cập nhật lại thông tin user trong authSlice
            get().refreshUser(); 
            return true;
        } catch (error) {
            console.error('Failed to update profile:', error);
            const errorMessage = error.response?.data?.error || 'Cập nhật hồ sơ thất bại.';
            get().addNotification(errorMessage, 'error');
            return false;
        } finally {
            set({ settingsLoading: false });
        }
    },

    changePassword: async (passwordData) => {
        set({ settingsLoading: true });
        try {
            await api.post('/users/change-password', passwordData);
            get().addNotification('Đổi mật khẩu thành công!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to change password:', error);
            const errorMessage = error.response?.data?.error || 'Đổi mật khẩu thất bại.';
            get().addNotification(errorMessage, 'error');
            return false;
        } finally {
            set({ settingsLoading: false });
        }
    },

    deleteAccount: async () => {
        set({ settingsLoading: true });
        try {
            await api.delete('/users/delete-account');
            get().addNotification('Tài khoản đã được xóa.', 'success');
            // Đăng xuất người dùng sau khi xóa tài khoản
            get().logout();
            return true;
        } catch (error) {
            console.error('Failed to delete account:', error);
            const errorMessage = error.response?.data?.error || 'Xóa tài khoản thất bại.';
            get().addNotification(errorMessage, 'error');
            return false;
        } finally {
            set({ settingsLoading: false });
        }
    },
});
