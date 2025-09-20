import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore.js';
import {
    Box, Typography, Paper, TextField, Button, CircularProgress,
    List, ListItem, ListItemText, IconButton, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Container,
    FormGroup, FormControlLabel, Checkbox, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

// NÂNG CẤP: Định nghĩa các quyền có sẵn
const AVAILABLE_PERMISSIONS = {
    'read:balance': 'Xem số dư',
    'read:transactions': 'Xem giao dịch',
    'write:transfer': 'Thực hiện chuyển khoản',
};

const ApiKeysPage = () => {
    const [label, setLabel] = useState('');
    const [newKey, setNewKey] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState({});

    // --- SỬA LỖI VÒNG LẶP: Chia nhỏ các hook useStore ---
    const apiKeys = useStore((state) => state.apiKeys);
    const apiKeysLoading = useStore((state) => state.apiKeysLoading);
    const fetchApiKeys = useStore((state) => state.fetchApiKeys);
    const createApiKey = useStore((state) => state.createApiKey);
    const deleteApiKey = useStore((state) => state.deleteApiKey);
    const addNotification = useStore((state) => state.addNotification);
    
    // NÂNG CẤP: Tự động tải danh sách khóa API
    useEffect(() => {
        if(fetchApiKeys) fetchApiKeys();
    }, [fetchApiKeys]);

    const handlePermissionChange = (event) => {
        setSelectedPermissions({
            ...selectedPermissions,
            [event.target.name]: event.target.checked,
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!label.trim()) {
            addNotification('Vui lòng nhập nhãn cho khóa API.', 'warning');
            return;
        }
        const permissions = Object.keys(selectedPermissions).filter(p => selectedPermissions[p]);
        const key = await createApiKey({ label, permissions });
        if (key) {
            setNewKey(key);
            setLabel('');
            setSelectedPermissions({});
        }
    };
    
    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        addNotification('Đã sao chép khóa API!', 'success');
    }
    
    const handleCloseDialog = () => setNewKey(null);

    return (
        <Box sx={{ background: 'linear-gradient(135deg, #16222A 0%, #2c3e50 100%)', color: 'white', py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>Quản lý Khóa API</Typography>

                <Paper elevation={6} sx={{ p: 4, mb: 5, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Tạo khóa API mới</Typography>
                    <Box component="form" onSubmit={handleCreate}>
                        <TextField
                            fullWidth
                            label="Nhãn cho khóa mới (ví dụ: 'Bot giao dịch')"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            variant="filled"
                            sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { backgroundColor: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#95a5a6' }, mb: 2 }}
                        />
                        <Typography color="#bdc3c7" sx={{ mb: 1 }}>Quyền hạn:</Typography>
                        <FormGroup sx={{ flexDirection: 'row', gap: 2, mb: 3 }}>
                            {Object.entries(AVAILABLE_PERMISSIONS).map(([key, desc]) => (
                                 <FormControlLabel
                                     key={key}
                                     control={<Checkbox name={key} checked={!!selectedPermissions[key]} onChange={handlePermissionChange} />}
                                     label={desc}
                                 />
                            ))}
                        </FormGroup>
                        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={apiKeysLoading} sx={{ py: 1.5, px: 4, width: '100%' }}>
                            {apiKeysLoading ? <CircularProgress size={24} color="inherit" /> : 'Tạo Khóa Mới'}
                        </Button>
                    </Box>
                </Paper>
                
                <Paper elevation={6} sx={{ p: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Các khóa hiện có</Typography>
                        {apiKeysLoading && apiKeys.length === 0 ? <CircularProgress color="inherit" /> : (
                            <List>
                                {apiKeys.length > 0 ? apiKeys.map((key) => (
                                    <ListItem
                                        key={key._id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => deleteApiKey(key._id)} sx={{color: '#e74c3c'}}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                        sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <VpnKeyIcon sx={{mr: 2, color: '#3498db'}}/>
                                            <ListItemText
                                                primary={key.label}
                                                secondary={`Gợi ý: ...${key.keyHint} | Lần cuối sử dụng: ${key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Chưa dùng'}`}
                                                primaryTypographyProps={{fontWeight: 'bold', color: 'white'}}
                                                secondaryTypographyProps={{color: '#bdc3c7', fontSize: '0.8rem'}}
                                            />
                                        </Box>
                                        <Box sx={{ pt: 1, pl: '40px' }}>
                                            {key.permissions.map(p => <Chip key={p} label={AVAILABLE_PERMISSIONS[p] || p} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)}
                                        </Box>
                                    </ListItem>
                                )) : <Typography color="#bdc3c7">Bạn chưa có khóa API nào.</Typography>}
                            </List>
                        )}
                </Paper>

                <Dialog open={Boolean(newKey)} onClose={handleCloseDialog} PaperProps={{ sx: { background: '#2c3e50', color: 'white', borderRadius: 4 } }}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Khóa API Mới Đã Được Tạo</DialogTitle>
                    <DialogContent>
                        <DialogContentText color="#bdc3c7" sx={{ mb: 2 }}>
                            Đây là lần duy nhất bạn có thể xem khóa này. Vui lòng sao chép và lưu trữ nó ở một nơi an toàn.
                        </DialogContentText>
                        <Box sx={{ p: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" component="code" sx={{ wordBreak: 'break-all', flexGrow: 1 }}>
                                {newKey}
                            </Typography>
                            <IconButton onClick={() => handleCopy(newKey)} size="small" sx={{color: 'white'}}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: '0 24px 16px' }}>
                        <Button onClick={handleCloseDialog} variant="contained">Tôi đã lưu lại</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ApiKeysPage;
