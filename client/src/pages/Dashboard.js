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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import StatisticsCards from '../components/StatisticsCards';
import axios from 'axios';

const Dashboard = () => {
  const { stations, statistics } = useData();
  const socket = useSocket();
  const [createAlertOpen, setCreateAlertOpen] = useState(false);

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

  const handleResetAllStations = async () => {
    if (!window.confirm('Bạn có chắc muốn đặt lại tất cả các trạm về trạng thái bình thường?')) return;
    try {
      await axios.post('/api/stations/reset-all');
      if (socket) {
        socket.emit('request_stations');
      }
    } catch (err) {
      alert('Có lỗi khi reset trạng thái các trạm!');
    }
  };

  // Tính tổng cảnh báo active từ các trạm
  const totalActiveAlerts = stations.reduce((sum, s) => sum + (parseInt(s.active_alerts, 10) || 0), 0);
  // Đếm số trạm theo trạng thái
  const totalNormalStations = stations.filter(s => s.status === 'normal').length;
  const totalWarningStations = stations.filter(s => s.status === 'warning').length;
  const totalErrorStations = stations.filter(s => s.status === 'error').length;
  const totalMaintenanceStations = stations.filter(s => s.status === 'maintenance').length;
  console.log('Stations:', stations);
  console.log('Tổng cảnh báo:', totalActiveAlerts);
  // Nhóm trạm theo khu và sắp xếp theo code tăng dần
  const sortByCode = (a, b) => a.code.localeCompare(b.code, undefined, { numeric: true });
  const khuSon = stations.filter(s => s.code.startsWith('S')).sort(sortByCode);
  const khuCarcass = stations.filter(s => s.code.startsWith('C')).sort(sortByCode);
  const khuDongGoi = stations.filter(s => s.code.startsWith('P')).sort(sortByCode);

  // Các trạm có trạng thái khác bình thường
  const abnormalStations = stations.filter(s => s.status !== 'normal');

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
            variant="contained"
            color="error"
            onClick={handleResetAllStations}
            sx={{ borderRadius: 2 }}
          >
            Reset trạng thái tất cả trạm
          </Button>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={handleRefresh} sx={{ borderRadius: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Critical Alerts Banner */}
      {/* Removed critical alerts logic */}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {totalNormalStations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm bình thường
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {totalWarningStations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm cảnh báo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                {totalErrorStations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm lỗi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                {totalMaintenanceStations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm bảo trì
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Factory Layout */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FactoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Sơ Đồ Nhà Máy
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label={`Bình thường: ${totalNormalStations}`} 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    icon={<WarningIcon />} 
                    label={`Cảnh báo: ${totalWarningStations}`} 
                    color="warning" 
                    size="small" 
                  />
                  <Chip 
                    icon={<ErrorIcon />} 
                    label={`Lỗi: ${totalErrorStations}`} 
                    color="error" 
                    size="small" 
                  />
                  <Chip 
                    icon={<BuildIcon />} 
                    label={`Bảo trì: ${totalMaintenanceStations}`} 
                    color="info" 
                    size="small" 
                  />
                </Box>
              </Box>

              {/* Khu Sơn */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Khu Sơn</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {khuSon.map(station => (
                  <Grid item xs={12} sm={6} md={3} key={station.code}>
                    <StationCard station={station} />
                  </Grid>
                ))}
              </Grid>

              {/* Khu Carcass */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Khu Carcass</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {khuCarcass.map(station => (
                  <Grid item xs={12} sm={6} md={3} key={station.code}>
                    <StationCard station={station} />
                  </Grid>
                ))}
              </Grid>

              {/* Khu Đóng Gói */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Khu Đóng Gói</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {khuDongGoi.map(station => (
                  <Grid item xs={12} sm={6} md={3} key={station.code}>
                    <StationCard station={station} />
                  </Grid>
                ))}
              </Grid>

              {/* Legend */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="caption" color="text.secondary">
                  🟢 Bình thường | 🟡 Cảnh báo | 🔴 Lỗi | 🔵 Bảo trì
                </Typography>
              </Box>
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
                  label={abnormalStations.length} 
                  color={abnormalStations.length > 0 ? 'warning' : 'success'} 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              {abnormalStations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Không có trạm nào đang ở trạng thái cảnh báo, lỗi hoặc bảo trì
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="center">Mã trạm</TableCell>
                        <TableCell>Tên trạm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {abnormalStations.map(station => (
                        <TableRow key={station.id}>
                          <TableCell align="center">
                            <Chip 
                              label={
                                station.status === 'warning' ? 'Cảnh báo' :
                                station.status === 'error' ? 'Lỗi' :
                                'Bảo trì'
                              }
                              color={
                                station.status === 'warning' ? 'warning' :
                                station.status === 'error' ? 'error' :
                                'info'
                              }
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={station.code} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {station.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {station.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Alert Dialog */}
    </Box>
  );
};

export default Dashboard; 