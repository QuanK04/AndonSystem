import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Collapse,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';

const AlertList = ({ alerts, maxHeight = 400 }) => {
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [acknowledgeDialog, setAcknowledgeDialog] = useState({ open: false, alert: null });
  const [resolveDialog, setResolveDialog] = useState({ open: false, alert: null });
  const [acknowledgedBy, setAcknowledgedBy] = useState('');
  const [resolvedBy, setResolvedBy] = useState('');
  
  const socket = useSocket();

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="warning" />;
      case 'medium':
        return <InfoIcon color="info" />;
      case 'low':
        return <InfoIcon color="success" />;
      default:
        return <WarningIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical':
        return 'Nghiêm trọng';
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Không xác định';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Không xác định';
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  const handleExpandAlert = (alertId) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  const handleAcknowledge = (alert) => {
    setAcknowledgeDialog({ open: true, alert });
  };

  const handleResolve = (alert) => {
    setResolveDialog({ open: true, alert });
  };

  const confirmAcknowledge = () => {
    if (socket && acknowledgedBy.trim()) {
      socket.emit('acknowledge_alert', {
        alert_id: acknowledgeDialog.alert.id,
        acknowledged_by: acknowledgedBy.trim()
      });
      setAcknowledgeDialog({ open: false, alert: null });
      setAcknowledgedBy('');
    }
  };

  const confirmResolve = () => {
    if (socket && resolvedBy.trim()) {
      socket.emit('resolve_alert', {
        alert_id: resolveDialog.alert.id,
        resolved_by: resolvedBy.trim()
      });
      setResolveDialog({ open: false, alert: null });
      setResolvedBy('');
    }
  };

  if (alerts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Không có cảnh báo nào
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <List sx={{ maxHeight, overflow: 'auto' }}>
        {alerts.map((alert) => (
          <ListItem
            key={alert.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 1,
              backgroundColor: alert.severity === 'critical' ? 'error.lighter' : 'background.paper',
            }}
          >
            <ListItemIcon>
              {getSeverityIcon(alert.severity)}
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {alert.station_name}
                  </Typography>
                  <Chip
                    label={getSeverityText(alert.severity)}
                    color={getSeverityColor(alert.severity)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {alert.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(alert.created_at)}
                  </Typography>
                  
                  <Collapse in={expandedAlert === alert.id}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        <strong>Loại cảnh báo:</strong> {alert.alert_type}
                      </Typography>
                      <Typography variant="caption" display="block" gutterBottom>
                        <strong>Trạm:</strong> {alert.station_name} ({alert.station_code})
                      </Typography>
                      <Typography variant="caption" display="block" gutterBottom>
                        <strong>Thời gian tạo:</strong> {formatTime(alert.created_at)}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PersonIcon />}
                          onClick={() => handleAcknowledge(alert)}
                          disabled={alert.status !== 'active'}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleResolve(alert)}
                          disabled={alert.status === 'resolved'}
                        >
                          Giải quyết
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Box>
              }
            />
            
            <IconButton
              size="small"
              onClick={() => handleExpandAlert(alert.id)}
            >
              {expandedAlert === alert.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </ListItem>
        ))}
      </List>

      {/* Acknowledge Dialog */}
      <Dialog open={acknowledgeDialog.open} onClose={() => setAcknowledgeDialog({ open: false, alert: null })}>
        <DialogTitle>Xác nhận cảnh báo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên người xác nhận"
            fullWidth
            variant="outlined"
            value={acknowledgedBy}
            onChange={(e) => setAcknowledgedBy(e.target.value)}
            placeholder="Nhập tên của bạn"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcknowledgeDialog({ open: false, alert: null })}>
            Hủy
          </Button>
          <Button onClick={confirmAcknowledge} variant="contained" disabled={!acknowledgedBy.trim()}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialog.open} onClose={() => setResolveDialog({ open: false, alert: null })}>
        <DialogTitle>Giải quyết cảnh báo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên người giải quyết"
            fullWidth
            variant="outlined"
            value={resolvedBy}
            onChange={(e) => setResolvedBy(e.target.value)}
            placeholder="Nhập tên của bạn"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog({ open: false, alert: null })}>
            Hủy
          </Button>
          <Button onClick={confirmResolve} variant="contained" disabled={!resolvedBy.trim()}>
            Giải quyết
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlertList; 