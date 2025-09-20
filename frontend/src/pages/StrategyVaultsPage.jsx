import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
// shallow không còn cần thiết và nên được loại bỏ
// import { shallow } from 'zustand/shallow'; 
import {
    Container, Typography, Box, Grid, Paper, Button, CircularProgress,
    Dialog, DialogTitle, DialogContent, TextField, Chip, DialogActions
} from '@mui/material';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

// Component con: Thẻ thông tin Vault
const VaultCard = ({ vault, onDeposit }) => {
    const getRiskChipColor = (level) => {
        if (level === 'Low') return 'success';
        if (level === 'Medium') return 'warning';
        return 'error';
    };

    return (
        <Paper elevation={6} sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: 4, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.4)'} }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{fontWeight: 'bold'}}>{vault.name}</Typography>
            <Typography variant="body2" color="#bdc3c7" sx={{ flexGrow: 1, my: 2 }}>{vault.description}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                <Chip icon={<DonutLargeIcon />} label={vault.asset} color="primary" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}/>
                <Chip icon={<SecurityIcon />} label={`Rủi ro: ${vault.riskLevel}`} color={getRiskChipColor(vault.riskLevel)} />
            </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                <TrendingUpIcon sx={{ color: '#2ecc71' }} />
                <Typography variant="h5">APY: {vault.apy.toFixed(2)}%</Typography>
            </Box>
            <Button variant="contained" onClick={() => onDeposit(vault)} sx={{ mt: 'auto', fontWeight: 'bold' }}>
                Gửi tiền
            </Button>
        </Paper>
    );
};

// Component chính
const StrategyVaultsPage = () => {
    const [open, setOpen] = useState(false);
    const [selectedVault, setSelectedVault] = useState(null);
    const [amount, setAmount] = useState('');

    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const strategyVaults = useStore((state) => state.strategyVaults);
    const vaultsLoading = useStore((state) => state.vaultsLoading);
    const fetchStrategyVaults = useStore((state) => state.fetchStrategyVaults);
    const depositToVault = useStore((state) => state.depositToVault);

    useEffect(() => {
        if (fetchStrategyVaults) {
            fetchStrategyVaults();
        }
    }, [fetchStrategyVaults]);

    const handleOpenDeposit = (vault) => {
        setSelectedVault(vault);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedVault(null);
        setAmount('');
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (selectedVault && amount && depositToVault) {
            const success = await depositToVault(selectedVault._id, amount);
            if (success) {
                handleClose();
            }
        }
    };

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
                    Kho Đầu Tư Chiến Lược
                </Typography>

                {vaultsLoading && strategyVaults.length === 0 ? (
                    <Box sx={{ textAlign: 'center' }}><CircularProgress color="inherit" /></Box>
                ) : (
                    <Grid container spacing={4}>
                        {strategyVaults.map((vault) => (
                            <Grid item xs={12} md={6} lg={4} key={vault._id}>
                                <VaultCard vault={vault} onDeposit={handleOpenDeposit} />
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Gửi tiền vào {selectedVault?.name}</DialogTitle>
                    <Box component="form" onSubmit={handleDeposit}>
                        <DialogContent>
                            <TextField
                                autoFocus margin="normal" required fullWidth
                                label={`Số lượng ${selectedVault?.asset}`}
                                type="number" value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                variant="filled"
                                sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: '0 24px 16px' }}>
                            <Button onClick={handleClose} sx={{ color: 'white' }}>Hủy</Button>
                            <Button type="submit" variant="contained" disabled={vaultsLoading}>
                                {vaultsLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </Container>
        </Box>
    );
};

export default StrategyVaultsPage;
