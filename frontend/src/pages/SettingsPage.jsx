import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import {
    Box, Container, Typography, Paper, Grid, TextField, Button,
    Avatar, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, IconButton, Tooltip, Divider,
    List, ListItem, ListItemIcon, ListItemText, Switch, Badge, Tabs, Tab, Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    DeleteForever as DeleteForeverIcon,
    VpnKey as VpnKeyIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Notifications as NotificationsIcon,
    Palette as PaletteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// --- STYLED COMPONENTS ---
const SettingsPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    background: 'rgba(30, 30, 30, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: theme.palette.common.white,
}));

// --- TAB PANELS ---
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

// --- SETTINGS TABS ---
const ProfileSettingsTab = () => {
    const user = useStore((state) => state.auth.user);
    const updateProfile = useStore((state) => state.updateProfile);
    const isLoading = useStore((state) => state.settingsLoading);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });
     
    useEffect(() => {
        if (user) {
            setFormData({ username: user.username || '', email: user.email || '' });
        }
    }, [user]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleUpdateProfile = async () => {
        const success = await updateProfile(formData);
        if (success) setIsEditing(false);
    };

    return (
        <SettingsPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Thông tin cá nhân</Typography>
                {!isEditing && (
                    <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => setIsEditing(true)} sx={{color: 'primary.light'}}><EditIcon /></IconButton>
                    </Tooltip>
                )}
            </Box>
             {isEditing ? (
                <Box component="form" noValidate autoComplete="off">
                    <TextField fullWidth margin="normal" label="Tên đăng nhập" name="username" value={formData.username} onChange={handleInputChange} />
                    <TextField fullWidth margin="normal" label="Email" name="email" value={formData.email} onChange={handleInputChange} />
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleUpdateProfile} disabled={isLoading}>{isLoading ? <CircularProgress size={24}/> : 'Lưu'}</Button>
                        <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)}>Hủy</Button>
                    </Box>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography color="text.secondary">Tên đăng nhập</Typography>
                        <Typography>{user.username}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography color="text.secondary">Email</Typography>
                        <Typography>{user.email}</Typography>
                    </Grid>
                </Grid>
            )}
        </SettingsPaper>
    );
};

const SecuritySettingsTab = () => {
    const changePassword = useStore((state) => state.changePassword);
    const addNotification = useStore((state) => state.addNotification);
    const isLoading = useStore((state) => state.settingsLoading);
    
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification('Mật khẩu mới không khớp.', 'error');
            return;
        }
        const success = await changePassword(passwordData);
        if (success) {
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    };
    
    return (
         <SettingsPaper>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Bảo mật</Typography>
            <Typography variant="subtitle1" gutterBottom>Đổi mật khẩu</Typography>
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid item xs={12} md={4}><TextField fullWidth type="password" label="Mật khẩu hiện tại" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth type="password" label="Mật khẩu mới" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField fullWidth type="password" label="Xác nhận mật khẩu mới" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} size="small" /></Grid>
            </Grid>
            <Button variant="contained" color="secondary" startIcon={<VpnKeyIcon />} onClick={handleUpdatePassword} disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}>
                {isLoading ? <CircularProgress size={24}/> : 'Cập nhật mật khẩu'}
            </Button>
        </SettingsPaper>
    );
};

const DangerZoneTab = () => {
    const deleteAccount = useStore((state) => state.deleteAccount);
    const isLoading = useStore((state) => state.settingsLoading);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    const handleDelete = async () => {
        await deleteAccount();
        setDeleteDialogOpen(false); // Dialog sẽ tự đóng nếu user bị logout
    };
    
    return (
        <>
            <SettingsPaper>
                <Typography variant="h6" color="error.light" sx={{fontWeight: 'bold'}}>Vùng nguy hiểm</Typography>
                <Typography variant="body2" color="text.secondary" sx={{my: 1}}>Khi bạn xóa tài khoản, hành động này không thể được khôi phục.</Typography>
                <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={() => setDeleteDialogOpen(true)}>
                    Xóa tài khoản của tôi
                </Button>
            </SettingsPaper>
            
            <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { background: '#1e1e1e', color: 'white', borderRadius: 2 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Xác nhận Xóa Tài khoản</DialogTitle>
                <DialogContent>
                    <DialogContentText color="text.secondary">
                        Bạn có chắc chắn muốn xóa tài khoản của mình không? Hành động này không thể được hoàn tác và tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 16px' }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleDelete} variant="contained" color="error" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Tôi chắc chắn, Xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


// --- COMPONENT CHÍNH ---
const SettingsPage = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (event, newValue) => setTabIndex(newValue);
    
    const user = useStore((state) => state.auth.user);

    if (!user) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                    Cài đặt & Quản lý tài khoản
                </Typography>
                <Typography color="text.secondary" sx={{mb: 4}}>Quản lý thông tin cá nhân, bảo mật và các cài đặt khác tại đây.</Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={3}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            value={tabIndex}
                            onChange={handleTabChange}
                            textColor="inherit"
                            indicatorColor="primary"
                            sx={{
                                borderRight: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    alignItems: 'flex-start',
                                    padding: '12px 24px',
                                },
                                '& .Mui-selected': {
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                }
                            }}
                        >
                            <Tab icon={<PersonIcon />} iconPosition="start" label="Hồ sơ" />
                            <Tab icon={<SecurityIcon />} iconPosition="start" label="Bảo mật" />
                            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Thông báo" disabled />
                            <Tab icon={<PaletteIcon />} iconPosition="start" label="Giao diện" disabled />
                            <Tab icon={<DeleteForeverIcon />} iconPosition="start" label="Vùng nguy hiểm" />
                        </Tabs>
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <TabPanel value={tabIndex} index={0}><ProfileSettingsTab /></TabPanel>
                        <TabPanel value={tabIndex} index={1}><SecuritySettingsTab /></TabPanel>
                        {/* Tab 2 & 3 disabled */}
                        <TabPanel value={tabIndex} index={4}><DangerZoneTab /></TabPanel>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default SettingsPage;
