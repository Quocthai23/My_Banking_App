import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function CountdownTimer({ startTime, lockDurationInDays }) {

    // Sử dụng useMemo để tính toán unlockTimestamp một lần duy nhất khi props thay đổi
    const unlockTimestamp = useMemo(() => {
        if (!startTime || !lockDurationInDays) return null;
        const startDate = new Date(startTime);
        return startDate.getTime() + lockDurationInDays * 24 * 60 * 60 * 1000;
    }, [startTime, lockDurationInDays]);

    const calculateTimeLeft = () => {
        if (!unlockTimestamp) return {};

        const difference = unlockTimestamp - new Date().getTime();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                'ngày': Math.floor(difference / (1000 * 60 * 60 * 24)),
                'giờ': Math.floor((difference / (1000 * 60 * 60)) % 24),
                'phút': Math.floor((difference / 1000 / 60) % 60),
                'giây': Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        // Chỉ chạy timer nếu còn thời gian
        if (!unlockTimestamp || unlockTimestamp - new Date().getTime() < 0) {
            setTimeLeft({});
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [unlockTimestamp]);

    const timerComponents = Object.entries(timeLeft)
        .filter(([_, value]) => value > 0)
        .map(([interval, value]) => (
            <span key={interval}>
                {`${value} ${interval} `}
            </span>
        ));

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '48px' }}>
            <AccessTimeIcon sx={{ mr: 1.5, color: '#3498db' }} />
            <div>
                <Typography color="#bdc3c7">Thời gian mở khóa</Typography>
                <Typography variant="body1" component="p" sx={{ fontWeight: 'bold' }}>
                    {timerComponents.length > 0 ? timerComponents : <span>Sẵn sàng để Unstake!</span>}
                </Typography>
            </div>
        </Box>
    );
}

export default CountdownTimer;

