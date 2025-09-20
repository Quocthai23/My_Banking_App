import { useRef } from 'react';
// --- SỬA LỖI: Chuyển từ "named import" sang "default import" để khớp với useStore.js ---
import useStore from '../store/useStore';

/**
 * Component này không render ra bất cứ thứ gì.
 * Nhiệm vụ duy nhất của nó là gọi các action khởi tạo store một lần duy nhất
 * khi ứng dụng được tải.
 *
 * PHIÊN BẢN TỐI ƯU:
 * - Sử dụng `useRef` để đảm bảo logic chỉ chạy một lần.
 * - Sử dụng `useStore.getState()` để lấy các action mà không cần "đăng ký" (subscribe)
 * component vào store. Điều này ngăn component render lại một cách không cần thiết.
 */
const StoreInitializer = () => {
  const initialized = useRef(false);

  // Logic này sẽ chỉ chạy trong lần render đầu tiên của component
  if (!initialized.current) {
    initialized.current = true;
    
    // Lấy các action trực tiếp từ store mà không gây re-render
    const { checkAuth, initAutoFetch } = useStore.getState();
    
    // 1. Kiểm tra trạng thái đăng nhập từ token
    if (checkAuth) checkAuth();
    
    // 2. Bắt đầu quá trình tự động lấy dữ liệu
    if (initAutoFetch) initAutoFetch();
  }

  return null; // Component này không render ra UI
};

export default StoreInitializer;