import { api } from '../../api/api';

export const createSupportSlice = (set, get) => ({
    tickets: [],
    // Sử dụng một đối tượng để lưu trữ tin nhắn cho mỗi ticket nhằm tránh fetch lại
    ticketMessages: {}, 
    ticketsLoading: false,
    currentTicketLoading: null, // Để theo dõi trạng thái tải cho một ticket cụ thể

    fetchTickets: async () => {
        set({ ticketsLoading: true });
        try {
            const response = await api.get('/support-tickets');
            set({ tickets: response.data.tickets || [], ticketsLoading: false });
        } catch (error) {
            console.error('Failed to fetch support tickets:', error);
            get().addNotification('Không thể tải các yêu cầu hỗ trợ.', 'error');
            set({ ticketsLoading: false });
        }
    },

    createTicket: async (ticketData) => {
        set({ ticketsLoading: true });
        try {
            const response = await api.post('/support-tickets', ticketData);
            set((state) => ({
                tickets: [response.data, ...state.tickets],
            }));
            get().addNotification('Yêu cầu đã được gửi thành công!', 'success');
            set({ ticketsLoading: false });
            return true;
        } catch (error) {
            console.error('Failed to create ticket:', error);
            const errorMessage = error.response?.data?.error || 'Gửi yêu cầu thất bại!';
            get().addNotification(errorMessage, 'error');
            set({ ticketsLoading: false });
            return false;
        }
    },

    // Lấy tin nhắn cho một ticket
    fetchTicketMessages: async (ticketId) => {
        // Ngăn chặn việc fetch nếu đã có dữ liệu
        if (get().ticketMessages[ticketId]) return;

        set({ currentTicketLoading: ticketId });
        try {
            const response = await api.get(`/support-tickets/${ticketId}`);
            set((state) => ({
                ticketMessages: {
                    ...state.ticketMessages,
                    [ticketId]: response.data.messages || []
                },
                currentTicketLoading: null
            }));
        } catch (error) {
            console.error(`Failed to fetch messages for ticket ${ticketId}:`, error);
            get().addNotification('Không thể tải nội dung cuộc trò chuyện.', 'error');
            set({ currentTicketLoading: null });
        }
    },
    
    // Thêm tin nhắn mới vào ticket
    addMessageToTicket: async (ticketId, message) => {
        set({ currentTicketLoading: ticketId });
        try {
            const response = await api.post(`/support-tickets/${ticketId}/messages`, { message });
            // Thêm tin nhắn mới vào danh sách hiện tại để cập nhật giao diện ngay lập tức
            set(state => ({
                ticketMessages: {
                    ...state.ticketMessages,
                    [ticketId]: [...(state.ticketMessages[ticketId] || []), response.data]
                },
                currentTicketLoading: null
            }));
        } catch (error) {
            console.error(`Failed to add message to ticket ${ticketId}:`, error);
            get().addNotification('Gửi tin nhắn thất bại.', 'error');
            set({ currentTicketLoading: null });
        }
    }
});
