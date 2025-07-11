import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';

const Statistics = () => {
  const { alerts, stations, statistics } = useData();
  const socket = useSocket();
  const [timeRange, setTimeRange] = useState('7');

  const handleRefresh = () => {
    if (socket) {
      socket.emit('request_stations');
      socket.emit('request_alerts');
    }
  };

  const getStatusCount = (status) => {
    return stations.filter(station => station.status === status).length;
  };

  const getSeverityCount = (severity) => {
    return alerts.filter(alert => alert.severity === severity).length;
  };

  const getAlertTrendData = () => {
    const now = new Date();
    const days = parseInt(timeRange);
    const trendData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.created_at).toISOString().split('T')[0];
        return alertDate === dateStr;
      });
      
      trendData.push({
        date: dateStr,
        total: dayAlerts.length,
        critical: dayAlerts.filter(a => a.severity === 'critical').length,
        high: dayAlerts.filter(a => a.severity === 'high').length,
        medium: dayAlerts.filter(a => a.severity === 'medium').length,
        low: dayAlerts.filter(a => a.severity === 'low').length,
      });
    }
    
    return trendData;
  };

  const getStationPerformance = () => {
    return stations.map(station => {
      const stationAlerts = alerts.filter(alert => alert.station_id === station.id);
      const activeAlerts = stationAlerts.filter(alert => alert.status === 'active');
      const criticalAlerts = stationAlerts.filter(alert => alert.severity === 'critical');
      
      return {
        ...station,
        totalAlerts: stationAlerts.length,
        activeAlerts: activeAlerts.length,
        criticalAlerts: criticalAlerts.length,
        uptime: station.status === 'normal' ? 100 : station.status === 'warning' ? 75 : 50,
      };
    });
  };

  const trendData = getAlertTrendData();
  const performanceData = getStationPerformance();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            📊 Thống Kê & Báo Cáo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Phân tích hiệu suất và xu hướng sản xuất
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Thời gian</InputLabel>
            <Select
              value={timeRange}
              label="Thời gian"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">7 ngày</MenuItem>
              <MenuItem value="14">14 ngày</MenuItem>
              <MenuItem value="30">30 ngày</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ borderRadius: 2 }}
          >
            Làm Mới
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2 }}
          >
            Xuất Báo Cáo
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700 }}>
                {stations.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng trạm sản xuất
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {getStatusCount('normal')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm hoạt động bình thường
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stations.length ? (getStatusCount('normal') / stations.length) * 100 : 0} 
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {alerts.filter(a => a.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cảnh báo đang hoạt động
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={alerts.length ? (alerts.filter(a => a.status === 'active').length / alerts.length) * 100 : 0} 
                color="warning"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                {getSeverityCount('critical')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cảnh báo nghiêm trọng
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={alerts.length ? (getSeverityCount('critical') / alerts.length) * 100 : 0} 
                color="error"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Alert Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Xu Hướng Cảnh Báo ({timeRange} ngày gần đây)
                </Typography>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ngày</TableCell>
                      <TableCell align="center">Tổng</TableCell>
                      <TableCell align="center">Nghiêm trọng</TableCell>
                      <TableCell align="center">Cao</TableCell>
                      <TableCell align="center">Trung bình</TableCell>
                      <TableCell align="center">Thấp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trendData.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{new Date(row.date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.total} 
                            size="small" 
                            color={row.total > 5 ? 'error' : row.total > 2 ? 'warning' : 'success'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {row.critical > 0 && (
                            <Chip label={row.critical} size="small" color="error" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.high > 0 && (
                            <Chip label={row.high} size="small" color="warning" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.medium > 0 && (
                            <Chip label={row.medium} size="small" color="info" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.low > 0 && (
                            <Chip label={row.low} size="small" color="success" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Severity Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Phân Bố Mức Độ Cảnh Báo
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Nghiêm trọng</Typography>
                    <Typography variant="body2" color="error.main">
                      {getSeverityCount('critical')}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={alerts.length ? (getSeverityCount('critical') / alerts.length) * 100 : 0} 
                    color="error"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Cao</Typography>
                    <Typography variant="body2" color="warning.main">
                      {getSeverityCount('high')}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={alerts.length ? (getSeverityCount('high') / alerts.length) * 100 : 0} 
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Trung bình</Typography>
                    <Typography variant="body2" color="info.main">
                      {getSeverityCount('medium')}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={alerts.length ? (getSeverityCount('medium') / alerts.length) * 100 : 0} 
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Thấp</Typography>
                    <Typography variant="body2" color="success.main">
                      {getSeverityCount('low')}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={alerts.length ? (getSeverityCount('low') / alerts.length) * 100 : 0} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Station Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Hiệu Suất Trạm Sản Xuất
                </Typography>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Trạm</TableCell>
                      <TableCell>Mã</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Tổng cảnh báo</TableCell>
                      <TableCell align="center">Đang hoạt động</TableCell>
                      <TableCell align="center">Nghiêm trọng</TableCell>
                      <TableCell align="center">Uptime (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceData.map((station) => (
                      <TableRow key={station.id}>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {station.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {station.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={station.code} size="small" color="primary" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={
                              station.status === 'normal' ? 'Bình thường' :
                              station.status === 'warning' ? 'Cảnh báo' :
                              station.status === 'error' ? 'Lỗi' : 'Bảo trì'
                            }
                            color={
                              station.status === 'normal' ? 'success' :
                              station.status === 'warning' ? 'warning' :
                              station.status === 'error' ? 'error' : 'info'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {station.totalAlerts}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {station.activeAlerts > 0 && (
                            <Chip 
                              label={station.activeAlerts} 
                              size="small" 
                              color="warning" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {station.criticalAlerts > 0 && (
                            <Chip 
                              label={station.criticalAlerts} 
                              size="small" 
                              color="error" 
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {station.uptime}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={station.uptime} 
                              color={station.uptime > 90 ? 'success' : station.uptime > 70 ? 'warning' : 'error'}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics; 