import { produce } from 'immer';
import { api, getAccessToken, removeAccessToken, loginUser, registerUser } from '../../api/api';

// --- TRẠNG THÁI KHỞI TẠO ---
const initialState = {
    auth: {
        user: null,
        isAuthenticated: false,
        authLoading: true, 
        error: null,
    }
};

export const createAuthSlice = (set, get) => ({
    ...initialState,

    // --- ACTION KIỂM TRA ĐĂNG NHẬP KHI TẢI ỨNG DỤNG ---
    checkAuth: async () => {
        const token = getAccessToken();
        if (!token) {
            set(produce(state => { state.auth.authLoading = false; state.auth.isAuthenticated = false; }));
            return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const response = await api.get('/users/profile');
            set(produce((state) => {
                state.auth.user = response.data;
                state.auth.isAuthenticated = true;
                state.auth.authLoading = false;
            }));
            // Bắt đầu tải dữ liệu sau khi xác thực thành công
            get().initAutoFetch(); 
        } catch (error) {
            console.error("Check auth failed:", error);
            removeAccessToken();
            set({ ...initialState, auth: { ...initialState.auth, authLoading: false } });
        }
    },

    // --- ACTION ĐĂNG NHẬP ---
    login: async (credentials) => {
        set(produce(state => { state.auth.authLoading = true; state.auth.error = null; }));
        try {
            const response = await loginUser(credentials);
            const { accessToken, user } = response.data;

            localStorage.setItem('accessToken', accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            set(produce(state => {
                state.auth.user = user;
                state.auth.isAuthenticated = true;
                state.auth.authLoading = false;
            }));
            
            get().addNotification('Đăng nhập thành công!', 'success');
            
            // Gọi hàm tải dữ liệu sau khi đăng nhập đã được xác nhận là thành công.
            get().initAutoFetch();

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại.';
            set(produce(state => {
                state.auth.error = errorMessage;
                state.auth.authLoading = false;
            }));
            get().addNotification(errorMessage, 'error');
            throw error;
        }
    },
    
    // --- ACTION ĐĂNG XUẤT (ĐÃ SỬA LỖI) ---
    logout: () => {
        removeAccessToken();
        delete api.defaults.headers.common['Authorization'];

        // SỬA LỖI: Sử dụng 'produce' để reset trạng thái 'auth' một cách an toàn.
        // Cách này đảm bảo chỉ có slice 'auth' bị thay đổi, các slice khác
        // (accounts, notifications, etc.) không bị ảnh hưởng.
        set(produce(state => {
            state.auth.user = null;
            state.auth.isAuthenticated = false;
            state.auth.authLoading = false;
            state.auth.error = null;
        }));

        get().addNotification('Bạn đã đăng xuất.', 'info');
        // Việc điều hướng sẽ do component Header xử lý, không cần dùng window.location.href ở đây.
    },

    // --- ACTION ĐĂNG KÝ ---
    register: async (userData) => {
        set(produce(state => { 
            state.auth.authLoading = true; 
            state.auth.error = null; 
        }));

        try {
            const response = await registerUser(userData);
            const { message } = response.data;

            set(produce(state => { 
                state.auth.authLoading = false; 
            }));
            
            get().addNotification(message || 'Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            
            return response.data;

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            
            set(produce(state => {
                state.auth.error = errorMessage;
                state.auth.authLoading = false;
            }));

            get().addNotification(errorMessage, 'error');
            throw error;
        }
    },
});
