import React from 'react';
import StakingActions from './StakingActions';

// Material-UI Components
import { Card, CardContent, Typography, Box, Grid, Divider } from '@mui/material';

// Icons for better UI
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockClockIcon from '@mui/icons-material/LockClock';

const StakingInfoCard = ({ vault }) => {
    // Nếu không có thông tin vault, không render component
    if (!vault) {
        return null;
    }

    const InfoItem = ({ icon, label, value }) => (
        <Grid item xs={4} textAlign="center">
            <Box sx={{ color: '#1abc9c', mb: 1 }}>
                {icon}
            </Box>
            <Typography variant="caption" display="block" sx={{ color: '#95a5a6', textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                {value}
            </Typography>
        </Grid>
    );

    return (
        <Card elevation={4} sx={{ background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {vault.name || 'Staking Vault'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#bdc3c7', mb: 2, flexGrow: 1 }}>
                    {vault.description || 'Gửi token của bạn để nhận phần thưởng.'}
                </Typography>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

                <Grid container spacing={2} sx={{ my: 1 }}>
                    <InfoItem 
                        icon={<ShowChartIcon />}
                        label="Lãi suất (APY)"
                        value={`${vault.apy || 0}%`}
                    />
                    <InfoItem 
                        icon={<AccountBalanceWalletIcon />}
                        label="Tổng tài sản"
                        value={`${Number(vault.totalStaked || 0).toLocaleString()}`}
                    />
                    <InfoItem 
                        icon={<LockClockIcon />}
                        label="Thời gian khóa"
                        value={`${vault.lockupPeriod || 0} ngày`}
                    />
                </Grid>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

                <StakingActions vault={vault} />
            </CardContent>
        </Card>
    );
};

export default StakingInfoCard;

