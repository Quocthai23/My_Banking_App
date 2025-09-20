import { getProposals, createProposal as createProposalApi, castVote } from '../../api/api'; // Sửa lỗi: Import named

export const createGovernanceSlice = (set, get) => ({
    proposals: [],
    governanceLoading: false,

    fetchProposals: async () => {
        set({ governanceLoading: true });
        try {
            const fetchedProposals = await getProposals();
            set({ proposals: fetchedProposals, governanceLoading: false });
        } catch (error) {
            console.error("Lỗi khi tải danh sách đề xuất:", error);
            get().addNotification('Không thể tải danh sách đề xuất quản trị.', 'error');
            set({ governanceLoading: false });
        }
    },

    createProposal: async (proposalData) => {
        try {
            const newProposal = await createProposalApi(proposalData);
            set(state => ({ proposals: [...state.proposals, newProposal] }));
            get().addNotification('Tạo đề xuất thành công!', 'success');
        } catch (error) {
            console.error("Lỗi khi tạo đề xuất:", error);
            get().addNotification(error.response?.data?.message || 'Tạo đề xuất thất bại.', 'error');
        }
    },

    voteOnProposal: async (proposalId, support) => {
        try {
            await castVote(proposalId, { support });
            get().addNotification('Bỏ phiếu thành công!', 'success');
            get().fetchProposals();
        } catch (error) {
            console.error("Lỗi khi bỏ phiếu:", error);
            get().addNotification(error.response?.data?.message || 'Bỏ phiếu thất bại.', 'error');
        }
    },
});

