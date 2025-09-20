import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore.js';
// shallow không còn cần thiết và nên được loại bỏ
// import { shallow } from 'zustand/shallow';
import { Container, Typography, Box, TextField, Button, Paper, CircularProgress, Grid, Card, CardContent, CardActions, Chip, LinearProgress } from '@mui/material';

// --- Component con để tạo đề xuất mới ---
const CreateProposalForm = () => {
    const [description, setDescription] = useState('');
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const createProposal = useStore((state) => state.createProposal);
    const governanceLoading = useStore((state) => state.governance.loading);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim() || !createProposal) return;
        const success = await createProposal(description);
        if (success) {
            setDescription('');
        }
    };

    return (
        <Paper elevation={6} sx={{ p: 4, mb: 5, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', color: 'white' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tạo Đề xuất Mới
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Mô tả chi tiết đề xuất của bạn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    variant="filled"
                    sx={{ mb: 2, textarea: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' } }}
                />
                <Button type="submit" variant="contained" disabled={governanceLoading} size="large" sx={{ fontWeight: 'bold' }}>
                    {governanceLoading ? <CircularProgress size={24} color="inherit" /> : 'Gửi Đề xuất'}
                </Button>
            </Box>
        </Paper>
    );
};


// --- Component con để hiển thị một đề xuất ---
const ProposalCard = ({ proposal }) => {
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const voteOnProposal = useStore((state) => state.voteOnProposal);
    const governanceLoading = useStore((state) => state.governance.loading);

    const totalVotes = (proposal.forVotes || 0) + (proposal.againstVotes || 0);
    const forPercentage = totalVotes === 0 ? 0 : ((proposal.forVotes || 0) / totalVotes) * 100;

    const getStatusChip = (status) => {
        switch (status) {
            case 'Active': return <Chip label="Đang hoạt động" color="success" />;
            case 'Pending': return <Chip label="Đang chờ" color="warning" />;
            case 'Executed': return <Chip label="Đã thực thi" color="primary" />;
            case 'Defeated': return <Chip label="Thất bại" color="error" />;
            default: return <Chip label={status} />;
        }
    };
    
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ color: '#bdc3c7' }}>Đề xuất #{proposal.proposalId?.slice(0, 8)}...</Typography>
                    {getStatusChip(proposal.status)}
                </Box>
                <Typography variant="body1" sx={{ minHeight: '100px' }}>
                    {proposal.description}
                </Typography>
                <Box sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#2ecc71' }}>Đồng ý: {(proposal.forVotes || 0).toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ color: '#e74c3c' }}>Phản đối: {(proposal.againstVotes || 0).toLocaleString()}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={forPercentage} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { backgroundColor: '#2ecc71' }, backgroundColor: '#e74c3c' }} />
                </Box>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" variant="contained" color="success" onClick={() => voteOnProposal && voteOnProposal(proposal.proposalId, 1)} disabled={governanceLoading || proposal.status !== 'Active'}>
                    Đồng ý
                </Button>
                <Button size="small" variant="contained" color="error" onClick={() => voteOnProposal && voteOnProposal(proposal.proposalId, 0)} disabled={governanceLoading || proposal.status !== 'Active'}>
                    Phản đối
                </Button>
            </CardActions>
        </Card>
    );
};


// --- Component trang chính ---
function GovernancePage() {
    
    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore và bỏ shallow ---
    const proposals = useStore((state) => state.governance.proposals);
    const governanceLoading = useStore((state) => state.governance.loading);
    const fetchProposals = useStore((state) => state.fetchProposals);

    useEffect(() => {
        if (fetchProposals) {
            fetchProposals();
        }
    }, [fetchProposals]);

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
                    Quản trị
                </Typography>
                <CreateProposalForm />
                {governanceLoading && proposals.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress color="inherit" /></Box>
                ) : (
                    <Grid container spacing={4}>
                        {proposals.map((prop) => (
                            <Grid item key={prop.proposalId} xs={12} sm={6} md={4}>
                                <ProposalCard proposal={prop} />
                            </Grid>
                        ))}
                    </Grid>
                )}
                 { !governanceLoading && proposals.length === 0 && (
                    <Typography sx={{textAlign: 'center', mt: 5, color: '#bdc3c7'}}>Chưa có đề xuất nào được tạo.</Typography>
                 )}
            </Container>
        </Box>
    );
}

export default GovernancePage;
