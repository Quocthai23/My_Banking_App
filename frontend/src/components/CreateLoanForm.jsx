import React, { useState } from 'react';
import useStore from '../store/useStore.js';
// Material-UI Components
import { Card, CardContent, Typography, TextField, Button, CircularProgress, Box, Divider } from '@mui/material';

function CreateLoanForm() {
    // State cho các trường của form
    const [amount, setAmount] = useState('');
    const [nftAddress, setNftAddress] = useState('');
    const [tokenId, setTokenId] = useState('');
    
    // Lấy hàm và trạng thái từ store Zustand
    const requestLoan = useStore((state) => state.requestLoan);
    const loansLoading = useStore((state) => state.loansLoading);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra dữ liệu đầu vào
        if (!amount || !nftAddress || !tokenId || parseFloat(amount) <= 0) {
            // Store sẽ tự hiển thị thông báo lỗi, nhưng bạn có thể thêm validation ở đây nếu muốn
            console.error("Dữ liệu không hợp lệ");
            return;
        }

        // Gọi hàm requestLoan từ store với payload mới
        const success = await requestLoan({
            amount: parseFloat(amount),
            nftCollateralAddress: nftAddress, // Tên trường này nên khớp với backend
            nftCollateralTokenId: tokenId,
            // Giả sử kỳ hạn (term) là cố định hoặc không cần thiết cho loại vay này
            term: 12, 
        });

        // Nếu thành công, xóa các trường trong form
        if (success) {
            setAmount('');
            setNftAddress('');
            setTokenId('');
        }
    };

    return (
        <Card elevation={4} sx={{ background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Tạo khoản vay mới (Thế chấp NFT)
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Số tiền muốn vay (USD)"
                            variant="filled"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#95a5a6' } }}
                            InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.2)' } }}
                        />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Địa chỉ hợp đồng NFT"
                            variant="filled"
                            value={nftAddress}
                            onChange={(e) => setNftAddress(e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#95a5a6' } }}
                            InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.2)' } }}
                        />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label="ID của NFT thế chấp"
                            variant="filled"
                            type="number"
                            value={tokenId}
                            onChange={(e) => setTokenId(e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#95a5a6' } }}
                            InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.2)' } }}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loansLoading}
                        size="large"
                        sx={{ 
                            py: 1.5, textTransform: 'none', fontSize: '1.1rem', fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)'
                        }}
                    >
                        {loansLoading ? <CircularProgress size={26} color="inherit" /> : 'Xác nhận Vay'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default CreateLoanForm;

