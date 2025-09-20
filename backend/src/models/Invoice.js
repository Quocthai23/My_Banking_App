const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const InvoiceSchema = new mongoose.Schema({
  shortId: {
    type: String,
    default: () => nanoid(),
    unique: true,
    index: true,
  },
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // THÊM: ID của người nhận để dễ dàng truy vấn
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // THÊM: Email của người nhận để hiển thị
  recipientEmail: {
    type: String,
    required: true,
  },
  recipientAddress: {
    type: String,
    required: true,
  },
  amount: { 
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'cancelled'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
  },
  paymentTxHash: {
    type: String,
  },
  paidAt: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
