import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Factory as FactoryIcon } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          minWidth: 300,
        }}
      >
        <FactoryIcon sx={{ fontSize: 60, mb: 2, color: 'rgba(255, 255, 255, 0.9)' }} />
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Andon System
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ opacity: 0.8, mb: 3 }}>
          TEKCOM Manufacturing
        </Typography>
        
        <CircularProgress 
          size={40} 
          thickness={4}
          sx={{ 
            color: 'white',
            mb: 2,
          }} 
        />
        
        <Typography variant="body1" sx={{ opacity: 0.7 }}>
          Đang khởi tạo hệ thống...
        </Typography>
        
        <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 1 }}>
          Kết nối database và tải dữ liệu
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoadingScreen; 