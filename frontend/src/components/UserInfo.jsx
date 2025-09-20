import React, { useEffect } from 'react';
import useStore from '../store/useStore.js';
import { shallow } from 'zustand/shallow';
import CountdownTimer from './CountdownTimer';

// Material-UI Components
import { Card, CardContent, Typography, Box, Divider, Skeleton } from '@mui/material';

// Icons for a richer UI
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Component con cho trạng thái đang tải
const UserInfoSkeleton = () => (
    <Card elevation={4} sx={{ background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
        <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', bgcolor: 'grey.700' }} width="60%" />
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', bgcolor: 'grey.800' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', bgcolor: 'grey.800' }} width="80%" />
        </CardContent>
    </Card>
);

// Component con để hiển thị dữ liệu người dùng
const UserInfoDisplay = ({ portfolioData }) => {
    const totalStaked = portfolioData?.stakingSummary?.totalStaked || 0;
    const totalRewards = portfolioData?.stakingSummary?.totalRewards || 0;
    const activeStakeDetails = portfolioData?.stakingSummary?.activeStakeDetails;

    return (
        <Card elevation={4} sx={{ height: '100%', background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Tổng quan Staking
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MonetizationOnIcon sx={{ color: '#1abc9c', mr: 1.5 }}/>
                            <Typography variant="body1" color="#bdc3c7">Tổng số đã Stake:</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {totalStaked.toLocaleString()} GVT
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.5 }}>
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmojiEventsIcon sx={{ color: '#f1c40f', mr: 1.5 }}/>
                            <Typography variant="body1" color="#bdc3c7">Phần thưởng kiếm được:</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {parseFloat(totalRewards).toFixed(6)} GVT
                        </Typography>
                    </Box>
                    {activeStakeDetails && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                            <CountdownTimer 
                                startTime={activeStakeDetails.startTime} 
                                lockDurationInDays={activeStakeDetails.lockDurationInDays}
                            />
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

// Component chính
function UserInfo() {
    // Sửa lỗi: Thêm shallow để so sánh nông, tránh re-render không cần thiết
    const { portfolioData, portfolioLoading, fetchPortfolio } = useStore((state) => ({
        portfolioData: state.portfolioData,
        portfolioLoading: state.portfolioLoading,
        fetchPortfolio: state.fetchPortfolio,
    }), shallow);

    // Tự động tải dữ liệu portfolio khi component được gắn vào
    useEffect(() => {
        if (fetchPortfolio) {
            fetchPortfolio();
        }
    }, [fetchPortfolio]);

    // Trạng thái chờ trong khi dữ liệu đang được tải
    if (portfolioLoading || !portfolioData) {
        return <UserInfoSkeleton />;
    }
    
    return <UserInfoDisplay portfolioData={portfolioData} />;
}

export default UserInfo;