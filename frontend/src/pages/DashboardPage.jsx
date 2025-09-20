import React from 'react';
import useStore from '../store/useStore.js';
import { Container, Grid, Typography, Box, Paper, Button, CircularProgress } from '@mui/material';

// Import các component
import PortfolioSummary from '../components/PortfolioSummary.jsx';
import TokenHoldings from '../components/TokenHoldings.jsx';
import NftGallery from '../components/NftGallery.jsx';

function DashboardPage() {
    // Tách ra thành các hooks nhỏ để tránh vòng lặp render
    const user = useStore((state) => state.auth.user);
    const walletAddress = useStore((state) => state.wallet.address);
    const isWalletLinked = useStore((state) => state.wallet.isLinked);
    const portfolioLoading = useStore((state) => state.portfolio.loading);
    const linkWallet = useStore((state) => state.linkWallet); // Đổi tên để rõ ràng hơn

    // --- Giao diện khi chưa kết nối ví ---
    if (!walletAddress) {
        return (
            <Box sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
                background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)',
                color: 'white'
            }}>
                <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 4 }}>
                    <Typography variant="h4" gutterBottom>Chào mừng bạn!</Typography>
                    <Typography color="#bdc3c7">Vui lòng kết nối ví của bạn để xem Bảng điều khiển và quản lý tài sản.</Typography>
                </Paper>
            </Box>
        );
    }

    // --- Giao diện khi ví đã kết nối nhưng chưa được liên kết ---
    if (!isWalletLinked) {
        return (
            <Box sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
                background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)',
                color: 'white'
            }}>
                <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 4 }}>
                    <Typography variant="h5" gutterBottom>Liên kết địa chỉ ví</Typography>
                    <Typography color="#bdc3c7" sx={{ mb: 2 }}>
                        Ví của bạn đã được kết nối nhưng chưa được liên kết với tài khoản. Vui lòng lưu để đồng bộ dữ liệu.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => linkWallet && linkWallet(walletAddress)}
                    >
                        Lưu địa chỉ ví
                    </Button>
                </Paper>
            </Box>
        );
    }

    // --- Giao diện chính của Dashboard ---
    return (
        <Box sx={{
            background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)',
            color: 'white',
            py: 4,
            minHeight: 'calc(100vh - 64px)'
        }}>
            <Container maxWidth="xl">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Chào mừng trở lại, {user?.username || 'User'}!
                </Typography>

                {/* Hiển thị loading spinner */}
                {portfolioLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress color="inherit" />
                    </Box>
                )}

                {/* Chỉ hiển thị dữ liệu khi không loading và đã liên kết ví */}
                {/* SỬA LỖI: Cập nhật cú pháp MUI Grid v2 */}
                {!portfolioLoading && isWalletLinked && (
                    <Grid container spacing={3}>
                        <Grid xs={12}>
                            <PortfolioSummary />
                        </Grid>
                        <Grid xs={12}>
                            <TokenHoldings />
                        </Grid>
                        <Grid xs={12}>
                            <NftGallery />
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default DashboardPage;

