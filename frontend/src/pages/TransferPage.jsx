import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Container, Typography, Paper, TextField, Button,
    CircularProgress, InputAdornment, MenuItem, Grid // SỬA LỖI: Thêm 'Grid' vào import
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const TransferPage = () => {
    // State của form
    const [sourceAccountId, setSourceAccountId] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    // --- NÂNG CẤP: Lấy state và actions từ các slice tương ứng ---
    const accounts = useStore((state) => state.accounts.data);
    const fetchAccounts = useStore((state) => state.fetchAccounts);
    const transferLoading = useStore((state) => state.transactions.loading);
    const transferAction = useStore((state) => state.transferFunds);

    // Tải danh sách tài khoản khi component được mount
    useEffect(() => {
        if (!accounts || accounts.length === 0) {
            fetchAccounts();
        }
    }, [accounts, fetchAccounts]);
    
    // Tự động chọn tài khoản đầu tiên làm tài khoản nguồn
    useEffect(() => {
        if (accounts && accounts.length > 0 && !sourceAccountId) {
            setSourceAccountId(accounts[0]._id);
        }
    }, [accounts, sourceAccountId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (transferAction) {
            const success = await transferAction({
                sourceAccountId,
                recipientEmail,
                amount: parseFloat(amount),
                currency: accounts.find(acc => acc._id === sourceAccountId)?.currency || '',
                description
            });
            // Nếu thành công, xóa trắng form
            if (success) {
                setRecipientEmail('');
                setAmount('');
                setDescription('');
            }
        }
    };

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', py: 5, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
            <Container maxWidth="sm">
                <Paper elevation={12} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)' }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <SendIcon sx={{ fontSize: 40, color: '#3498db' }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mt: 1 }}>
                            Chuyển Tiền
                        </Typography>
                        <Typography color="#bdc3c7">Thực hiện giao dịch nhanh chóng và an toàn.</Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        {/* NÂNG CẤP: Thêm trường chọn tài khoản nguồn */}
                        <TextField
                            select required fullWidth margin="normal" label="Từ tài khoản" value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)}
                            variant="filled" sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' }, '& .MuiSelect-select': { color: 'white' }, '& .MuiSvgIcon-root': { color: 'white' } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><AccountBalanceWalletIcon sx={{ color: '#95a5a6' }} /></InputAdornment> }}
                            disabled={!accounts || accounts.length === 0}
                        >
                            {accounts && accounts.map((acc) => (
                                <MenuItem key={acc._id} value={acc._id}>
                                    {`${acc.accountType} (${acc.currency}) - $${acc.balance.toLocaleString()}`}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            required fullWidth margin="normal" label="Email người nhận" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
                            variant="filled" sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><AccountCircle sx={{ color: '#95a5a6' }} /></InputAdornment> }}
                        />
                        <TextField
                            required fullWidth margin="normal" label="Số tiền" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                            variant="filled" sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
                        />
                        <TextField
                            fullWidth margin="normal" label="Nội dung (tùy chọn)" value={description} onChange={(e) => setDescription(e.target.value)}
                            variant="filled" sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
                        />

                        <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '25px' }} disabled={transferLoading || !sourceAccountId}>
                            {transferLoading ? <CircularProgress size={26} color="inherit" /> : 'Xác nhận chuyển'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default TransferPage;
