import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Container, Typography, Button, Grid, Card, CardContent,
    CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton, Chip, Skeleton
} from '@mui/material';
import AddCardIcon from '@mui/icons-material/AddCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// --- NÂNG CẤP UI: Component Skeleton cho thẻ tài khoản ---
const AccountCardSkeleton = () => (
    <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ background: 'linear-gradient(145deg, #34495e, #2c3e50)', borderRadius: 4, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton variant="text" width="40%" sx={{ fontSize: '1.2rem', bgcolor: 'grey.700' }} />
                <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'grey.700' }} />
            </Box>
            <Skeleton variant="text" width="60%" sx={{ fontSize: '0.9rem', bgcolor: 'grey.700' }} />
            <Skeleton variant="text" width="80%" sx={{ fontSize: '2rem', mt: 3, bgcolor: 'grey.800' }} />
        </Card>
    </Grid>
);


// --- NÂNG CẤP UI: Component thẻ tài khoản được thiết kế lại ---
const AccountCard = ({ account, onOpenCloseModal }) => (
    <Card sx={{
        background: 'linear-gradient(145deg, #34495e, #2c3e50)',
        color: 'white',
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': { transform: 'translateY(-5px)' }
    }}>
        <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{account.accountType}</Typography>
                    <Typography variant="body2" sx={{ color: '#bdc3c7', fontFamily: 'monospace' }}>
                        {account.accountNumber}
                    </Typography>
                </Box>
                <Chip label={account.currency} color="info" size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }} />
            </Box>
            <Typography variant="h4" sx={{ mt: 3, fontWeight: 'bold' }}>
                ${(account.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#95a5a6' }}>Số dư hiện tại</Typography>
        </CardContent>
        <DialogActions sx={{ justifyContent: 'flex-end', p: '8px 16px' }}>
           <IconButton size="small" onClick={() => onOpenCloseModal(account)} sx={{ color: '#e74c3c', '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' } }}>
               <DeleteForeverIcon />
           </IconButton>
        </DialogActions>
    </Card>
);

// Component modal để tạo tài khoản
const CreateAccountModal = ({ isOpen, onClose, onAddAccount }) => {
    const [accountType, setAccountType] = useState('savings');
    const [currency, setCurrency] = useState('VND');
    const accountsLoading = useStore(state => state.accounts.loading);

    const handleCreate = async () => {
        const success = await onAddAccount({ accountType, currency });
        if (success) onClose();
    }

    return (
        <Dialog open={isOpen} onClose={onClose} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Tài Khoản Mới</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: '#bdc3c7' }}>Loại Tài Khoản</InputLabel>
                    <Select value={accountType} label="Loại Tài Khoản" onChange={(e) => setAccountType(e.target.value)}
                        sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' }, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                    >
                        <MenuItem value="savings">Tiết kiệm</MenuItem>
                        <MenuItem value="checking">Thanh toán</MenuItem>
                        <MenuItem value="investment">Đầu tư</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ color: '#bdc3c7' }}>Loại Tiền Tệ</InputLabel>
                    <Select value={currency} label="Loại Tiền Tệ" onChange={(e) => setCurrency(e.target.value)}
                        sx={{ color: 'white', '& .MuiSvgIcon-root': { color: 'white' }, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                    >
                        <MenuItem value="VND">VND</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={onClose} sx={{ color: 'white' }}>Hủy</Button>
                <Button onClick={handleCreate} variant="contained" disabled={accountsLoading}>
                    {accountsLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Component chính
function AccountsPage() {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [accountToClose, setAccountToClose] = useState(null);

    // --- SỬA LỖI VÒNG LẶP: Tách các hook useStore ---
    const accountsData = useStore((state) => state.accounts.data);
    const accountsLoading = useStore((state) => state.accounts.loading);
    const fetchAccounts = useStore((state) => state.fetchAccounts);
    const addAccount = useStore((state) => state.createAccount);
    const removeAccount = useStore((state) => state.closeAccount);

    useEffect(() => {
        if (fetchAccounts) {
            fetchAccounts();
        }
    }, [fetchAccounts]);
 
    const handleConfirmClose = async () => {
        if(accountToClose && removeAccount) {
            await removeAccount(accountToClose._id);
            setAccountToClose(null);
        }
    }

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Tài khoản của tôi</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCardIcon />}
                        onClick={() => setCreateModalOpen(true)}
                        sx={{ fontWeight: 'bold', borderRadius: '20px', px: 3 }}
                    >
                        Tạo tài khoản mới
                    </Button>
                </Box>

                {accountsLoading && (!accountsData || accountsData.length === 0) ? (
                     <Grid container spacing={4}>
                        {[...Array(3)].map((_, i) => <AccountCardSkeleton key={i} />)}
                    </Grid>
                ) : accountsData && accountsData.length > 0 ? (
                    <Grid container spacing={4}>
                        {accountsData.map(account => (
                            <Grid item key={account._id} xs={12} sm={6} md={4}>
                                <AccountCard account={account} onOpenCloseModal={setAccountToClose} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
                        <AccountBalanceIcon sx={{ fontSize: 60, color: 'grey.700' }} />
                        <Typography variant="h6" sx={{ mt: 2 }}>Bạn chưa có tài khoản nào.</Typography>
                        <Typography color="#bdc3c7">Hãy bắt đầu bằng cách tạo một tài khoản mới.</Typography>
                    </Box>
                )}
            </Container>
            
            <CreateAccountModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onAddAccount={addAccount} />
            
            <Dialog open={!!accountToClose} onClose={() => setAccountToClose(null)} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận đóng tài khoản</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn đóng tài khoản {accountToClose?.accountNumber}? Hành động này không thể hoàn tác.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 16px' }}>
                    <Button onClick={() => setAccountToClose(null)} sx={{ color: 'white' }}>Hủy</Button>
                    <Button onClick={handleConfirmClose} variant="contained" color="error" disabled={accountsLoading}>
                        {accountsLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AccountsPage;
