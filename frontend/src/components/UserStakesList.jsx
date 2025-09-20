import React from 'react';
import useStore from '../store/useStore.js';

// Material-UI Components
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Button, 
    CircularProgress, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper 
} from '@mui/material';
import CountdownTimer from './CountdownTimer.jsx';

function UserStakesList() {
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore ---
    // Mỗi hook chỉ theo dõi một phần của state, đây là cách làm hiệu quả nhất
    // để tránh re-render không cần thiết và các vòng lặp vô hạn.
    const myStakes = useStore((state) => state.staking?.stakes || []);
    const stakingVaults = useStore((state) => state.staking?.vaults || []);
    const stakingLoading = useStore((state) => state.staking?.loading || false);
    const stakingError = useStore((state) => state.staking?.error || null);
    const handleUnstake = useStore((state) => state.unstake);

    const getVaultDetails = (vaultId) => {
        return stakingVaults.find(v => v._id === vaultId);
    };

    const isUnstakeReady = (stake, vault) => {
        if (!stake || !vault || !vault.lockDurationInDays) return true;
        const stakedAt = new Date(stake.stakedAt).getTime();
        const unlockTime = stakedAt + vault.lockDurationInDays * 24 * 60 * 60 * 1000;
        return new Date().getTime() >= unlockTime;
    };

    const renderContent = () => {
        if (stakingLoading && myStakes.length === 0) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress color="inherit" /></Box>;
        }

        if (stakingError) {
            return <Typography sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>Lỗi: {stakingError}</Typography>;
        }

        if (myStakes.length === 0) {
            return <Typography sx={{ p: 3, textAlign: 'center', color: '#95a5a6' }}>Bạn chưa có vị thế staking nào.</Typography>;
        }

        return (
            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                <Table aria-label="user stakes list">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Bể Staking</TableCell>
                            <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Số Lượng</TableCell>
                            <TableCell align="center" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Thời Gian Khóa</TableCell>
                            <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Hành Động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {myStakes.map((stake) => {
                            const vault = getVaultDetails(stake.vault);
                            const canUnstake = isUnstakeReady(stake, vault);

                            return (
                                <TableRow key={stake._id}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                        {vault ? vault.name : 'Không rõ'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                        {Number(stake.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                        {vault && vault.lockDurationInDays > 0 ? (
                                           <CountdownTimer 
                                                startTime={stake.stakedAt} 
                                                lockDurationInDays={vault.lockDurationInDays}
                                           />
                                        ) : (
                                            <Typography variant="body2" color="#2ecc71">Linh hoạt</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleUnstake(stake._id, stake.amount)}
                                            disabled={stakingLoading || !canUnstake}
                                            size="small"
                                        >
                                            Unstake
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <Card elevation={4} sx={{ background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4, mt: 4 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Các Gói Stake Của Bạn
                </Typography>
                {renderContent()}
            </CardContent>
        </Card>
    );
}

export default UserStakesList;