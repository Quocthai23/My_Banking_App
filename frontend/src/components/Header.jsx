import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';
// shallow không còn cần thiết khi bạn đã chia nhỏ các hook
// import { shallow } from 'zustand/shallow';
import WalletConnector from './WalletConnector.jsx';

// Material-UI Components
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon, Divider, Badge, Tooltip } from '@mui/material';

// Icons
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SecurityIcon from '@mui/icons-material/Security';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AltRouteIcon from '@mui/icons-material/AltRoute';

const Header = () => {
    // --- SỬA LỖI: TẤT CẢ LOGIC VÀ HOOKS PHẢI NẰM TRONG COMPONENT ---

    // 1. Gọi các hook để lấy state từ store (đã sửa lỗi vòng lặp)
    const user = useStore((state) => state.auth.user);
    const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
    const logout = useStore((state) => state.auth.logout);
    const notifications = useStore((state) => state.notifications.list);
    const unreadCount = useStore((state) => state.notifications.unreadCount);
    const markAsRead = useStore((state) => state.markNotificationAsRead);

    // 2. Gọi các hook khác của React
    const navigate = useNavigate();
    const [accountMenuAnchorEl, setAccountMenuAnchorEl] = useState(null);
    const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] = useState(null);
    const [defiMenuAnchorEl, setDefiMenuAnchorEl] = useState(null);

    // 3. Logic và các hàm xử lý sự kiện
    const isAccountMenuOpen = Boolean(accountMenuAnchorEl);
    const isNotificationMenuOpen = Boolean(notificationMenuAnchorEl);
    const isDefiMenuOpen = Boolean(defiMenuAnchorEl);

    const handleAccountMenuOpen = (event) => setAccountMenuAnchorEl(event.currentTarget);
    const handleAccountMenuClose = () => setAccountMenuAnchorEl(null);

    const handleNotificationMenuOpen = (event) => setNotificationMenuAnchorEl(event.currentTarget);
    const handleNotificationMenuClose = () => setNotificationMenuAnchorEl(null);

    const handleDefiMenuOpen = (event) => setDefiMenuAnchorEl(event.currentTarget);
    const handleDefiMenuClose = () => setDefiMenuAnchorEl(null);

    const handleLogout = () => {
        if (logout) logout();
        handleAccountMenuClose();
        navigate('/login');
    };

    const handleNotificationClick = (notification) => {
        if (markAsRead && !notification.isRead) {
            markAsRead(notification._id);
        }
        handleNotificationMenuClose();
    };

    // 4. Trả về JSX
    return (
        <AppBar position="sticky" color="transparent" elevation={1} sx={{ top: 0, zIndex: 1100, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(18, 18, 18, 0.7)' }}>
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    MyBank
                </Typography>

                {isAuthenticated && user && (
                    <Box>
                        <Button component={Link} to="/dashboard" color="inherit">Dashboard</Button>
                        <Button component={Link} to="/accounts" color="inherit">Tài khoản</Button>
                        <Button component={Link} to="/transfer" color="inherit">Chuyển tiền</Button>

                        <Button color="inherit" onClick={handleDefiMenuOpen}>
                            DeFi
                        </Button>
                        <Menu
                            anchorEl={defiMenuAnchorEl}
                            open={isDefiMenuOpen}
                            onClose={handleDefiMenuClose}
                        >
                            <MenuItem component={Link} to="/swap" onClick={handleDefiMenuClose}><ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon>Hoán đổi (Swap)</MenuItem>
                            <MenuItem component={Link} to="/bridge" onClick={handleDefiMenuClose}><ListItemIcon><AltRouteIcon fontSize="small" /></ListItemIcon>Cầu nối (Bridge)</MenuItem>
                            <MenuItem component={Link} to="/staking" onClick={handleDefiMenuClose}><ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>Đặt cược (Staking)</MenuItem>
                            <MenuItem component={Link} to="/loans" onClick={handleDefiMenuClose}><ListItemIcon><MonetizationOnIcon fontSize="small" /></ListItemIcon>Vay (Loans)</MenuItem>
                            <MenuItem component={Link} to="/governance" onClick={handleDefiMenuClose}><ListItemIcon><GavelIcon fontSize="small" /></ListItemIcon>Quản trị</MenuItem>
                            <MenuItem component={Link} to="/strategy-vaults" onClick={handleDefiMenuClose}><ListItemIcon><AccountBalanceWalletIcon fontSize="small" /></ListItemIcon>Strategy Vaults</MenuItem>
                        </Menu>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <WalletConnector />

                {isAuthenticated && user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <Tooltip title="Thông báo">
                            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={notificationMenuAnchorEl}
                            open={isNotificationMenuOpen}
                            onClose={handleNotificationMenuClose}
                            PaperProps={{ sx: { mt: 1.5, maxHeight: 400, width: '350px' } }}
                        >
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <MenuItem key={notif._id} onClick={() => handleNotificationClick(notif)} sx={{ fontWeight: notif.isRead ? 'normal' : 'bold', whiteSpace: 'normal' }}>
                                        {notif.message}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>Không có thông báo mới</MenuItem>
                            )}
                        </Menu>

                        <Tooltip title="Tài khoản">
                            <IconButton onClick={handleAccountMenuOpen} size="small" sx={{ ml: 2 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>{user.username?.charAt(0).toUpperCase()}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={accountMenuAnchorEl}
                            open={isAccountMenuOpen}
                            onClose={handleAccountMenuClose}
                            PaperProps={{
                                sx: {
                                    overflow: 'visible', mt: 1.5,
                                    '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem component={Link} to="/profile" onClick={handleAccountMenuClose}><ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>Hồ sơ</MenuItem>
                            {user.role === 'admin' && (
                                <MenuItem component={Link} to="/admin" onClick={handleAccountMenuClose}><ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>Trang quản trị</MenuItem>
                            )}
                            <Divider />
                            <MenuItem component={Link} to="/invoices" onClick={handleAccountMenuClose}><ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>Hóa đơn</MenuItem>
                            <MenuItem component={Link} to="/support" onClick={handleAccountMenuClose}><ListItemIcon><SupportAgentIcon fontSize="small" /></ListItemIcon>Hỗ trợ</MenuItem>
                            <MenuItem component={Link} to="/referral" onClick={handleAccountMenuClose}><ListItemIcon><CardGiftcardIcon fontSize="small" /></ListItemIcon>Giới thiệu</MenuItem>
                            <MenuItem component={Link} to="/tiers" onClick={handleAccountMenuClose}><ListItemIcon><WorkspacePremiumIcon fontSize="small" /></ListItemIcon>Cấp bậc</MenuItem>
                            <MenuItem component={Link} to="/api-keys" onClick={handleAccountMenuClose}><ListItemIcon><VpnKeyIcon fontSize="small" /></ListItemIcon>Khóa API</MenuItem>
                            <MenuItem component={Link} to="/scheduled-transactions" onClick={handleAccountMenuClose}><ListItemIcon><ScheduleIcon fontSize="small" /></ListItemIcon>Giao dịch định kỳ</MenuItem>
                            <MenuItem component={Link} to="/settings" onClick={handleAccountMenuClose}><ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Cài đặt</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}><ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Đăng xuất</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box>
                        <Button color="inherit" component={Link} to="/login">Đăng nhập</Button>
                        <Button color="primary" variant="contained" component={Link} to="/register" sx={{ ml: 2 }}>Đăng ký</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
