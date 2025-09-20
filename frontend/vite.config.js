import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- SỬA LỖI: Cập nhật cổng proxy để khớp với backend ---
  server: {
    proxy: {
      // Bất kỳ request nào có đường dẫn bắt đầu bằng '/api' 
      // sẽ được chuyển tiếp đến server backend.
      '/api': {
        // Địa chỉ của server backend của bạn.
        // Đã cập nhật thành cổng 5052.
        target: 'http://localhost:5052', 
        
        // Cần thiết để backend nhận request từ một origin khác.
        changeOrigin: true, 
        
        // Không yêu cầu chứng chỉ SSL trong môi trường dev.
        secure: false,      
      },
    },
  },
})