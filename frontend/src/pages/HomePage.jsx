import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';

// Icons
import SavingsIcon from '@mui/icons-material/Savings';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LanIcon from '@mui/icons-material/Lan';

const FeatureCard = ({ icon, title, description }) => (
    // SỬA LỖI: Loại bỏ dấu phẩy thừa trong thuộc tính 'sx' gây lỗi hiển thị
    <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        color: 'white'
    }}>
        <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ color: '#1abc9c', fontSize: '3rem', mb: 2 }}>
                {icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{title}</Typography>
            <Typography color="#bdc3c7">{description}</Typography>
        </CardContent>
    </Card>
);

const HomePage = () => {
    const isAuthenticated = useStore((state) => state.auth.isAuthenticated);

    return (
        // NÂNG CẤP: Sử dụng Flexbox để bao bọc và căn giữa toàn bộ trang
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Hero Section */}
            <Box sx={{
                width: '100%', // Đảm bảo section chiếm toàn bộ chiều rộng
                background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)',
                color: 'white',
                py: { xs: 10, md: 15 }, // Sử dụng py để padding trên dưới đối xứng
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center', // Căn giữa container bên trong
            }}>
                <Container maxWidth="md">
                    <Typography component="h1" variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Ngân hàng Số An toàn & Phi tập trung
                    </Typography>
                    <Typography variant="h6" color="#bdc3c7" sx={{ mb: 4 }}>
                        Trải nghiệm tương lai của tài chính với các dịch vụ staking, cho vay và hoán đổi an toàn, minh bạch ngay trên nền tảng của chúng tôi.
                    </Typography>
                    <Button
                        component={Link}
                        to={isAuthenticated ? "/dashboard" : "/register"}
                        variant="contained"
                        size="large"
                        sx={{
                            fontWeight: 'bold',
                            py: 1.5,
                            px: 5,
                            borderRadius: '50px',
                            background: 'linear-gradient(45deg, #1abc9c 30%, #16a085 90%)',
                            boxShadow: '0 3px 5px 2px rgba(26, 188, 156, .3)',
                        }}
                    >
                        {isAuthenticated ? "Đi đến Bảng điều khiển" : "Bắt đầu ngay"}
                    </Button>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ width: '100%', py: 8, backgroundColor: '#1e2b37', display: 'flex', justifyContent: 'center' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 6, color: 'white' }}>
                        Các Dịch vụ Nổi bật
                    </Typography>
                    {/* NÂNG CẤP: Thêm justifyContent="center" để các card luôn nằm giữa */}
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard
                                icon={<SavingsIcon sx={{ fontSize: 'inherit' }} />}
                                title="Staking & Kiếm lời"
                                description="Gửi tài sản của bạn để nhận lãi suất hấp dẫn và tham gia vào việc bảo mật mạng lưới."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard
                                icon={<CurrencyExchangeIcon sx={{ fontSize: 'inherit' }} />}
                                title="Hoán đổi Token"
                                description="Giao dịch các loại tiền điện tử một cách nhanh chóng và an toàn với mức trượt giá thấp."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard
                                icon={<AccountBalanceIcon sx={{ fontSize: 'inherit' }} />}
                                title="Vay & Cho Vay"
                                description="Thế chấp tài sản kỹ thuật số của bạn để vay vốn hoặc cho vay để nhận thêm thu nhập."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FeatureCard
                                icon={<LanIcon sx={{ fontSize: 'inherit' }} />}
                                title="Cross-chain Bridge"
                                description="Di chuyển tài sản của bạn một cách liền mạch giữa các mạng blockchain khác nhau."
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;