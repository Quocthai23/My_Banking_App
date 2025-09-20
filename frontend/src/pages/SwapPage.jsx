import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Container, Typography, Paper, TextField, Button, IconButton,
    CircularProgress, Avatar, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemAvatar, ListItemText
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Component con: Modal chọn Token
const TokenSelectModal = ({ open, onClose, onSelect }) => {
    // Sửa lỗi: Lấy state một cách riêng biệt
    const supportedTokens = useStore((state) => state.supportedTokens);

    // Xử lý trường hợp supportedTokens chưa được tải
    if (!supportedTokens) {
        return (
            <Dialog onClose={onClose} open={open}>
                <DialogTitle>Đang tải danh sách token...</DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
            </Dialog>
        );
    }

    return (
        <Dialog onClose={onClose} open={open} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
            <DialogTitle>Chọn một Token</DialogTitle>
            <List sx={{ pt: 0 }}>
                {supportedTokens.map((token) => (
                    <ListItem disableGutters key={token.symbol}>
                        <ListItemButton onClick={() => { onSelect(token); onClose(); }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: '#3498db' }}>{token.symbol.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={token.symbol} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
};

// Component chính
const SwapPage = () => {
    const [isSelectingFrom, setSelectingFrom] = useState(false);
    const [isSelectingTo, setSelectingTo] = useState(false);

    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow/lấy toàn bộ state ---
    const fromToken = useStore((state) => state.fromToken);
    const toToken = useStore((state) => state.toToken);
    const fromAmount = useStore((state) => state.fromAmount);
    const toAmount = useStore((state) => state.toAmount);
    const swapLoading = useStore((state) => state.swapLoading);
    const setFromToken = useStore((state) => state.setFromToken);
    const setToToken = useStore((state) => state.setToToken);
    const setFromAmount = useStore((state) => state.setFromAmount);
    const fetchSwapQuote = useStore((state) => state.fetchSwapQuote);
    const performSwap = useStore((state) => state.performSwap);
    
    // Debounce effect to fetch quote
    useEffect(() => {
        const handler = setTimeout(() => {
            if (fromAmount && parseFloat(fromAmount) > 0 && fetchSwapQuote) {
                fetchSwapQuote(fromAmount);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [fromAmount, fetchSwapQuote]);

    const handleSwapTokens = () => {
        if (setFromToken && setToToken) {
            const temp = fromToken;
            setFromToken(toToken);
            setToToken(temp);
        }
    };

    const handlePerformSwap = () => {
        if (performSwap) {
            performSwap();
        }
    };
    
    // Thêm điều kiện loading hoặc dữ liệu chưa sẵn sàng
    if (!fromToken || !toToken) {
        return (
            <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', py: 5, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', py: 5, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
            <Container maxWidth="xs">
                <Paper elevation={12} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>Hoán đổi</Typography>
                    
                    {/* From Token */}
                    <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 3 }}>
                        <Button onClick={() => setSelectingFrom(true)} endIcon={<ArrowDropDownIcon />} sx={{ color: 'white', textTransform: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: '#3498db' }}>{fromToken.symbol.charAt(0)}</Avatar>
                            {fromToken.symbol}
                        </Button>
                        <TextField fullWidth variant="standard" type="number" placeholder="0.0" value={fromAmount} onChange={(e) => setFromAmount && setFromAmount(e.target.value)}
                            sx={{ input: { color: 'white', fontSize: '2rem', textAlign: 'right', '::placeholder': { color: '#7f8c8d' } } }} InputProps={{ disableUnderline: true }} />
                    </Paper>

                    <Box sx={{ my: 2, textAlign: 'center' }}>
                        <IconButton onClick={handleSwapTokens} sx={{ background: 'rgba(0,0,0,0.3)', color: '#3498db', border: '2px solid #3498db' }}>
                            <SwapVertIcon />
                        </IconButton>
                    </Box>

                    {/* To Token */}
                     <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 3 }}>
                        <Button onClick={() => setSelectingTo(true)} endIcon={<ArrowDropDownIcon />} sx={{ color: 'white', textTransform: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: '#3498db' }}>{toToken.symbol.charAt(0)}</Avatar>
                            {toToken.symbol}
                        </Button>
                         <TextField fullWidth variant="standard" type="number" placeholder="0.0" value={toAmount} disabled
                            sx={{ input: { color: '#bdc3c7', fontSize: '2rem', textAlign: 'right', '::placeholder': { color: '#7f8c8d' } }, 'input:disabled': { WebkitTextFillColor: '#bdc3c7' } }} InputProps={{ disableUnderline: true }} />
                    </Paper>

                    <Button onClick={handlePerformSwap} variant="contained" fullWidth size="large" sx={{ mt: 3, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }} disabled={swapLoading || !fromAmount}>
                        {swapLoading ? <CircularProgress size={26} color="inherit" /> : 'Hoán đổi'}
                    </Button>
                </Paper>
            </Container>
            <TokenSelectModal open={isSelectingFrom} onClose={() => setSelectingFrom(false)} onSelect={setFromToken} />
            <TokenSelectModal open={isSelectingTo} onClose={() => setSelectingTo(false)} onSelect={setToToken} />
        </Box>
    );
};

export default SwapPage;
