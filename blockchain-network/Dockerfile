FROM node:18-alpine

# Thiết lập thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Sao chép file package và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn của service hardhat
COPY . .

# Mở port 8545 để node blockchain có thể được truy cập
EXPOSE 8545

# Lệnh để khởi động node Hardhat
# Tham số --hostname 0.0.0.0 rất quan trọng để các container khác có thể kết nối
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
