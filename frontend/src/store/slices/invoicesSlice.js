import { api } from '../../api/api';

export const createInvoicesSlice = (set, get) => ({
    invoices: [],
    invoicesLoading: false,

    // NÂNG CẤP: Xử lý dữ liệu và lỗi tốt hơn
    fetchInvoices: async () => {
        set({ invoicesLoading: true });
        try {
            const response = await api.get('/invoices');
            // SỬA LỖI: Backend trả về { invoices: [...] }
            set({ invoices: response.data.invoices || [], invoicesLoading: false });
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            const { addNotification } = get();
            addNotification('Không thể tải danh sách hóa đơn.', 'error');
            set({ invoicesLoading: false });
        }
    },

    // NÂNG CẤP: Xử lý trạng thái loading và thông báo lỗi
    createInvoice: async (invoiceData) => {
        set({ invoicesLoading: true }); // Bắt đầu loading khi gọi hàm
        try {
            const response = await api.post('/invoices', invoiceData);
            set((state) => ({
                invoices: [response.data, ...state.invoices], // Thêm hóa đơn mới vào đầu danh sách
            }));
            const { addNotification } = get();
            addNotification('Tạo hóa đơn thành công!', 'success');
            set({ invoicesLoading: false }); // Kết thúc loading
            return true; // Báo hiệu thành công
        } catch (error) {
            console.error('Failed to create invoice:', error);
            const { addNotification } = get();
            const errorMessage = error.response?.data?.error || 'Tạo hóa đơn thất bại!';
            addNotification(errorMessage, 'error');
            set({ invoicesLoading: false }); // Kết thúc loading
            return false; // Báo hiệu thất bại
        }
    },
});
