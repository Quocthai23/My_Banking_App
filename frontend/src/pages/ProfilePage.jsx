import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import {
    Box, Container, Typography, Paper, Grid, TextField, Button,
    Avatar, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, IconButton, Tooltip, Divider,
    List, ListItem, ListItemIcon, ListItemText, Switch, Badge
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    DeleteForever as DeleteForeverIcon,
    VpnKey as VpnKeyIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    NotificationsActive as NotificationsActiveIcon,
    Devices as DevicesIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// --- STYLED COMPONENTS ---
// Paper component với hiệu ứng kính mờ (glassmorphism)
const ProfilePaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    background: 'rgba(30, 30, 30, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: theme.palette.common.white,
    marginBottom: theme.spacing(3),
    height: '100%',
}));

// Badge cho trạng thái online trên Avatar
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));


const ProfilePage = () => {
    // Lấy state từ Zustand store
    const user = useStore((state) => state.auth.user);
    const refreshUser = useStore((state) => state.refreshUser);
    const addNotification = useStore((state) => state.addNotification);

    // State của component
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Đồng bộ form data với dữ liệu user
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
            });
            // Giả lập trạng thái 2FA
            setIs2FAEnabled(user.is2FAEnabled || false);
        }
    }, [user]);

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        console.log('Updating profile with:', formData);
        await new Promise(resolve => setTimeout(resolve, 1500));
        addNotification('Chức năng đang được phát triển.', 'info');
        setIsEditing(false);
        setIsLoading(false);
    };
    
    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification('Mật khẩu mới không khớp.', 'error');
            return;
        }
        if(!passwordData.newPassword || !passwordData.currentPassword) {
            addNotification('Vui lòng điền đầy đủ thông tin mật khẩu.', 'warning');
            return;
        }
        setIsLoading(true);
        console.log('Updating password...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        addNotification('Chức năng đang được phát triển.', 'info');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsLoading(false);
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        console.log('Deleting account...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        addNotification('Chức năng đang được phát triển.', 'info');
        setDeleteDialogOpen(false);
        setIsLoading(false);
    };

    // Dữ liệu giả cho hoạt động gần đây
    const recentActivity = [
        { icon: <DevicesIcon />, text: 'Đăng nhập từ Chrome trên Windows', time: 'Hôm nay, 18:30' },
        { icon: <VpnKeyIcon />, text: 'Yêu cầu đổi mật khẩu', time: 'Hôm qua, 20:15' },
        { icon: <DevicesIcon />, text: 'Đăng nhập từ Safari trên MacOS', time: '15/09/2025, 10:00' },
    ];

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <CircularProgress color="primary"/>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 5, minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>
                    Quản lý tài khoản
                </Typography>

                <Grid container spacing={4}>
                    {/* Cột trái: Thẻ thông tin User */}
                    <Grid item xs={12} md={4}>
                        <ProfilePaper>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <StyledBadge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                >
                                    <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '3.5rem', margin: 'auto' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                </StyledBadge>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{user.username}</Typography>
                                <Typography color="text.secondary">{user.email}</Typography>
                                <Typography variant="caption" color="text.secondary">Tham gia ngày: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</Typography>
                            </Box>
                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2 }}>Hoạt động gần đây</Typography>
                                <List dense>
                                    {recentActivity.map((activity, index) => (
                                        <ListItem key={index} disableGutters>
                                            <ListItemIcon sx={{minWidth: '40px', color: 'primary.light'}}>
                                                {activity.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={activity.text} 
                                                secondary={activity.time} 
                                                primaryTypographyProps={{ fontSize: '0.9rem', color: 'white' }}
                                                secondaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </ProfilePaper>
                    </Grid>

                    {/* Cột phải: Cài đặt */}
                    <Grid item xs={12} md={8}>
                        {/* Mục chỉnh sửa hồ sơ */}
                        <ProfilePaper>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Thông tin cá nhân</Typography>
                                {!isEditing && (
                                     <Tooltip title="Chỉnh sửa">
                                        <IconButton onClick={() => setIsEditing(true)} sx={{color: 'primary.light'}}>
                                            <EditIcon />
                                        </IconButton>
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
                        </ProfilePaper>

                        {/* Mục Bảo mật */}
                        <ProfilePaper>
                             <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Bảo mật</Typography>
                             
                             <Typography variant="subtitle1" gutterBottom>Đổi mật khẩu</Typography>
                             <Grid container spacing={2} sx={{mb: 3}}>
                                <Grid item xs={12} md={4}><TextField fullWidth type="password" label="Mật khẩu hiện tại" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} size="small" /></Grid>
                                <Grid item xs={12} md={4}><TextField fullWidth type="password" label="Mật khẩu mới" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} size="small" /></Grid>
                                <Grid item xs={12} md={4}><TextField fullWidth type="password" label="Xác nhận mật khẩu mới" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} size="small" /></Grid>
                             </Grid>
                             <Button variant="contained" color="secondary" startIcon={<VpnKeyIcon />} onClick={handleUpdatePassword} disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}>Cập nhật mật khẩu</Button>

                             <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

                             <ListItem disablePadding>
                                <ListItemIcon sx={{color: 'primary.light'}}><SecurityIcon/></ListItemIcon>
                                <ListItemText primary="Xác thực hai yếu tố (2FA)" secondary="Tăng cường bảo mật cho tài khoản của bạn" primaryTypographyProps={{ color: 'white' }} secondaryTypographyProps={{color: 'text.secondary'}} />
                                <Switch edge="end" checked={is2FAEnabled} onChange={(e) => {
                                    setIs2FAEnabled(e.target.checked);
                                    addNotification('Chức năng đang được phát triển.', 'info');
                                }}/>
                             </ListItem>

                             <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
                             
                             <Box>
                                <Typography variant="subtitle1" color="error.light" sx={{fontWeight: 'bold'}}>Vùng nguy hiểm</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb:2}}>Khi bạn xóa tài khoản, hành động này không thể được khôi phục.</Typography>
                                <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={() => setDeleteDialogOpen(true)}>
                                    Xóa tài khoản của tôi
                                </Button>
                             </Box>
                        </ProfilePaper>
                    </Grid>
                </Grid>
            </Container>

            {/* Dialog xác nhận xóa tài khoản */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { background: '#1e1e1e', color: 'white', borderRadius: 2 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Xác nhận Xóa Tài khoản</DialogTitle>
                <DialogContent>
                    <DialogContentText color="text.secondary">
                        Bạn có chắc chắn muốn xóa tài khoản của mình không? Hành động này không thể được hoàn tác và tất cả dữ liệu của bạn sẽ bị mất vĩnh viễn.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 16px' }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleDeleteAccount} variant="contained" color="error" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Tôi chắc chắn, Xóa'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;