import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    Chip, Tooltip
} from '@mui/material';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Component con: Modal để tạo giao dịch mới
const CreateScheduledTxModal = ({ open, onClose }) => {
    const [toWallet, setToWallet] = useState('');
    const [amount, setAmount] = useState('');
    const [executeAt, setExecuteAt] = useState('');
    
    const scheduleTransaction = useStore((state) => state.scheduleTransaction);
    const isLoading = useStore((state) => state.scheduledTxLoading);
    const addNotification = useStore((state) => state.addNotification);

    const handleSubmit = async () => {
        if (!toWallet || !amount || !executeAt) {
            addNotification('Vui lòng điền đầy đủ thông tin.', 'warning');
            return;
        }
        const success = await scheduleTransaction({ 
            toWallet, 
            amount: parseFloat(amount), 
            executeAt 
        });
        if (success) {
            setToWallet('');
            setAmount('');
            setExecuteAt('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Lên Lịch Giao Dịch Mới</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Địa chỉ ví người nhận" fullWidth variant="filled" value={toWallet} onChange={(e) => setToWallet(e.target.value)} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
                <TextField margin="dense" label="Số tiền (ETH)" type="number" fullWidth variant="filled" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
                <TextField margin="dense" label="Ngày thực hiện" type="datetime-local" fullWidth variant="filled" value={executeAt} onChange={(e) => setExecuteAt(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={onClose} sx={{ color: 'white' }}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Lên lịch'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Component chính
const ScheduledTransactionsPage = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore ---
    const transactions = useStore((state) => state.scheduledTransactions);
    const isLoading = useStore((state) => state.scheduledTxLoading);
    const fetchScheduledTransactions = useStore((state) => state.fetchScheduledTransactions);
    const cancelScheduledTransaction = useStore((state) => state.cancelScheduledTransaction);
    
    useEffect(() => {
        if (fetchScheduledTransactions) fetchScheduledTransactions();
    }, [fetchScheduledTransactions]);
    
    const getStatusChip = (tx) => {
        const statusMap = {
            pending: { label: 'Đang chờ', color: 'warning', icon: <HourglassEmptyIcon /> },
            completed: { label: 'Hoàn thành', color: 'success', icon: <CheckCircleIcon /> },
            failed: { label: 'Thất bại', color: 'error', icon: <ErrorIcon /> },
            cancelled: { label: 'Đã hủy', color: 'default', icon: <CancelIcon /> }
        };
        const statusInfo = statusMap[tx.status] || statusMap.cancelled;
        
        const chip = <Chip icon={statusInfo.icon} label={statusInfo.label} color={statusInfo.color} size="small" />;

        return tx.status === 'failed' && tx.failureReason ? (
            <Tooltip title={tx.failureReason} placement="top">
                <span>{chip}</span>
            </Tooltip>
        ) : chip;
    };

    const formatAddress = (address) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Giao dịch định kỳ</Typography>
                    <Button variant="contained" startIcon={<AddAlarmIcon />} onClick={() => setModalOpen(true)} sx={{ fontWeight: 'bold' }}>
                        Lên lịch mới
                    </Button>
                </Box>
                <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                        {isLoading && transactions.length === 0 ? (
                            <Box sx={{ textAlign: 'center' }}><CircularProgress color="inherit" /></Box>
                        ) : transactions.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Người nhận</TableCell>
                                            <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Số tiền</TableCell>
                                            <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Ngày thực hiện</TableCell>
                                            <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Trạng thái</TableCell>
                                            <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Hành động</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx._id}>
                                                <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                                    <Tooltip title={tx.toWallet}><Typography variant="body2">{formatAddress(tx.toWallet)}</Typography></Tooltip>
                                                </TableCell>
                                                <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{tx.amount} {tx.token}</TableCell>
                                                <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{new Date(tx.executeAt).toLocaleString()}</TableCell>
                                                <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{getStatusChip(tx)}</TableCell>
                                                <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                                    <Tooltip title="Hủy giao dịch">
                                                        <span>
                                                            <IconButton onClick={() => cancelScheduledTransaction(tx._id)} color="error" disabled={tx.status !== 'pending'}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 10 }}>
                                <ScheduleSendIcon sx={{ fontSize: 60, color: 'grey.700' }} />
                                <Typography variant="h6" sx={{ mt: 2 }}>Không có giao dịch nào được lên lịch.</Typography>
                            </Box>
                        )}
                </Paper>
            </Container>
            <CreateScheduledTxModal open={isModalOpen} onClose={() => setModalOpen(false)} />
        </Box>
    );
};

export default ScheduledTransactionsPage;
