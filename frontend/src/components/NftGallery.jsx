import React from 'react';
import useStore from '../store/useStore';
import {
    Typography, Grid, Card, CardMedia, CardContent,
    CardActions, Button, Box, Skeleton
} from '@mui/material';

// --- Skeleton Component for Loading State ---
const NftCardSkeleton = () => (
    // SỬA LỖI: Cập nhật cú pháp MUI Grid v2 (bỏ 'item')
    <Grid xs={12} sm={6} md={4} lg={3}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #2c3e50, #273344)', borderRadius: 4 }}>
            <Skeleton variant="rectangular" sx={{ aspectRatio: '1 / 1', bgcolor: 'grey.800' }} />
            <CardContent>
                <Skeleton variant="text" sx={{ fontSize: '1.2rem', bgcolor: 'grey.700' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem', bgcolor: 'grey.700' }} width="60%" />
            </CardContent>
        </Card>
    </Grid>
);


// --- Main Component ---
function NftGallery() {
    // --- SỬA LỖI: Tách ra thành các hooks nhỏ để tránh vòng lặp render. Bỏ shallow. ---
    const portfolioData = useStore((state) => state.portfolio.data);
    const portfolioLoading = useStore((state) => state.portfolio.loading);
    
    // Sử dụng optional chaining để lấy nfts một cách an toàn
    const nfts = portfolioData?.nftHoldings || [];

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'white', mb: 3 }}>
                Bộ sưu tập NFT
            </Typography>
            {portfolioLoading && !portfolioData ? (
                <Grid container spacing={3}>
                    {[...Array(4)].map((_, index) => <NftCardSkeleton key={index} />)}
                </Grid>
            ) : nfts.length > 0 ? (
                <Grid container spacing={3}>
                    {nfts.map((nft, index) => (
                        // SỬA LỖI: Cập nhật cú pháp MUI Grid v2 (bỏ 'item')
                        <Grid xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #2c3e50, #273344)', color: 'white', borderRadius: 4 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ aspectRatio: '1 / 1' }}
                                    image={nft.imageUrl || 'https://via.placeholder.com/300'}
                                    alt={nft.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h2" noWrap sx={{ fontWeight: 'bold' }}>
                                        {nft.name}
                                    </Typography>
                                    <Typography variant="body2" color="#bdc3c7">
                                        {nft.collection}
                                    </Typography>
                                    <Typography variant="body2" color="white" sx={{ mt: 1, fontWeight: 'bold' }}>
                                        Giá sàn: {nft.floorPrice} ETH
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" href={nft.openseaUrl} target="_blank" rel="noopener noreferrer">
                                        Xem trên OpenSea
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography sx={{ color: '#95a5a6', mt: 3 }}>Bạn không sở hữu NFT nào trong ví này.</Typography>
            )}
        </Box>
    );
}

export default NftGallery;

