import React, { useState } from 'react';
import useStore from '../store/useStore.js';
// shallow không còn cần thiết và nên được loại bỏ
// import { shallow } from 'zustand/shallow';
import { Container, Typography, Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, CircularProgress, IconButton } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';

// Dữ liệu giả lập cho các chain và token
const chains = [
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'polygon', name: 'Polygon' },
    { id: 'bsc', name: 'BNB Chain' },
];
const tokens = [
    { id: 'eth', name: 'ETH' },
    { id: 'usdc', name: 'USDC' },
    { id: 'usdt', name: 'USDT' },
];

const BridgePage = () => {
    
    const [fromChain, setFromChain] = useState('ethereum');
    const [toChain, setToChain] = useState('polygon');
    const [token, setToken] = useState('eth');
    const [amount, setAmount] = useState('');

    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const initiateBridge = useStore((state) => state.initiateBridge);
    const isBridging = useStore((state) => state.isBridging);
    const bridgeError = useStore((state) => state.bridgeError);
    const addNotification = useStore((state) => state.addNotification);

    const handleSwapChains = () => {
        const temp = fromChain;
        setFromChain(toChain);
        setToChain(temp);
    };

    const handleBridge = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            if(addNotification) addNotification('Vui lòng nhập số lượng hợp lệ.', 'error' );
            return;
        }
        if(initiateBridge) await initiateBridge({ fromChain, toChain, token, amount });
    };

    return (
        <Box sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2c3e50 30%, #16222A 90%)',
            color: 'white'
        }}>
            <Container maxWidth="sm">
                <Paper elevation={6} sx={{ 
                    p: 4, 
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        Cross-Chain Bridge
                    </Typography>
                    <Typography color="#bdc3c7" textAlign="center" sx={{ mb: 4 }}>
                        Di chuyển tài sản của bạn giữa các mạng lưới một cách an toàn.
                    </Typography>

                    <Box component="form" noValidate autoComplete="off">
                        {/* From Chain */}
                        <FormControl fullWidth margin="normal" variant="filled">
                            <InputLabel sx={{color: '#bdc3c7'}}>Từ Mạng Lưới</InputLabel>
                            <Select value={fromChain} onChange={(e) => setFromChain(e.target.value)} sx={{color: 'white', backgroundColor: 'rgba(0,0,0,0.2)'}}>
                                {chains.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <Box sx={{ textAlign: 'center', my: 1 }}>
                            <IconButton onClick={handleSwapChains} sx={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                                <SwapVertIcon />
                            </IconButton>
                        </Box>

                        {/* To Chain */}
                        <FormControl fullWidth margin="normal" variant="filled">
                            <InputLabel sx={{color: '#bdc3c7'}}>Đến Mạng Lưới</InputLabel>
                            <Select value={toChain} onChange={(e) => setToChain(e.target.value)} sx={{color: 'white', backgroundColor: 'rgba(0,0,0,0.2)'}}>
                                {chains.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        
                        {/* Token and Amount */}
                         <FormControl fullWidth margin="normal" variant="filled" sx={{mt: 3}}>
                            <InputLabel sx={{color: '#bdc3c7'}}>Tài sản</InputLabel>
                            <Select value={token} onChange={(e) => setToken(e.target.value)} sx={{color: 'white', backgroundColor: 'rgba(0,0,0,0.2)'}}>
                                {tokens.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            id="amount"
                            label="Số lượng"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            variant="filled"
                             InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.2)' } }}
                             InputLabelProps={{ style: { color: '#bdc3c7' } }}
                        />

                        {bridgeError && <Typography color="error" sx={{mt: 2}}>{bridgeError}</Typography>}

                        <Box sx={{ mt: 3, position: 'relative' }}>
                            <Button fullWidth variant="contained" size="large" disabled={isBridging} onClick={handleBridge} sx={{ py: 1.5, fontWeight: 'bold', background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)' }}>
                                {isBridging ? <CircularProgress size={24} color="inherit" /> : 'Thực hiện Bridge'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default BridgePage;
