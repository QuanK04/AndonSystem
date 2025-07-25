import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ClockBox from './ClockBox';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectionStatus } = useData();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiIcon sx={{ color: 'success.main' }} />;
      case 'disconnected':
        return <WifiOffIcon sx={{ color: 'error.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <WifiIcon sx={{ color: 'warning.main' }} />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Đã kết nối';
      case 'disconnected':
        return 'Mất kết nối';
      case 'error':
        return 'Lỗi kết nối';
      default:
        return 'Đang kết nối...';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'disconnected':
      case 'error':
        return 'error';
      default:
        return 'warning';
    }
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/statistics', label: 'Thống kê', icon: <BarChartIcon /> },
    { path: '/settings', label: 'Cài đặt', icon: <SettingsIcon /> },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      }}
    >
      <Toolbar>
        {/* Logo và tên hệ thống */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 3,
            }}
          >
            🏭 Andon System
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
            }}
          >
            TEKCOM Manufacturing
          </Typography>
        </Box>

        {/* ClockBox */}
        <Box sx={{ mr: 2 }}>
          <ClockBox />
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          {navigationItems.map((item) => (
            <Tooltip key={item.path} title={item.label}>
              <Button
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            </Tooltip>
          ))}
        </Box>

        {/* Connection Status */}
        <Tooltip title={getConnectionStatusText()}>
          <Chip
            icon={getConnectionStatusIcon()}
            label={getConnectionStatusText()}
            color={getConnectionStatusColor()}
            size="small"
            sx={{ mr: 2, color: 'white' }}
          />
        </Tooltip>

        {/* Alerts Badge */}

        {/* User Menu */}
        <Tooltip title="Tài khoản">
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">Quản lý: Admin</Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">Vai trò: Supervisor</Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
            navigate('/settings');
          }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Cài đặt
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 