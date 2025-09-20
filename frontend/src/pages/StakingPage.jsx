import React, { useEffect } from 'react';
import useStore from '../store/useStore.js';
import StakingInfoCard from '../components/StakingInfoCard';
import UserStakesList from '../components/UserStakesList';
import WalletConnector from '../components/WalletConnector';

// Material-UI Components
import { Box, Container, Typography, Grid, CircularProgress, Paper } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const StakingPage = () => {
    // --- SỬA LỖI: Lấy cả object staking và sử dụng optional chaining để tránh lỗi ---
    const walletAddress = useStore((state) => state.wallet?.address);
    const stakingState = useStore((state) => state.staking);
    const fetchStakingData = useStore((state) => state.fetchStakingData);

    // Cung cấp giá trị mặc định để tránh lỗi khi state chưa được khởi tạo
    const stakingVaults = stakingState?.vaults || [];
    const stakingLoading = stakingState?.loading || false;

    // Tự động tải dữ liệu staking khi địa chỉ ví có sẵn
    useEffect(() => {
        if (walletAddress && fetchStakingData) {
            fetchStakingData();
        }
    }, [walletAddress, fetchStakingData]);

    // Giao diện khi chưa kết nối ví
    if (!walletAddress) {
        return (
            <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="sm">
                    <Paper elevation={6} sx={{ p: 5, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 60, color: '#3498db', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Kết nối ví của bạn</Typography>
                        <Typography color="#bdc3c7" sx={{ mb: 4 }}>
                            Vui lòng kết nối ví Web3 của bạn để bắt đầu tham gia staking và xem các vị thế của bạn.
                        </Typography>
                        <WalletConnector />
                    </Paper>
                </Container>
            </Box>
        );
    }

    // Giao diện chính sau khi đã kết nối ví
    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
                    Staking & Nhận Thưởng
                </Typography>

                {/* Phần hiển thị các bể Staking */}
                <Box mb={5}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Các Bể Staking</Typography>
                    {stakingLoading && stakingVaults.length === 0 ? (
                        <Box sx={{ textAlign: 'center' }}><CircularProgress color="inherit" /></Box>
                    ) : (
                        <Grid container spacing={4}>
                            {stakingVaults.map(vault => (
                                <Grid item xs={12} md={6} lg={4} key={vault._id}>
                                    <StakingInfoCard vault={vault} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Phần hiển thị các gói stake của người dùng */}
                <UserStakesList />
            </Container>
        </Box>
    );
};

export default StakingPage;
