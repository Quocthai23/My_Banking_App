import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import CreateLoanForm from '../components/CreateLoanForm';
import UserLoansList from '../components/UserLoansList';

/**
 * Trang Vay Vốn.
 * LƯU Ý: Tệp này không cần sửa đổi trực tiếp vì nó không sử dụng hook `useStore`.
 * Nó hoạt động như một component layout, và các component con gây ra lỗi (`UserLoansList`)
 * đã được khắc phục trong các bước trước đó.
 */
const LoansPage = () => {
  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)',
      color: 'white',
      py: 5,
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
          Vay Vốn Thế Chấp NFT
        </Typography>
        <Grid container spacing={5} alignItems="flex-start">
          {/* Cột bên trái: Form tạo yêu cầu vay */}
          <Grid item xs={12} md={5}>
            <CreateLoanForm />
          </Grid>
          
          {/* Cột bên phải: Danh sách các khoản vay */}
          <Grid item xs={12} md={7}>
            <UserLoansList />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoansPage;
