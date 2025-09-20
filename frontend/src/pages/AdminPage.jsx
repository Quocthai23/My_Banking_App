import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
// shallow không còn cần thiết và nên được loại bỏ
// import { shallow } from 'zustand/shallow'; 
import {
    Container, Typography, Box, Paper, Tabs, Tab, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
    Chip
} from '@mui/material';
import TicketManagement from '../components/TicketManagement';

// Component con để quản lý các khoản vay
const LoanManagement = () => {
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const allLoans = useStore((state) => state.allLoans);
    const adminLoading = useStore((state) => state.adminLoading);
    const approveLoan = useStore((state) => state.approveLoan);
    const rejectLoan = useStore((state) => state.rejectLoan);
    const fetchAllLoans = useStore((state) => state.fetchAllLoans);
    
    useEffect(() => {
        fetchAllLoans();
    }, [fetchAllLoans]);

    return (
        <Paper sx={{ background: '#2c3e50', color: 'white', p: 3, borderRadius: 4 }}>
            {adminLoading && allLoans.length === 0 ? <CircularProgress color="inherit" /> : allLoans.length > 0 ? (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Người vay</TableCell>
                                <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Số tiền</TableCell>
                                <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Trạng thái</TableCell>
                                <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allLoans.map((loan) => (
                                <TableRow key={loan._id}>
                                    <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{loan.user?.username || 'N/A'}</TableCell>
                                    <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{loan.amount} USD</TableCell>
                                    <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                        <Chip label={loan.status} color={loan.status === 'pending' ? 'warning' : loan.status === 'approved' ? 'success' : 'error'} size="small" />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                        {loan.status === 'pending' && (
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Button size="small" variant="contained" color="success" onClick={() => approveLoan(loan._id)} disabled={adminLoading}>Duyệt</Button>
                                                <Button size="small" variant="contained" color="error" onClick={() => rejectLoan(loan._id)} disabled={adminLoading}>Từ chối</Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>Không có yêu cầu vay nào.</Typography>
            )}
        </Paper>
    );
};


// Component chính
const AdminPage = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="xl">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    Trang Quản trị
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)', mb: 3 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} textColor="inherit" indicatorColor="primary">
                        <Tab label="Quản lý Khoản vay" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                        <Tab label="Quản lý Hỗ trợ" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                    </Tabs>
                </Box>
                {tabIndex === 0 && <LoanManagement />}
                {tabIndex === 1 && <TicketManagement />}
            </Container>
        </Box>
    );
};

export default AdminPage;
