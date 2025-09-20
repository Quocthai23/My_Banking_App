import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
// SỬA LỖI: Không cần shallow nữa vì chúng ta đang chọn các giá trị riêng lẻ
// import { shallow } from 'zustand/shallow'; 
import { Box, CircularProgress } from '@mui/material';

// SỬA LỖI: Bỏ selector object không cần thiết
// const authSelector = (state) => ({
//  isAuthenticated: state.auth.isAuthenticated,
//  authLoading: state.auth.authLoading
// });

const ProtectedRoute = ({ children }) => {
    // --- SỬA LỖI: Chọn từng giá trị state riêng lẻ để tránh vòng lặp render vô hạn ---
    const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
    const authLoading = useStore((state) => state.auth.authLoading);
    const location = useLocation();

    // 1. Hiển thị trạng thái chờ trong khi `checkAuth` đang chạy
    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    // 2. Nếu đã kiểm tra xong và không đăng nhập, chuyển hướng
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Nếu đã đăng nhập, hiển thị trang
    return children;
};

export default ProtectedRoute;
