import React from 'react';
import useStore from '../store/useStore';
import {
    Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Avatar, Box, Card, CardContent, Skeleton
} from '@mui/material';

function TokenHoldings() {
    // --- SỬA LỖI: Tách ra thành các hooks nhỏ để tránh vòng lặp render. Bỏ shallow. ---
    const portfolioData = useStore((state) => state.portfolio.data);
    const portfolioLoading = useStore((state) => state.portfolio.loading);

    const tokens = portfolioData?.tokenHoldings || [];

    // Component Skeleton cho trạng thái đang tải
    const LoadingSkeleton = () => (
        <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><Skeleton variant="text" sx={{ bgcolor: 'grey.800' }} /></TableCell>
                        <TableCell><Skeleton variant="text" sx={{ bgcolor: 'grey.800' }} /></TableCell>
                        <TableCell><Skeleton variant="text" sx={{ bgcolor: 'grey.800' }} /></TableCell>
                        <TableCell><Skeleton variant="text" sx={{ bgcolor: 'grey.800' }} /></TableCell>
                        <TableCell><Skeleton variant="text" sx={{ bgcolor: 'grey.800' }} /></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                         <TableRow key={i}>
                             <TableCell colSpan={5}><Skeleton variant="rectangular" height={40} sx={{ bgcolor: 'grey.800' }} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Card elevation={4} sx={{ background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Danh sách Token
                </Typography>
                {portfolioLoading && !portfolioData ? (
                    <LoadingSkeleton />
                ) : (
                    <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.1)' }}>Tài sản</TableCell>
                                    <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.1)' }}>Số dư</TableCell>
                                    <TableCell align="center" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.1)' }}>Loại</TableCell>
                                    <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.1)' }}>Giá</TableCell>
                                    <TableCell align="right" sx={{ color: '#bdc3c7', borderBottomColor: 'rgba(255,255,255,0.1)' }}>Giá trị</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tokens.length > 0 ? tokens.map((token) => (
                                    <TableRow key={token.address + token.type}>
                                        <TableCell component="th" scope="row" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={token.logo} sx={{ width: 32, height: 32, mr: 2, bgcolor: '#34495e' }}>{token.symbol.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{token.symbol}</Typography>
                                                    <Typography variant="body2" color="#95a5a6">{token.name}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{parseFloat(token.amount).toFixed(4)}</TableCell>
                                        <TableCell align="center" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>{token.type === 'wallet' ? 'Trong ví' : 'Đang Stake'}</TableCell>
                                        <TableCell align="right" sx={{ color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>${parseFloat(token.price).toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'medium', color: 'white', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                                            ${parseFloat(token.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ color: '#95a5a6', borderBottom: 'none', py: 5 }}>
                                            Không có dữ liệu token để hiển thị.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    );
}

export default TokenHoldings;
