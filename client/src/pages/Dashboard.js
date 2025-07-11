import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import StationCard from '../components/StationCard';
import AlertList from '../components/AlertList';
import StatisticsCards from '../components/StatisticsCards';
import CreateAlertDialog from '../components/CreateAlertDialog';

const Dashboard = () => {
  const { stations, alerts, statistics } = useData();
  const socket = useSocket();
  const [createAlertOpen, setCreateAlertOpen] = useState(false);

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  const getStatusCount = (status) => {
    return stations.filter(station => station.status === status).length;
  };

  const handleRefresh = () => {
    if (socket) {
      socket.emit('request_stations');
      socket.emit('request_alerts');
    }
  };

  const handleCreateAlert = () => {
    setCreateAlertOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            🏭 Dashboard Sản Xuất
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Giám sát thời gian thực hệ thống Andon TEKCOM
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateAlert}
            sx={{ borderRadius: 2 }}
          >
            Tạo Cảnh Báo
          </Button>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={handleRefresh} sx={{ borderRadius: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="h6" gutterBottom>
            ⚠️ Cảnh báo nghiêm trọng!
          </Typography>
          <Typography variant="body2">
            Có {criticalAlerts.length} cảnh báo nghiêm trọng cần xử lý ngay lập tức.
          </Typography>
        </Alert>
      )}

      {/* Statistics Cards */}
      <StatisticsCards statistics={statistics} />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Factory Layout */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FactoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Sơ Đồ Xưởng Sản Xuất
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label={`Bình thường: ${getStatusCount('normal')}`} 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    icon={<WarningIcon />} 
                    label={`Cảnh báo: ${getStatusCount('warning')}`} 
                    color="warning" 
                    size="small" 
                  />
                  <Chip 
                    icon={<ErrorIcon />} 
                    label={`Lỗi: ${getStatusCount('error')}`} 
                    color="error" 
                    size="small" 
                  />
                  <Chip 
                    icon={<BuildIcon />} 
                    label={`Bảo trì: ${getStatusCount('maintenance')}`} 
                    color="info" 
                    size="small" 
                  />
                </Box>
              </Box>

              {/* Factory Layout Grid */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 3,
                  position: 'relative',
                  minHeight: 400,
                }}
              >
                <Grid container spacing={2}>
                  {/* Row 1: CNC, Dán cạnh, Khoan lỗ */}
                  <Grid item xs={4}>
                    <StationCard 
                      station={stations.find(s => s.code === 'CNC')} 
                      position="top-left"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <StationCard 
                      station={stations.find(s => s.code === 'EDGE')} 
                      position="top-center"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <StationCard 
                      station={stations.find(s => s.code === 'DRILL')} 
                      position="top-right"
                    />
                  </Grid>

                  {/* Conveyor Line */}
                  <Grid item xs={12}>
                    <Box 
                      sx={{ 
                        height: 4, 
                        background: 'linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)',
                        borderRadius: 2,
                        my: 2,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: 0,
                          right: 0,
                          height: 8,
                          background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, #fff 20px, #fff 40px)',
                          borderRadius: 4,
                        }
                      }}
                    />
                  </Grid>

                  {/* Row 2: Lắp ráp, KCS, Đóng gói */}
                  <Grid item xs={4}>
                    <StationCard 
                      station={stations.find(s => s.code === 'ASSEMBLY')} 
                      position="bottom-left"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <StationCard 
                      station={stations.find(s => s.code === 'QC')} 
                      position="bottom-center"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <StationCard 
                      station={stations.find(s => s.code === 'PACK')} 
                      position="bottom-right"
                    />
                  </Grid>
                </Grid>

                {/* Legend */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <Typography variant="caption" color="text.secondary">
                    🟢 Bình thường | 🟡 Cảnh báo | 🔴 Lỗi | 🔵 Bảo trì
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" component="h2">
                  Cảnh Báo Đang Hoạt Động
                </Typography>
                <Chip 
                  label={activeAlerts.length} 
                  color="warning" 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {activeAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Không có cảnh báo nào đang hoạt động
                  </Typography>
                </Box>
              ) : (
                <AlertList alerts={activeAlerts} maxHeight={400} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Alert Dialog */}
      <CreateAlertDialog 
        open={createAlertOpen} 
        onClose={() => setCreateAlertOpen(false)}
        stations={stations}
      />
    </Box>
  );
};

export default Dashboard; 