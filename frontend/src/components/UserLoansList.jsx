import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
// --- KHẮC PHỤC VÒNG LẶP: Import shallow từ Zustand ---
import { shallow } from 'zustand/shallow';

// Material-UI Components
import { Card, CardContent, Typography, List, ListItem, ListItemText, Button, Divider, Tabs, Tab, Box, Chip, CircularProgress } from '@mui/material';

function UserLoansList() {
    const [tabIndex, setTabIndex] = useState(0);

    // --- KHẮC PHỤC VÒNG LẶP: Sử dụng một selector duy nhất với shallow ---
    // Lấy `userLoans` (array) và các state/action khác cùng lúc.
    // `shallow` sẽ so sánh nông, ngăn re-render nếu tham chiếu của mảng `userLoans` không đổi.
    const { userLoans, fetchUserLoans, loansLoading, loansError } = useStore(
        (state) => ({
            userLoans: state.loans, // Sửa lại để khớp với store slice
            fetchUserLoans: state.fetchLoans, // Sửa lại để khớp với store slice
            loansLoading: state.loansLoading,
            loansError: state.loansError,
        }),
        shallow // Quan trọng: Thêm shallow
    );
    
    // Tự động tải danh sách khoản vay khi component được gắn vào
    useEffect(() => {
        if (fetchUserLoans) {
            fetchUserLoans();
        }
    }, [fetchUserLoans]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    // Lọc các khoản vay dựa trên trạng thái từ backend
    const activeLoans = userLoans.filter(loan => loan.status === 'pending' || loan.status === 'approved');
    const historyLoans = userLoans.filter(loan => loan.status !== 'pending' && loan.status !== 'approved');

    const loansToDisplay = tabIndex === 0 ? activeLoans : historyLoans;
    
    const handleRepayLoan = (loanId) => {
        alert(`Chức năng trả nợ cho khoản vay ${loanId} sẽ được triển khai.`);
    };

    const renderLoanList = () => {
        if (loansLoading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress color="inherit" /></Box>;
        }
        if (loansError) {
            return <Typography sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>{loansError}</Typography>;
        }
        if (loansToDisplay.length === 0) {
            return (
                <Typography sx={{ p: 2, textAlign: 'center', color: '#95a5a6' }}>
                    Không có khoản vay nào trong mục này.
                </Typography>
            );
        }
        return (
            <List>
                {loansToDisplay.map((loan) => (
                    <React.Fragment key={loan._id}>
                        <ListItem
                            secondaryAction={
                                loan.status === 'approved' && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleRepayLoan(loan._id)}
                                        disabled={loansLoading}
                                    >
                                        Trả nợ
                                    </Button>
                                )
                            }
                        >
                            <ListItemText
                                primary={`Khoản vay ${loan.amount.toLocaleString()} USD - ${loan.interestRate}% lãi suất`}
                                secondary={
                                    <Typography component="span" variant="body2" color="#bdc3c7">
                                        Kỳ hạn: {loan.term} tháng <br/>
                                        Tài sản thế chấp: {loan.nftCollateralAddress ? `NFT tại ${loan.nftCollateralAddress.substring(0,6)}...` : 'N/A'}
                                    </Typography>
                                }
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                             <Chip 
                                label={loan.status} 
                                color={
                                    loan.status === 'approved' ? 'success' : 
                                    loan.status === 'pending' ? 'warning' : 'error'
                                }
                                size="small"
                            />
                        </ListItem>
                        <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.1)' }}/>
                    </React.Fragment>
                ))}
            </List>
        );
    }

    return (
        <Card elevation={4} sx={{ background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Các khoản vay của bạn
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} textColor="inherit" indicatorColor="primary">
                        <Tab label={`Đang hoạt động (${activeLoans.length})`} sx={{textTransform: 'none', fontWeight: 'bold'}}/>
                        <Tab label={`Lịch sử (${historyLoans.length})`} sx={{textTransform: 'none', fontWeight: 'bold'}}/>
                    </Tabs>
                </Box>
                {renderLoanList()}
            </CardContent>
        </Card>
    );
}

export default UserLoansList;
