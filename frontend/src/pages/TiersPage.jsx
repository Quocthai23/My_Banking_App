import React, { useEffect } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Container, Typography, Paper, Grid,
    CircularProgress, LinearProgress, Tooltip
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// NÂNG CẤP: Thêm màu cho cấp Bronze
const tierColors = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#e5e4e2',
};

const TiersPage = () => {
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore ---
    const myTier = useStore((state) => state.myTier);
    const tiers = useStore((state) => state.tiers);
    const isLoading = useStore((state) => state.tiersLoading);
    const fetchTiersData = useStore((state) => state.fetchTiersData);

    // NÂNG CẤP: Tự động fetch dữ liệu khi component được mount
    useEffect(() => {
        if (fetchTiersData) {
            fetchTiersData();
        }
    }, [fetchTiersData]);
    
    if (isLoading || !myTier || !tiers) {
        return (
            <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }
    
    // NÂNG CẤP: Logic tính toán được đơn giản hóa nhờ dữ liệu từ backend
    const { nextTier } = myTier;
    const progress = nextTier && nextTier.minVolume > 0 
        ? Math.min((myTier.volume / nextTier.minVolume) * 100, 100) 
        : 100;

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
                    Cấp Bậc & Quyền Lợi
                </Typography>

                <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', mb: 5 }}>
                    <Typography variant="h6" color="#bdc3c7">Cấp bậc hiện tại của bạn</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: tierColors[myTier.tier] || 'white' }}>{myTier.tier}</Typography>
                    <Tooltip title={`Tổng khối lượng giao dịch của bạn là ${myTier.volume.toLocaleString()} ETH`}>
                        <Typography sx={{ my: 1, cursor: 'pointer' }}>Khối lượng giao dịch: ${myTier.volume.toLocaleString()}</Typography>
                    </Tooltip>
                    
                    {nextTier ? (
                        <>
                            <Typography color="#bdc3c7" sx={{ mt: 3 }}>Tiến trình lên cấp {nextTier.name}:</Typography>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, my: 1 }} />
                            <Typography variant="body2" color="#95a5a6" align="right">
                                {myTier.volume.toLocaleString()} / {nextTier.minVolume.toLocaleString()} ETH
                            </Typography>
                        </>
                    ) : (
                         <Typography color="gold" sx={{ mt: 3, fontWeight: 'bold' }}>Chúc mừng! Bạn đã đạt cấp bậc cao nhất.</Typography>
                    )}
                </Paper>

                <Grid container spacing={4}>
                    {Object.entries(tiers).map(([name, data]) => (
                        <Grid item xs={12} md={6} lg={3} key={name}>
                            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderTop: `5px solid ${tierColors[name]}`, height: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
                                <WorkspacePremiumIcon sx={{ fontSize: 50, color: tierColors[name] }} />
                                <Typography variant="h5" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>{name}</Typography>
                                <Typography color="#bdc3c7" sx={{ mb: 2 }}>Yêu cầu: ${data.minVolume.toLocaleString()} ETH</Typography>
                                <Box sx={{ textAlign: 'left', mt: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Quyền lợi:</Typography>
                                    <Typography variant="body2">- Giảm lãi vay: {data.benefits.loanInterestRateDiscount * 100}%</Typography>
                                    <Typography variant="body2">- Giảm phí GD: {data.benefits.transactionFeeDiscount * 100}%</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default TiersPage;
