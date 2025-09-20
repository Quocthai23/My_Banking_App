const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { web3, logger } = require('../config');
const notificationService = require('./notificationService');

// TẠO MỘT HÓA ĐƠN MỚI (ĐÃ SỬA LỖI LOGIC)
exports.createInvoice = async (userId, { recipient, amount, description, dueDate }) => {
  // Tìm người tạo
  const creator = await User.findById(userId);
  if (!creator) throw new Error('Creator user not found.');

  // Tìm người nhận bằng email
  const recipientUser = await User.findOne({ email: recipient });
  if (!recipientUser) {
    throw new Error('Recipient with that email does not exist.');
  }
  
  // Không cho phép tự tạo hóa đơn cho chính mình
  if (creator.email === recipientUser.email) {
      throw new Error('You cannot create an invoice for yourself.');
  }

  const newInvoice = new Invoice({
    creatorId: userId,
    recipientId: recipientUser._id, // Lưu ID người nhận
    recipientEmail: recipientUser.email, // Lưu email người nhận để hiển thị
    recipientAddress: recipientUser.walletAddress, // Lấy địa chỉ ví của người nhận
    amount,
    description,
    dueDate,
  });

  await newInvoice.save();
  logger.info(`User ${userId} created a new invoice ${newInvoice.shortId} for ${recipientUser.email} for ${amount} ETH.`);
  
  // Gửi thông báo cho người nhận
  await notificationService.createNotification(
    recipientUser._id,
    'general_alert',
    `You have received a new invoice #${newInvoice.shortId} for ${amount} ETH from ${creator.username}.`
  );

  return newInvoice;
};

// Lấy thông tin hóa đơn bằng ID ngắn
exports.getInvoiceByShortId = async (shortId) => {
  const invoice = await Invoice.findOne({ shortId }).populate('creatorId', 'username');
  if (!invoice) throw new Error('Invoice not found.');
  return invoice;
};

// Xác nhận một giao dịch thanh toán trên blockchain
exports.confirmPayment = async (shortId, txHash) => {
  const invoice = await Invoice.findOne({ shortId });
  if (!invoice) throw new Error('Invoice not found.');
  if (invoice.status !== 'pending') throw new Error(`Invoice is already in '${invoice.status}' status.`);

  try {
    const tx = await web3.eth.getTransaction(txHash);
    const txReceipt = await web3.eth.getTransactionReceipt(txHash);

    if (!tx || !txReceipt || !txReceipt.status) {
      throw new Error('Transaction is not yet confirmed or has failed.');
    }
    
    // Kiểm tra các điều kiện của giao dịch
    const sentAmount = parseFloat(web3.utils.fromWei(tx.value, 'ether'));
    const expectedAmount = invoice.amount;
    
    // Cho phép sai số nhỏ
    if (tx.to.toLowerCase() !== invoice.recipientAddress.toLowerCase() || Math.abs(sentAmount - expectedAmount) > 0.00001) {
      logger.warn(`Payment verification failed for invoice ${shortId}. Expected ${expectedAmount} to ${invoice.recipientAddress}, but got ${sentAmount} to ${tx.to}.`);
      throw new Error('Transaction details do not match the invoice.');
    }

    // Cập nhật trạng thái hóa đơn
    invoice.status = 'paid';
    invoice.paymentTxHash = txHash;
    invoice.paidAt = new Date();
    await invoice.save();
    
    logger.info(`Invoice ${shortId} successfully marked as paid. TxHash: ${txHash}`);

    // Gửi thông báo cho người tạo hóa đơn
    await notificationService.createNotification(
        invoice.creatorId,
        'general_alert',
        `Your invoice #${invoice.shortId} for ${invoice.amount} ETH has been paid.`
    );

    return invoice;

  } catch (error) {
    logger.error(`Error verifying transaction ${txHash} for invoice ${shortId}: ${error.message}`);
    throw error;
  }
};
