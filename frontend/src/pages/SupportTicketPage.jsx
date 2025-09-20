import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Container, Typography, Paper, Grid, TextField, Button,
    CircularProgress, Accordion, AccordionSummary, AccordionDetails, Chip,
    MenuItem, Select, FormControl, InputLabel, List, ListItem, ListItemText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Component con để hiển thị và quản lý cuộc trò chuyện của một ticket
const TicketConversation = ({ ticketId }) => {
    const [newMessage, setNewMessage] = useState('');
    const messages = useStore((state) => state.ticketMessages[ticketId] || []);
    const isLoading = useStore((state) => state.currentTicketLoading === ticketId);
    const addMessageToTicket = useStore((state) => state.addMessageToTicket);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        addMessageToTicket(ticketId, newMessage);
        setNewMessage('');
    };

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Lịch sử trao đổi</Typography>
            <Paper variant="outlined" sx={{ maxHeight: '300px', overflowY: 'auto', p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.2)' }}>
                {messages.length > 0 ? (
                    <List>
                        {messages.map((msg) => (
                            <React.Fragment key={msg._id}>
                                <ListItem sx={{ flexDirection: 'column', alignItems: msg.senderId.role === 'admin' ? 'flex-start' : 'flex-end' }}>
                                    <ListItemText
                                        primary={msg.message}
                                        secondary={`${msg.senderId.username} - ${new Date(msg.createdAt).toLocaleString()}`}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            maxWidth: '80%',
                                            backgroundColor: msg.senderId.role === 'admin' ? '#34495e' : '#2980b9'
                                        }}
                                        primaryTypographyProps={{ color: 'white' }}
                                        secondaryTypographyProps={{ color: '#bdc3c7', mt: 0.5, fontSize: '0.75rem' }}
                                    />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="#bdc3c7" sx={{ textAlign: 'center' }}>Chưa có tin nhắn nào.</Typography>
                )}
            </Paper>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="filled"
                    label="Nhập câu trả lời của bạn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
                />
                <Button variant="contained" onClick={handleSendMessage} disabled={isLoading} endIcon={<SendIcon />}>
                    {isLoading ? <CircularProgress size={24} /> : 'Gửi'}
                </Button>
            </Box>
        </Box>
    );
};


const SupportTicketPage = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('General Inquiry');
    const [expandedTicket, setExpandedTicket] = useState(false);

    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore ---
    const tickets = useStore((state) => state.tickets);
    const ticketsLoading = useStore((state) => state.ticketsLoading);
    const fetchTickets = useStore((state) => state.fetchTickets);
    const createTicket = useStore((state) => state.createTicket);
    const fetchTicketMessages = useStore((state) => state.fetchTicketMessages);


    useEffect(() => {
        if (fetchTickets) {
            fetchTickets();
        }
    }, [fetchTickets]);

    const handleAccordionChange = (ticketId) => (event, isExpanded) => {
        setExpandedTicket(isExpanded ? ticketId : false);
        if (isExpanded && fetchTicketMessages) {
            fetchTicketMessages(ticketId);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (createTicket) {
            const success = await createTicket({ subject, message, category });
            if (success) {
                setSubject('');
                setMessage('');
                setCategory('General Inquiry');
            }
        }
    };
    
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
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
                    Trung Tâm Hỗ Trợ
                </Typography>
                <Grid container spacing={5}>
                    <Grid item xs={12} md={5}>
                         <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Gửi yêu cầu mới</Typography>
                             <Box component="form" onSubmit={handleSubmit}>
                                 <TextField fullWidth margin="normal" label="Chủ đề" value={subject} onChange={(e) => setSubject(e.target.value)} required variant="filled" sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }} />
                                 <FormControl fullWidth margin="normal" variant="filled" sx={{ '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' }, '& .MuiSelect-icon': { color: 'white' } }}>
                                     <InputLabel id="category-label">Phân loại</InputLabel>
                                     <Select
                                         labelId="category-label"
                                         value={category}
                                         onChange={(e) => setCategory(e.target.value)}
                                         sx={{ color: 'white' }}
                                     >
                                         <MenuItem value="General Inquiry">Vấn đề chung</MenuItem>
                                         <MenuItem value="Transaction Issue">Vấn đề giao dịch</MenuItem>
                                         <MenuItem value="Account Problem">Vấn đề tài khoản</MenuItem>
                                         <MenuItem value="Bug Report">Báo lỗi</MenuItem>
                                     </Select>
                                 </FormControl>
                                 <TextField fullWidth margin="normal" label="Nội dung chi tiết" value={message} onChange={(e) => setMessage(e.target.value)} required multiline rows={6} variant="filled" sx={{ textarea: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }} />
                                 <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: 'bold' }} disabled={ticketsLoading}>
                                     {ticketsLoading ? <CircularProgress size={24} color="inherit" /> : 'Gửi yêu cầu'}
                                 </Button>
                             </Box>
                         </Paper>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Các yêu cầu của bạn</Typography>
                            {ticketsLoading && (!tickets || tickets.length === 0) ? <Box sx={{textAlign: 'center'}}><CircularProgress color="inherit"/></Box> : null}
                            {tickets && tickets.length > 0 ? (
                                tickets.map(ticket => (
                                    <Accordion
                                        key={ticket._id}
                                        expanded={expandedTicket === ticket._id}
                                        onChange={handleAccordionChange(ticket._id)}
                                        sx={{ background: 'rgba(0,0,0,0.2)', color: 'white', mb: 1, '&:before': { display: 'none' } }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color: 'white'}} />}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Typography sx={{ fontWeight: 'bold' }}>{ticket.subject}</Typography>
                                                <Chip label={ticket.status} color={getStatusChipColor(ticket.status)} size="small" />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ background: 'rgba(0,0,0,0.1)', p: 2 }}>
                                             {expandedTicket === ticket._id && <TicketConversation ticketId={ticket._id} />}
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            ) : !ticketsLoading && (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <ConfirmationNumberIcon sx={{ fontSize: 60, color: 'grey.700' }} />
                                    <Typography variant="h6" sx={{ mt: 2 }}>Bạn chưa có yêu cầu hỗ trợ nào.</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default SupportTicketPage;