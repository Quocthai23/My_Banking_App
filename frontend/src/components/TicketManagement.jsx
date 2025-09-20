import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';

// Material-UI Components
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Divider,
    Chip,
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

// --- Component con để hiển thị chi tiết và trả lời ticket ---
function TicketDetails({ ticket, messages, onReply, onStatusChange }) {
    const [reply, setReply] = useState('');
    const [status, setStatus] = useState(ticket.status);
    const adminLoading = useStore((state) => state.adminLoading);
    const user = useStore((state) => state.user);

    // Cập nhật trạng thái local khi ticket được chọn thay đổi
    useEffect(() => {
        setStatus(ticket.status);
    }, [ticket]);

    const handleReply = () => {
        if (reply.trim()) {
            onReply(ticket._id, { message: reply }); // API backend mong đợi một object
            setReply('');
        }
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        onStatusChange(ticket._id, { status: newStatus }); // API backend mong đợi một object
    };
    
    return (
        <Paper elevation={4} sx={{ p: 3, background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom>Chi tiết Ticket #{ticket.shortId || ticket._id}</Typography>
            <Typography variant="h6" gutterBottom><strong>Chủ đề:</strong> {ticket.subject}</Typography>

            <FormControl fullWidth sx={{ my: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover fieldset': { borderColor: 'white' } }, '& .MuiSvgIcon-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#bdc3c7'} }}>
                <InputLabel id="status-select-label">Trạng thái</InputLabel>
                <Select
                    labelId="status-select-label"
                    value={status}
                    label="Trạng thái"
                    onChange={handleStatusChange}
                    sx={{ color: 'white' }}
                >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                </Select>
            </FormControl>

            <Box sx={{ maxHeight: 400, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.2)', p: 2, borderRadius: 2, my: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                {messages.map((msg) => (
                    <Box key={msg._id} sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: msg.sender?._id === user?._id ? 'flex-end' : 'flex-start' }}>
                        <Typography variant="caption" color="#95a5a6">
                            {msg.sender?.username || 'Không rõ'} - {new Date(msg.createdAt).toLocaleString()}
                        </Typography>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 1.5,
                                display: 'inline-block',
                                maxWidth: '80%',
                                bgcolor: msg.sender?._id === user?._id ? '#3498db' : '#34495e',
                                color: 'white',
                            }}
                        >
                            <Typography sx={{ wordBreak: 'break-word' }}>{msg.message}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>

            <TextField
                label="Nội dung trả lời"
                multiline
                rows={4}
                fullWidth
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                variant="filled"
                sx={{ mb: 2, textarea: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
            />
            <Button variant="contained" onClick={handleReply} disabled={adminLoading}>
                {adminLoading ? <CircularProgress size={24} /> : 'Gửi trả lời'}
            </Button>
        </Paper>
    );
}


// --- Component chính để quản lý tickets ---
function TicketManagement() {
    const {
        adminTickets,
        selectedTicket,
        adminLoading,
        fetchAdminTickets,
        fetchTicketDetails,
        replyToTicket,
        updateTicketStatus
    } = useAppStore((state) => ({
        adminTickets: state.adminTickets,
        selectedTicket: state.selectedTicket,
        adminLoading: state.adminLoading,
        fetchAdminTickets: state.fetchAdminTickets,
        fetchTicketDetails: state.fetchTicketDetails,
        replyToTicket: state.replyToTicket,
        updateTicketStatus: state.updateTicketStatus,
    }));

    useEffect(() => {
        fetchAdminTickets();
    }, [fetchAdminTickets]);

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'Open': return 'primary';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            case 'Closed': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 150px)', color: 'white' }}>
            <Paper elevation={4} sx={{ width: '35%', p: 2, overflowY: 'auto', background: '#2c3e50', borderRadius: 4 }}>
                <Typography variant="h6" gutterBottom>Danh sách Tickets</Typography>
                {adminLoading && adminTickets.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress color="inherit" /></Box>
                ) : (
                    <List>
                        {adminTickets.length > 0 ? adminTickets.map((ticket) => (
                            <React.Fragment key={ticket._id}>
                                <ListItemButton 
                                    selected={selectedTicket?.ticket?._id === ticket._id}
                                    onClick={() => fetchTicketDetails(ticket._id)} 
                                    sx={{ borderRadius: 1, '&.Mui-selected': {backgroundColor: 'rgba(52, 152, 219, 0.3)'} }}
                                >
                                    <ListItemText
                                        primary={ticket.subject}
                                        secondary={`Người tạo: ${ticket.user?.username || 'N/A'}`}
                                        primaryTypographyProps={{ fontWeight: 'bold' }}
                                        secondaryTypographyProps={{ color: '#bdc3c7' }}
                                    />
                                    <Chip
                                        label={ticket.status}
                                        color={getStatusChipColor(ticket.status)}
                                        size="small"
                                    />
                                </ListItemButton>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}/>
                            </React.Fragment>
                        )) : (
                            <Typography sx={{ p: 2, textAlign: 'center' }}>Không có ticket nào.</Typography>
                        )}
                    </List>
                )}
            </Paper>
            <Box sx={{ width: '65%', overflowY: 'auto' }}>
                {adminLoading && !selectedTicket ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress color="inherit" /></Box> : null}
                {selectedTicket ? (
                    <TicketDetails
                        ticket={selectedTicket.ticket}
                        messages={selectedTicket.messages}
                        onReply={replyToTicket}
                        onStatusChange={updateTicketStatus}
                    />
                ) : (
                    <Paper elevation={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#2c3e50', borderRadius: 4 }}>
                        <Typography variant="h6" color="#95a5a6">Chọn một ticket để xem chi tiết.</Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}

export default TicketManagement;

