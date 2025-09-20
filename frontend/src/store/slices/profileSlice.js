// Lỗi "does not provide an export named 'default'" thường xảy ra do lỗi tham chiếu vòng tròn (circular dependency).
// Bằng cách di chuyển câu lệnh import vào bên trong các hàm (dynamic import), 
// chúng ta phá vỡ vòng lặp tại thời điểm tải module ban đầu.
// import api from '../../api/api'; // Xóa import tĩnh để phá vỡ vòng lặp

// Hàm trợ giúp để lấy api instance một cách linh động
const getApi = async () => (await import('../../api/api')).default;


export const createProfileSlice = (set, get) => ({
  // Trạng thái (state)
  isLoading: false,
  error: null,
  twoFAInfo: { qrCode: null, secret: null }, // Lưu trữ QR code và secret khi bật 2FA

  // Hành động (actions)
  updateProfile: async (profileData) => {
    const api = await getApi();
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/users/profile', profileData);
      // Sau khi cập nhật thành công, gọi refreshUser từ authSlice để làm mới dữ liệu user
      await get().refreshUser(); 
      get().addNotification('Cập nhật hồ sơ thành công!', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật hồ sơ thất bại.';
      set({ error: message });
      get().addNotification(message, 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (passwordData) => {
    const api = await getApi();
    set({ isLoading: true, error: null });
    try {
      await api.put('/users/profile/password', passwordData);
      get().addNotification('Cập nhật mật khẩu thành công!', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật mật khẩu thất bại.';
      set({ error: message });
      get().addNotification(message, 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    const api = await getApi();
    set({ isLoading: true, error: null });
    try {
      await api.delete('/users/profile');
      get().addNotification('Tài khoản đã được xóa.', 'success');
      // Sau khi xóa, gọi logout từ authSlice để dọn dẹp state và chuyển hướng người dùng
      get().logout(); 
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa tài khoản thất bại.';
      set({ error: message });
      get().addNotification(message, 'error');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // --- TÍNH NĂNG MỚI: Bật/tắt 2FA ---
  toggle2FA: async (enable) => {
    const api = await getApi();
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users/profile/2fa/toggle', { enable });
      
      // Sau khi thay đổi trạng thái 2FA, làm mới dữ liệu người dùng
      await get().refreshUser();
      get().addNotification(response.data.message, 'success');

      if (enable && response.data.qrCode) {
        // Nếu là BẬT 2FA, lưu trữ QR code để hiển thị cho người dùng
        set({ twoFAInfo: { qrCode: response.data.qrCode, secret: response.data.secret } });
      }
      return true; // Báo hiệu thành công
    } catch (error) {
      const message = error.response?.data?.message || 'Thao tác 2FA thất bại.';
      set({ error: message });
      get().addNotification(message, 'error');
      // Đảm bảo dữ liệu người dùng được làm mới ngay cả khi có lỗi để giao diện đồng bộ
      await get().refreshUser();
      return false; // Báo hiệu thất bại
    } finally {
      set({ isLoading: false });
    }
  },

  // Xóa thông tin QR code sau khi người dùng đã xem xong
  clear2FAInfo: () => {
    set({ twoFAInfo: { qrCode: null, secret: null } });
  }
});