const governanceService = require('../services/governanceService');
const Proposal = require('../models/Proposal');

exports.createProposal = async (req, res, next) => {
    const { description } = req.body;
    const proposerAddress = req.user.address;

    if (!description || description.trim() === '') {
        return res.status(400).json({ message: 'Mô tả đề xuất không được để trống.' });
    }
    if (!proposerAddress) {
        return res.status(400).json({ message: 'Tài khoản của bạn chưa được liên kết với địa chỉ ví blockchain.' });
    }

    try {
        const newProposal = await governanceService.createProposal(description, proposerAddress);
        res.status(201).json(newProposal);
    } catch (error) {
        console.error("Lỗi chi tiết khi tạo đề xuất:", error);
        if (error.message.includes("proposer votes below proposal threshold")) {
            return res.status(400).json({ message: "Không đủ quyền biểu quyết để tạo đề xuất." });
        }
        next(error);
    }
};

exports.getProposals = async (req, res, next) => {
    try {
        // Bước 1: Luôn lấy dữ liệu từ cơ sở dữ liệu trước
        const proposalsFromDB = await Proposal.find({}).sort({ createdAt: -1 });
        
        let proposals;
        try {
            // Bước 2: Cố gắng làm giàu dữ liệu từ blockchain
            proposals = await governanceService.enrichProposalsWithChainData(proposalsFromDB);
        } catch (chainError) {
            // [FIX] Nếu có lỗi khi kết nối blockchain, không gây crash server
            console.error("Lỗi khi làm giàu dữ liệu từ blockchain:", chainError.message);
            // Trả về dữ liệu từ DB với trạng thái "Không xác định"
            proposals = proposalsFromDB.map(p => ({
                ...p.toObject(),
                status: 'Unknown',
                forVotes: 0,
                againstVotes: 0,
                endDate: new Date(),
            }));
        }
        
        res.status(200).json({ proposals }); // Trả về object chứa mảng
    } catch (dbError) {
        // Bắt lỗi nếu không thể truy vấn cơ sở dữ liệu
        console.error("Lỗi khi truy vấn đề xuất từ DB:", dbError);
        next(dbError);
    }
};

exports.castVote = async (req, res, next) => {
    const { proposalId } = req.params;
    const { support } = req.body;
    const voterAddress = req.user.address;

    if (support === undefined || (support !== 0 && support !== 1)) {
        return res.status(400).json({ message: 'Lựa chọn bỏ phiếu không hợp lệ.' });
    }
    if (!voterAddress) {
        return res.status(400).json({ message: 'Tài khoản của bạn chưa được liên kết với địa chỉ ví blockchain.' });
    }

    try {
        const result = await governanceService.castVote(proposalId, voterAddress, support);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi chi tiết khi bỏ phiếu:", error);
        if (error.message.includes("voter has already voted")) {
            return res.status(400).json({ message: "Bạn đã bỏ phiếu cho đề xuất này rồi." });
        }
        if (error.message.includes("Voting period has ended")) {
             return res.status(400).json({ message: "Đã hết thời gian bỏ phiếu." });
        }
        next(error);
    }
};

