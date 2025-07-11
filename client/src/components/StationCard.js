import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

const StationCard = ({ station, position = 'center' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const socket = useSocket();

  if (!station) {
    return (
      <Card sx={{ 
        height: 120, 
        opacity: 0.5,
        background: 'rgba(0,0,0,0.05)',
        border: '2px dashed rgba(0,0,0,0.2)',
      }}>
        <CardContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
        }}>
          <Typography variant="body2" color="text.secondary">
            Không có dữ liệu
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (station.status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'maintenance':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (station.status) {
      case 'normal':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'maintenance':
        return <BuildIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getStatusText = () => {
    switch (station.status) {
      case 'normal':
        return 'Bình thường';
      case 'warning':
        return 'Cảnh báo';
      case 'error':
        return 'Lỗi';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Không xác định';
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    if (socket) {
      socket.emit('update_station_status', {
        station_id: station.id,
        status: newStatus
      });
    }
    handleMenuClose();
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top-left':
        return { borderTopLeftRadius: 16 };
      case 'top-center':
        return { borderTop: '3px solid #1976d2' };
      case 'top-right':
        return { borderTopRightRadius: 16 };
      case 'bottom-left':
        return { borderBottomLeftRadius: 16 };
      case 'bottom-center':
        return { borderBottom: '3px solid #1976d2' };
      case 'bottom-right':
        return { borderBottomRightRadius: 16 };
      default:
        return {};
    }
  };

  return (
    <Card 
      sx={{ 
        height: 120,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: station.active_alerts > 0 ? '2px solid #ff9800' : '2px solid transparent',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        ...getPositionStyle(),
      }}
      elevation={station.active_alerts > 0 ? 4 : 1}
    >
      <CardContent sx={{ p: 2, height: '100%', position: 'relative' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {station.name}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            sx={{ p: 0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={getStatusColor()}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
          {station.active_alerts > 0 && (
            <Chip
              label={`${station.active_alerts} cảnh báo`}
              color="warning"
              size="small"
              sx={{ ml: 1, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* Description */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {station.description}
        </Typography>

        {/* Code */}
        <Typography variant="caption" sx={{ 
          position: 'absolute', 
          bottom: 8, 
          right: 8,
          fontWeight: 600,
          color: 'primary.main',
        }}>
          {station.code}
        </Typography>

        {/* Menu */}
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
          <MenuItem onClick={() => handleStatusChange('normal')}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Bình thường
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('warning')}>
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            Cảnh báo
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('error')}>
            <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
            Lỗi
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('maintenance')}>
            <BuildIcon sx={{ mr: 1, color: 'info.main' }} />
            Bảo trì
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default StationCard; 