import React, { useState } from 'react';
import useStore from '../store/useStore.js';
import { shallow } from 'zustand/shallow';
// Material-UI Components
import { Box, TextField, Button, CircularProgress } from '@mui/material';

// Component này nhận `vault` làm prop từ StakingPage
function StakingActions({ vault }) {
  const [amount, setAmount] = useState('');
  
  // Sửa lỗi: Thêm shallow để so sánh nông, tránh re-render không cần thiết
  const { handleStake, stakingLoading, addNotification } = useStore((state) => ({
    handleStake: state.handleStake,
    stakingLoading: state.stakingLoading,
    addNotification: state.addNotification,
  }), shallow);

  const onStake = async () => {
    // Validation tốt hơn, sử dụng hệ thống thông báo
    if (!amount || parseFloat(amount) <= 0) {
      addNotification({ message: "Vui lòng nhập số tiền hợp lệ.", type: "warning" });
      return;
    }

    const success = await handleStake(vault, amount);
    if (success) {
      setAmount(''); // Xóa trường nhập liệu sau khi thành công
    }
  };

  return (
    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <TextField
        fullWidth
        label={`Số lượng ${vault.tokenSymbol || ''}`}
        variant="filled"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        disabled={stakingLoading}
        InputLabelProps={{ style: { color: '#95a5a6' } }}
        InputProps={{ 
          style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.2)' },
          inputProps: { min: 0 } // Ngăn không cho nhập số âm
        }}
      />
      <Button
        onClick={onStake}
        variant="contained"
        color="primary"
        disabled={stakingLoading}
        size="large"
        sx={{
          py: 1.85,
          px: 4,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #1abc9c 30%, #16a085 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #2fe0bb 30%, #19b192 90%)',
          }
        }}
      >
        {stakingLoading ? <CircularProgress size={26} color="inherit" /> : 'Stake'}
      </Button>
    </Box>
  );
}

export default StakingActions;
