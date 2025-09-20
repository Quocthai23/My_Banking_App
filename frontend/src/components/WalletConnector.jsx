import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import { Button, Chip, Box, CircularProgress, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const WalletConnector = () => {
    // Lấy state và actions từ store
    const walletAddress = useStore((state) => state.wallet.address);
    const isWalletLinked = useStore((state) => state.wallet.isLinked);
    const loading = useStore((state) => state.wallet.loading);
    const connectWallet = useStore((state) => state.connectWallet);
    const disconnectWallet = useStore((state) => state.disconnectWallet);
    // Hàm linkWallet không cần được gọi trực tiếp từ component nữa
    // const linkWallet = useStore((state) => state.linkWallet); 

    useEffect(() => {
        // Lắng nghe sự kiện thay đổi tài khoản từ Metamask
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    if (connectWallet) connectWallet();
                } else {
                    if (disconnectWallet) disconnectWallet();
                }
            };
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [connectWallet, disconnectWallet]);
    
    // --- SỬA LỖI: Đã xóa bỏ useEffect gọi linkWallet ở đây ---
    // Logic liên kết ví giờ đã được xử lý hoàn toàn bên trong action `connectWallet` trong `walletSlice.js`
    // để tránh việc gọi API trùng lặp.


    const handleConnect = () => {
        if (connectWallet) connectWallet();
    };

    const handleDisconnect = () => {
        if (disconnectWallet) disconnectWallet();
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} color="inherit" />
            </Box>
        );
    }

    if (walletAddress) {
        return (
            <Tooltip title={`Địa chỉ ví: ${walletAddress}`}>
                <Chip
                    icon={<AccountBalanceWalletIcon />}
                    label={isWalletLinked ? `Đã liên kết: ${formatAddress(walletAddress)}` : formatAddress(walletAddress)}
                    onDelete={handleDisconnect}
                    color={isWalletLinked ? "success" : "warning"}
                    variant="outlined"
                    sx={{ color: 'white', borderColor: isWalletLinked ? 'success.main' : 'warning.main' }}
                />
            </Tooltip>
        );
    }

    return (
        <Button
            color="secondary"
            variant="contained"
            onClick={handleConnect}
            startIcon={<AccountBalanceWalletIcon />}
        >
            Kết nối ví
        </Button>
    );
};

export default WalletConnector;