import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { shallow } from 'zustand/shallow';
import { Box, CircularProgress } from '@mui/material';

// Selector này giờ sẽ đọc ĐÚNG cấu trúc state từ authSlice
const adminAuthSelector = (state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    authLoading: state.authLoading,
});

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, authLoading } = useStore(adminAuthSelector, shallow);

    // 1. Hiển thị trạng thái chờ trong khi `checkAuth` đang chạy
    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // 2. Nếu đã kiểm tra xong và là admin, cho phép truy cập
    if (isAuthenticated && user?.role === 'admin') {
        return children;
    }

    // 3. Trong mọi trường hợp khác, chuyển hướng về dashboard
    return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;