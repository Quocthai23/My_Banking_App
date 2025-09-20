const Proposal = require('../models/Proposal');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { logger } = require('../config');
const ethersService = require('./ethersService');

const createProposal = async (userId, { title, description, actions }) => {
  const user = await User.findById(userId);
  const minTokens = parseFloat(process.env.MIN_TOKEN_TO_PROPOSE || '1000');
  
  // Logic tạo đề xuất...
  
  const newProposal = new Proposal({
    proposerId: userId,
    title,
    description,
    actions,
    status: 'pending', // Trạng thái ban đầu
  });
  await newProposal.save();
  logger.info(`User ${userId} created a new governance proposal: "${title}"`);
  return newProposal;
};

const castVote = async (userId, proposalId, support) => {
    // Logic bỏ phiếu...
};

// THÊM HÀM CÒN THIẾU: enrichProposalsWithChainData
const enrichProposalsWithChainData = async (proposalsFromDb) => {
    if (!proposalsFromDb || proposalsFromDb.length === 0) {
        return [];
    }

    try {
        const governorContract = ethersService.getContract('MyGovernor');
        const enrichedProposals = [];

        for (const proposal of proposalsFromDb) {
            // Lấy trạng thái on-chain của đề xuất
            const onChainState = await governorContract.state(proposal.proposalIdOnChain); 
            
            // Chuyển đổi số trạng thái thành chuỗi dễ hiểu
            const stateMap = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
            const onChainStatus = stateMap[onChainState] || 'Unknown';

            enrichedProposals.push({
                ...proposal.toObject(), // Chuyển document Mongoose thành object thường
                onChainStatus,
            });
        }
        return enrichedProposals;

    } catch (error) {
        logger.error(`Error enriching proposals with blockchain data: ${error.message}`);
        // Nếu lỗi, trả về dữ liệu gốc từ DB để không làm sập ứng dụng
        return proposalsFromDb; 
    }
};

// SỬA LỖI: Đảm bảo tất cả các hàm cần thiết đều được export
module.exports = {
    createProposal,
    castVote,
    enrichProposalsWithChainData // Export hàm đã thêm
};
