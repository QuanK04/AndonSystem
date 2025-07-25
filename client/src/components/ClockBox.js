import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const getFormattedTime = () => {
  const now = new Date();
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const day = days[now.getDay()];
  const date = now.toLocaleDateString('vi-VN');
  const time = now.toLocaleTimeString('vi-VN', { hour12: false });
  return `${day}, ${date} - ${time}`;
};

const ClockBox = () => {
  const [now, setNow] = useState(getFormattedTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getFormattedTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        px: 2,
        py: 0.5,
        borderRadius: 2,
        bgcolor: 'rgb(255, 255, 255)',
        display: 'flex',
        alignItems: 'center',
        minWidth: 220,
        justifyContent: 'center',
        boxShadow: 1,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 1 }}>
        {now}
      </Typography>
    </Box>
  );
};

export default ClockBox; 