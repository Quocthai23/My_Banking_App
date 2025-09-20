import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import useStore from '../store/useStore';
import { api } from '../api/api'; 
// shallow không còn cần thiết và nên được loại bỏ
// import { shallow } from 'zustand/shallow';

import { Box, Button, TextField, Typography, Container, Paper, Alert, Link, InputAdornment, IconButton, CircularProgress } from '@mui/material';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function RegisterPage() {
    const [formData, setFormData] = useState({ username: '', password: '', referralCode: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // --- SỬA LỖI: Chia nhỏ hook useStore và bỏ shallow ---
    const connectWallet = useStore((state) => state.connectWallet);
    const walletAddress = useStore((state) => state.wallet.address);
    const addNotification = useStore((state) => state.addNotification);
    
    const [registerLoading, setRegisterLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!walletAddress) {
            setError('Vui lòng kết nối ví của bạn để đăng ký.');
            return;
        }
        setError('');
        setRegisterLoading(true);
        try {
            const dataToSubmit = { ...formData, walletAddress };
            await api.post('/users/register', dataToSubmit);
            addNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setRegisterLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2c3e50 30%, #16222A 90%)',
        }}>
            <Container component="main" maxWidth="sm">
                <Paper elevation={6} sx={{ 
                    padding: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    color: 'white'
                }}>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
                        Tạo tài khoản
                    </Typography>
                    
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Tên đăng nhập"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{color: '#bdc3c7'}}/></InputAdornment>,
                                style: { color: 'white' }
                            }}
                            InputLabelProps={{ style: { color: '#bdc3c7' } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="new-password"
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{color: '#bdc3c7'}}/></InputAdornment>,
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{color: '#bdc3c7'}}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                ),
                                style: { color: 'white' }
                            }}
                            InputLabelProps={{ style: { color: '#bdc3c7' } }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            name="referralCode"
                            label="Mã giới thiệu (Nếu có)"
                            id="referralCode"
                            onChange={handleChange}
                            InputProps={{ style: { color: 'white' } }}
                            InputLabelProps={{ style: { color: '#bdc3c7' } }}
                        />

                        {walletAddress ? (
                            <Typography variant="body2" sx={{ mt: 2, p: 2, color: '#2ecc71', textAlign: 'center', background: 'rgba(46, 204, 113, 0.1)', borderRadius: 1 }}>
                                Đã kết nối ví: {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                            </Typography>
                        ) : (
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={connectWallet}
                                startIcon={<AccountBalanceWalletIcon />}
                                sx={{ mt: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                            >
                                Kết nối ví MetaMask
                            </Button>
                        )}
                        
                        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)' }}
                            disabled={!walletAddress || registerLoading}
                        >
                            {registerLoading ? <CircularProgress size={24} color="inherit" /> : 'Tạo tài khoản'}
                        </Button>
                        <Typography variant="body2" align="center">
                            Đã có tài khoản?{' '}
                            <Link component={RouterLink} to="/login" sx={{color: '#3498db', fontWeight: 'bold'}}>
                                Đăng nhập
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default RegisterPage;
