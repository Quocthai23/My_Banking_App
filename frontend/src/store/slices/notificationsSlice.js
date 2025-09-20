import { produce } from 'immer';
// --- TỐI ƯU HÓA: Import các hàm API cụ thể thay vì toàn bộ instance `api` ---
// Điều này giúp code dễ đọc hơn và nhất quán với các slice khác.
import { getNotifications, markNotificationAsRead } from '../../api/api';

// Hàm helper để tính toán số thông báo chưa đọc
const calculateUnreadCount = (notifications) => {
    // Thêm kiểm tra để đảm bảo notifications luôn là một mảng, tránh lỗi
    if (!Array.isArray(notifications)) {
        return 0;
    }
    return notifications.filter(n => !n.isRead).length;
};

export const createNotificationsSlice = (set, get) => ({
    // Giữ nguyên cấu trúc state lồng nhau rất tốt của bạn
    notifications: {
        list: [],
        unreadCount: 0,
        loading: false,
    },

    fetchNotifications: async () => {
        set(produce((state) => { state.notifications.loading = true; }));
        try {
            // Sử dụng hàm `getNotifications` đã được định nghĩa trong api.js
            const response = await getNotifications();
            
            // Xử lý linh hoạt các kiểu phản hồi từ API để code an toàn hơn
            const notificationsArray = response.notifications || response || [];

            set(produce((state) => {
                state.notifications.list = notificationsArray;
                state.notifications.unreadCount = calculateUnreadCount(notificationsArray);
                state.notifications.loading = false; // Cập nhật loading khi thành công
            }));
        } catch (error) {
            console.error("Không thể tải thông báo:", error);
            // Cập nhật loading khi có lỗi
            set(produce((state) => { state.notifications.loading = false; }));
            // Gọi addNotification để hiển thị lỗi cho người dùng
            get().addNotification("Lỗi khi tải thông báo.", "error");
        }
    },

    markAsRead: async (notificationId) => {
        try {
            // --- SỬA LỖI QUAN TRỌNG: Sử dụng hàm `markNotificationAsRead` từ api.js ---
            // Hàm này gửi yêu cầu PATCH, đúng với yêu cầu của backend, thay vì POST.
            await markNotificationAsRead(notificationId);

            set(produce((state) => {
                const notification = state.notifications.list.find(n => n._id === notificationId);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    // Chỉ tính toán lại khi có sự thay đổi thực sự
                    state.notifications.unreadCount = calculateUnreadCount(state.notifications.list);
                }
            }));
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
            get().addNotification("Không thể cập nhật trạng thái thông báo.", "error");
        }
    },

    addNotification: (message, type = 'info') => {
        const newNotification = {
            _id: new Date().toISOString(), // Dùng ISOString để đảm bảo ID là duy nhất
            message,
            type,
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        set(produce((state) => {
            state.notifications.list.unshift(newNotification);
            state.notifications.unreadCount += 1; // Tăng trực tiếp thay vì tính toán lại toàn bộ
        }));
    },
});

