import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';

import {
    Box, Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip,
    CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Tooltip
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Component con: Modal để tạo hóa đơn
const CreateInvoiceModal = ({ open, onClose }) => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [description, setDescription] = useState('');

    const createInvoice = useStore((state) => state.createInvoice);
    const invoicesLoading = useStore((state) => state.invoicesLoading);

    const handleSubmit = async () => {
        if (!recipient || !amount || !dueDate) {
            // Optional: Add validation feedback
            return;
        }
        if (createInvoice) {
            const success = await createInvoice({ recipient, amount: parseFloat(amount), dueDate, description });
            if (success) {
                // Reset form and close
                setRecipient('');
                setAmount('');
                setDueDate('');
                setDescription('');
                onClose();
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Hóa Đơn Mới</DialogTitle>
            <DialogContent>
                <TextField autoFocus required margin="dense" id="recipient" label="Email người nhận" type="email" fullWidth variant="filled" value={recipient} onChange={(e) => setRecipient(e.target.value)} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
                <TextField required margin="dense" id="amount" label="Số tiền (ETH)" type="number" fullWidth variant="filled" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
                <TextField required margin="dense" id="dueDate" label="Ngày hết hạn" type="date" fullWidth variant="filled" value={dueDate} onChange={(e) => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
                <TextField margin="dense" id="description" label="Mô tả (tùy chọn)" type="text" fullWidth variant="filled" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}/>
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={onClose} sx={{ color: 'white' }}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={invoicesLoading}>
                    {invoicesLoading ? <CircularProgress size={24} /> : 'Tạo'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Component chính
const InvoicesPage = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const invoices = useStore((state) => state.invoices);
    const invoicesLoading = useStore((state) => state.invoicesLoading);
    const fetchInvoices = useStore((state) => state.fetchInvoices);
    const user = useStore((state) => state.user);

    useEffect(() => {
        if (fetchInvoices) {
            fetchInvoices();
        }
    }, [fetchInvoices]);

    const getStatusChip = (status) => {
        if (status === 'paid') return <Chip label="Đã thanh toán" color="success" size="small" />;
        if (status === 'pending') return <Chip label="Đang chờ" color="warning" size="small" />;
        if (status === 'cancelled') return <Chip label="Đã hủy" color="error" size="small" />;
        return <Chip label="Hết hạn" color="default" size="small" />;
    };

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Quản lý Hóa đơn</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ fontWeight: 'bold' }}>
                        Tạo hóa đơn
                    </Button>
                </Box>

                <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                    {invoicesLoading && invoices.length === 0 ? (
                        <Box sx={{ textAlign: 'center' }}><CircularProgress color="inherit" /></Box>
                    ) : invoices.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Loại</TableCell>
                                        <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>ID</TableCell>
                                        <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Đối tác</TableCell>
                                        <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Số tiền</TableCell>
                                        <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Trạng thái</TableCell>
                                        <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.2)' }}>Ngày hết hạn</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice._id} hover sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }}}>
                                            <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                                {invoice.role === 'creator' ? (
                                                     <Tooltip title="Hóa đơn gửi đi">
                                                        <ArrowUpwardIcon color="error" />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Hóa đơn nhận được">
                                                        <ArrowDownwardIcon color="success" />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>#{invoice.shortId}</TableCell>
                                            <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                                {invoice.role === 'creator' ? invoice.recipientEmail : (user ? user.username : '...')}
                                            </TableCell>
                                            <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{invoice.amount.toLocaleString()} ETH</TableCell>
                                            <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{getStatusChip(invoice.status)}</TableCell>
                                            <TableCell sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                         <Box sx={{ textAlign: 'center', py: 10 }}>
                             <ReceiptLongIcon sx={{ fontSize: 60, color: 'grey.700' }} />
                             <Typography variant="h6" sx={{ mt: 2 }}>Không có hóa đơn nào.</Typography>
                         </Box>
                    )}
                </Paper>
            </Container>
            <CreateInvoiceModal open={isModalOpen} onClose={() => setModalOpen(false)} />
        </Box>
    );
};

export default InvoicesPage;
