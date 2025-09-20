const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  // THAY ĐỔI 1: Đổi tên 'userId' thành 'user' để nhất quán
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  // THAY ĐỔI 2: Mở rộng các loại tài khoản được phép
  accountType: {
    type: String,
    // Thêm 'investment' và 'VND' để hỗ trợ nhiều loại hơn và sửa lỗi
    enum: ['checking', 'savings', 'investment', 'VND'], 
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  // THAY ĐỔI 3: Thêm trường 'currency'
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  // THAY ĐỔI 4: Thay thế 'status' bằng 'isActive' (Boolean)
  isActive: {
    type: Boolean,
    default: true,
  },
// THAY ĐỔI 5: Sử dụng timestamps của Mongoose
}, { timestamps: true }); 

// THAY ĐỔI 6: Thêm chỉ mục để đảm bảo dữ liệu nhất quán
// Ngăn một người dùng tạo nhiều tài khoản có cùng accountType và currency
accountSchema.index({ user: 1, accountType: 1, currency: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;