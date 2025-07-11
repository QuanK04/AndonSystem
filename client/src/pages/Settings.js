import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      sound: true,
    },
    system: {
      autoRefresh: true,
      refreshInterval: 30,
      darkMode: false,
      language: 'vi',
    },
    alerts: {
      criticalTimeout: 5,
      warningTimeout: 15,
      escalationEnabled: true,
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulate saving settings
    setTimeout(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const systemInfo = {
    version: '1.0.0',
    lastUpdate: '2024-01-15',
    databaseSize: '2.5 MB',
    uptime: '72 giờ',
    connections: 5,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          ⚙️ Cài Đặt Hệ Thống
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Tùy chỉnh cấu hình và thông báo
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cài đặt đã được lưu thành công!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Thông Báo
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Thông báo qua Email"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    />
                  }
                  label="Thông báo qua SMS"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                  }
                  label="Thông báo Push"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sound}
                      onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
                    />
                  }
                  label="Âm thanh cảnh báo"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Cài Đặt Hệ Thống
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.system.autoRefresh}
                      onChange={(e) => handleSettingChange('system', 'autoRefresh', e.target.checked)}
                    />
                  }
                  label="Tự động làm mới dữ liệu"
                />
                
                <TextField
                  label="Thời gian làm mới (giây)"
                  type="number"
                  value={settings.system.refreshInterval}
                  onChange={(e) => handleSettingChange('system', 'refreshInterval', parseInt(e.target.value))}
                  disabled={!settings.system.autoRefresh}
                  size="small"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.system.darkMode}
                      onChange={(e) => handleSettingChange('system', 'darkMode', e.target.checked)}
                    />
                  }
                  label="Chế độ tối"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Cài Đặt Cảnh Báo
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Timeout cảnh báo nghiêm trọng (phút)"
                  type="number"
                  value={settings.alerts.criticalTimeout}
                  onChange={(e) => handleSettingChange('alerts', 'criticalTimeout', parseInt(e.target.value))}
                  size="small"
                />
                
                <TextField
                  label="Timeout cảnh báo thường (phút)"
                  type="number"
                  value={settings.alerts.warningTimeout}
                  onChange={(e) => handleSettingChange('alerts', 'warningTimeout', parseInt(e.target.value))}
                  size="small"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.alerts.escalationEnabled}
                      onChange={(e) => handleSettingChange('alerts', 'escalationEnabled', e.target.checked)}
                    />
                  }
                  label="Bật leo thang cảnh báo"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Thông Tin Hệ Thống
                </Typography>
              </Box>
              
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Phiên bản"
                    secondary={
                      <Chip label={systemInfo.version} size="small" color="primary" />
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Cập nhật cuối"
                    secondary={systemInfo.lastUpdate}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Kích thước database"
                    secondary={systemInfo.databaseSize}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Thời gian hoạt động"
                    secondary={systemInfo.uptime}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Kết nối hiện tại"
                    secondary={
                      <Chip 
                        label={systemInfo.connections} 
                        size="small" 
                        color="success" 
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Connection Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WifiIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Trạng Thái Kết Nối
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                    <Typography variant="h6" color="success.main">
                      Database
                    </Typography>
                    <Chip label="Kết nối" color="success" size="small" />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                    <Typography variant="h6" color="success.main">
                      Socket.IO
                    </Typography>
                    <Chip label="Hoạt động" color="success" size="small" />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                    <Typography variant="h6" color="success.main">
                      API Server
                    </Typography>
                    <Chip label="Online" color="success" size="small" />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                    <Typography variant="h6" color="success.main">
                      Frontend
                    </Typography>
                    <Chip label="Đang chạy" color="success" size="small" />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          Làm Mới
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Lưu Cài Đặt
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 