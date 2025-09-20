import React, { useEffect } from 'react';
import useStore from '../store/useStore.js';
// shallow không còn cần thiết và nên được loại bỏ
// import { shallow } from 'zustand/shallow'; 
import {
    Box, Container, Typography, Paper, Grid,
    CircularProgress, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Component con: Thẻ thống kê
const StatCard = ({ icon, title, value }) => (
    <Paper elevation={6} sx={{ p: 3, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', height: '100%' }}>
        <Box sx={{ color: '#3498db', fontSize: '2.5rem' }}>{icon}</Box>
        <Typography color="#bdc3c7" sx={{ mt: 1 }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
    </Paper>
);

// Component chính
const ReferralPage = () => {
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const referralInfo = useStore((state) => state.referralInfo);
    const referralLoading = useStore((state) => state.referralLoading);
    const fetchReferralInfo = useStore((state) => state.fetchReferralInfo);
    const addNotification = useStore((state) => state.addNotification);

    useEffect(() => {
        if (fetchReferralInfo) {
            fetchReferralInfo();
        }
    }, [fetchReferralInfo]);

    const handleCopy = () => {
        if (referralInfo?.referralCode) {
            const referralLink = `${window.location.origin}/register?ref=${referralInfo.referralCode}`;
            navigator.clipboard.writeText(referralLink);
            if (addNotification) {
                // Giả sử addNotification tồn tại và là một hàm trong store của bạn
                addNotification('Đã sao chép liên kết giới thiệu!', 'success');
            }
        }
    };

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
                    Chương Trình Giới Thiệu
                </Typography>

                {referralLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="inherit" size={50} /></Box> :
                    <Grid container spacing={4}>
                        {/* Mã giới thiệu */}
                        <Grid item xs={12}>
                            <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                                <Typography color="#bdc3c7">Chia sẻ liên kết giới thiệu của bạn</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 2 }}>
                                    <Typography variant="h5" component="code" sx={{ fontWeight: 'bold', letterSpacing: '1px', wordBreak: 'break-all', p: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                                        {`${window.location.origin}/register?ref=${referralInfo?.referralCode || '...'}`}
                                    </Typography>
                                    <Tooltip title="Sao chép liên kết">
                                        <IconButton onClick={handleCopy} sx={{ color: '#3498db' }} disabled={!referralInfo?.referralCode}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Thống kê */}
                        <Grid item xs={12} md={6}>
                            <StatCard icon={<GroupAddIcon fontSize="inherit" />} title="Số người đã giới thiệu" value={referralInfo?.referrals?.length || 0} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StatCard icon={<MonetizationOnIcon fontSize="inherit" />} title="Tổng thưởng (Tokens)" value={`${(referralInfo?.earnings || 0).toLocaleString()}`} />
                        </Grid>

                        {/* Danh sách người được giới thiệu */}
                        <Grid item xs={12}>
                             <Paper elevation={6} sx={{ borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)'}}>
                                 <Box sx={{ p: 3}}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Lịch sử giới thiệu</Typography>
                                 </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Người dùng</TableCell>
                                                <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }} align="right">Ngày tham gia</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {referralInfo?.referrals && referralInfo.referrals.length > 0 ? (
                                                referralInfo.referrals.map(ref => (
                                                    <TableRow key={ref._id}>
                                                        <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{ref.username}</TableCell>
                                                        <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }} align="right">{new Date(ref.createdAt).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} sx={{ color: 'white', textAlign: 'center', border: 0, py: 5 }}>Chưa có ai được giới thiệu.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                }
            </Container>
        </Box>
    );
};

export default ReferralPage;
