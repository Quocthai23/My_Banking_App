# Stage 1: Build - Cài đặt dependencies
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Sử dụng 'npm ci' để cài đặt chính xác các phiên bản từ package-lock.json
RUN npm install --only=production
COPY . .

# Stage 2: Production - Tạo image cuối cùng để chạy
FROM node:18-alpine
WORKDIR /app

# Sao chép dependencies đã được cài đặt từ stage 'builder'
COPY --from=builder /app/node_modules ./node_modules
# Sao chép toàn bộ mã nguồn ứng dụng đã được lọc bởi .dockerignore
COPY --from=builder /app .

# Tạo người dùng không phải là 'root' để tăng cường bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Mở cổng mà ứng dụng sẽ lắng nghe, khớp với biến PORT trong .env
EXPOSE 5052

# Lệnh để khởi động ứng dụng - Đã sửa đúng đường dẫn
CMD ["node", "src/main.js"]