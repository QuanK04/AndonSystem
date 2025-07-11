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
  TextField,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import AlertList from '../components/AlertList';
import CreateAlertDialog from '../components/CreateAlertDialog';

const Alerts = () => {
  const { alerts, stations } = useData();
  const socket = useSocket();
  const [createAlertOpen, setCreateAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    station: 'all',
    search: '',
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update status filter based on tab
    const statusMap = ['all', 'active', 'acknowledged', 'resolved'];
    setFilters(prev => ({ ...prev, status: statusMap[newValue] }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    if (socket) {
      socket.emit('request_alerts');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    // Status filter
    if (filters.status !== 'all' && alert.status !== filters.status) {
      return false;
    }
    
    // Severity filter
    if (filters.severity !== 'all' && alert.severity !== filters.severity) {
      return false;
    }
    
    // Station filter
    if (filters.station !== 'all' && alert.station_id !== parseInt(filters.station)) {
      return false;
    }
    
    // Search filter
    if (filters.search && !alert.message.toLowerCase().includes(filters.search.toLowerCase()) &&
        !alert.station_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const getStatusCount = (status) => {
    return alerts.filter(alert => alert.status === status).length;
  };

  const getSeverityCount = (severity) => {
    return alerts.filter(alert => alert.severity === severity).length;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            🚨 Quản Lý Cảnh Báo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Theo dõi và xử lý tất cả cảnh báo trong hệ thống
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateAlertOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Tạo Cảnh Báo
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ borderRadius: 2 }}
          >
            Làm Mới
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                {getStatusCount('active')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                {getStatusCount('acknowledged')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã xác nhận
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                {getStatusCount('resolved')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã giải quyết
              </Typography>
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
                Nghiêm trọng
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Tất cả
                  <Chip label={alerts.length} size="small" color="default" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Đang hoạt động
                  <Chip label={getStatusCount('active')} size="small" color="warning" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Đã xác nhận
                  <Chip label={getStatusCount('acknowledged')} size="small" color="info" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Đã giải quyết
                  <Chip label={getStatusCount('resolved')} size="small" color="success" />
                </Box>
              } 
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Bộ Lọc
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Mức độ</InputLabel>
                <Select
                  value={filters.severity}
                  label="Mức độ"
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="low">Thấp</MenuItem>
                  <MenuItem value="medium">Trung bình</MenuItem>
                  <MenuItem value="high">Cao</MenuItem>
                  <MenuItem value="critical">Nghiêm trọng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạm</InputLabel>
                <Select
                  value={filters.station}
                  label="Trạm"
                  onChange={(e) => handleFilterChange('station', e.target.value)}
                >
                  <MenuItem value="all">Tất cả trạm</MenuItem>
                  {stations.map((station) => (
                    <MenuItem key={station.id} value={station.id}>
                      {station.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Tìm kiếm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tìm theo nội dung hoặc trạm..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilters({
                  status: 'all',
                  severity: 'all',
                  station: 'all',
                  search: '',
                })}
                sx={{ height: 40 }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6" component="h2">
              Danh Sách Cảnh Báo
            </Typography>
            <Chip 
              label={`${filteredAlerts.length} kết quả`} 
              color="primary" 
              size="small" 
              sx={{ ml: 'auto' }}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <AlertList alerts={filteredAlerts} maxHeight={600} />
        </CardContent>
      </Card>

      {/* Create Alert Dialog */}
      <CreateAlertDialog 
        open={createAlertOpen} 
        onClose={() => setCreateAlertOpen(false)}
        stations={stations}
      />
    </Box>
  );
};

export default Alerts; 