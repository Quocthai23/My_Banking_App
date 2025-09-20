import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import useStore from '../store/useStore';
// SỬA LỖI: Không cần import loginUser trực tiếp ở đây nữa
// import { loginUser } from '../api/api'; 

// Material-UI Components
import { Box, Button, TextField, Typography, Container, Paper, Alert, Link, InputAdornment, IconButton, CircularProgress } from '@mui/material';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function LoginPage() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // SỬA LỖI: Lấy trạng thái loading và error từ store thay vì state local
    const isLoading = useStore((state) => state.auth.authLoading);
    const error = useStore((state) => state.auth.error);
    
    // SỬA LỖI: Lấy đúng action `login` từ store, thay vì `setAuthSuccess`
    const loginAction = useStore((state) => state.login);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // SỬA LỖI: Toàn bộ logic được chuyển vào action `login` trong authSlice
        try {
            await loginAction(credentials);
            // `loginAction` sẽ tự động xử lý thông báo thành công
            navigate('/dashboard');

        } catch (err) {
            // `loginAction` đã xử lý việc set error và hiển thị thông báo lỗi,
            // nên khối catch này chỉ cần tồn tại để ngăn lỗi chưa được bắt (uncaught error).
            console.error("Login failed on page:", err.message);
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
                        Đăng nhập
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
                            value={credentials.username}
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
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{color: '#bdc3c7'}}/></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{color: '#bdc3c7'}}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                style: { color: 'white' }
                            }}
                            InputLabelProps={{ style: { color: '#bdc3c7' } }}
                        />
                        {/* SỬA LỖI: Hiển thị lỗi từ global store */}
                        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)' }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
                        </Button>
                        <Typography variant="body2" align="center">
                            Chưa có tài khoản?{' '}
                            <Link component={RouterLink} to="/register" sx={{color: '#3498db', fontWeight: 'bold'}}>
                                Tạo tài khoản ngay
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default LoginPage;
