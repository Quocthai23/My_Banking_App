const User = require('../models/User');

// @desc    Lấy thông tin giới thiệu của người dùng hiện tại
// @route   GET /api/v1/referrals/me
// @access  Private
const getMyReferralInfo = async (req, res) => {
    try {
        // req.user được thêm vào từ middleware xác thực (protect)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Tìm những người dùng khác có trường `referredBy` khớp với ID của người dùng hiện tại
        const referrals = await User.find({ referredBy: user._id }).select('username joinedAt');

        // Logic tính toán thu nhập (có thể thay đổi tùy theo yêu cầu nghiệp vụ)
        // Ví dụ: Mỗi người được giới thiệu mang lại 10 đơn vị tiền tệ
        const earnings = referrals.length * 10; 

        res.status(200).json({
            referralCode: user.referralCode,
            referrals,
            earnings,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin giới thiệu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = {
    getMyReferralInfo,
};

