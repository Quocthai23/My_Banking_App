import React from 'react';
import useStore from '../store/useStore';
import { Card, CardContent, Typography, Grid, Box, Skeleton } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SavingsIcon from '@mui/icons-material/Savings';
import { keyframes } from '@emotion/react';

// Animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StatCard = ({ title, value, icon, loading, delay }) => (
    <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.08)', 
        backdropFilter: 'blur(12px)', 
        color: 'white', 
        height: '100%',
        animation: `${fadeInUp} 0.5s ease-out ${delay * 0.1}s forwards`,
        opacity: 0,
    }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {loading ? <Skeleton variant="text" width="80%" /> : value}
            </Typography>
        </CardContent>
    </Card>
);


function PortfolioSummary() {
    // --- SỬA LỖI: Tách ra thành các hooks nhỏ để tránh vòng lặp render ---
    const portfolioData = useStore((state) => state.portfolio.data);
    const loading = useStore((state) => state.portfolio.loading);
    
    // Sử dụng optional chaining và giá trị mặc định để an toàn hơn
    const portfolio = portfolioData || {};

    const stats = [
        { title: 'Tổng giá trị tài sản', value: `$${portfolio.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, icon: <AccountBalanceWalletIcon />, delay: 1 },
        { title: 'Tổng lợi nhuận', value: `$${portfolio.totalProfit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, icon: <MonetizationOnIcon />, delay: 2 },
        { title: 'Tổng tiền gửi', value: `$${portfolio.totalDeposits?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, icon: <SavingsIcon />, delay: 3 },
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tổng quan Portfolio
            </Typography>
            {/* SỬA LỖI: Cập nhật cú pháp MUI Grid v2 */}
            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid key={index} xs={12} sm={4}>
                        <StatCard 
                            title={stat.title} 
                            value={stat.value} 
                            icon={stat.icon} 
                            loading={loading}
                            delay={stat.delay}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default PortfolioSummary;