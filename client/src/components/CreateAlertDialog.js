import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useSocket } from '../context/SocketContext';

const CreateAlertDialog = ({ open, onClose, stations }) => {
  const [formData, setFormData] = useState({
    station_id: '',
    alert_type: '',
    severity: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const socket = useSocket();

  const alertTypes = [
    { value: 'equipment_failure', label: 'Hỏng hóc thiết bị' },
    { value: 'quality_issue', label: 'Vấn đề chất lượng' },
    { value: 'material_shortage', label: 'Thiếu nguyên liệu' },
    { value: 'safety_concern', label: 'Vấn đề an toàn' },
    { value: 'maintenance_required', label: 'Cần bảo trì' },
    { value: 'operator_assistance', label: 'Cần hỗ trợ' },
    { value: 'other', label: 'Khác' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Thấp', color: 'success' },
    { value: 'medium', label: 'Trung bình', color: 'info' },
    { value: 'high', label: 'Cao', color: 'warning' },
    { value: 'critical', label: 'Nghiêm trọng', color: 'error' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.station_id) {
      setError('Vui lòng chọn trạm');
      return;
    }
    if (!formData.alert_type) {
      setError('Vui lòng chọn loại cảnh báo');
      return;
    }
    if (!formData.severity) {
      setError('Vui lòng chọn mức độ cảnh báo');
      return;
    }
    if (!formData.message.trim()) {
      setError('Vui lòng nhập nội dung cảnh báo');
      return;
    }

    setLoading(true);
    setError('');

    if (socket) {
      socket.emit('create_alert', formData);
      
      // Listen for response
      socket.once('alert_created', (response) => {
        setLoading(false);
        if (response.success) {
          handleClose();
        } else {
          setError('Có lỗi xảy ra khi tạo cảnh báo');
        }
      });

      socket.once('error', (error) => {
        setLoading(false);
        setError(error.message || 'Có lỗi xảy ra khi tạo cảnh báo');
      });

      // Timeout fallback
      setTimeout(() => {
        setLoading(false);
        setError('Không nhận được phản hồi từ server');
      }, 5000);
    } else {
      setLoading(false);
      setError('Không có kết nối đến server');
    }
  };

  const handleClose = () => {
    setFormData({
      station_id: '',
      alert_type: '',
      severity: '',
      message: '',
    });
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          🚨 Tạo Cảnh Báo Mới
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thông báo sự cố hoặc vấn đề tại trạm sản xuất
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Station Selection */}
          <FormControl fullWidth>
            <InputLabel>Chọn trạm</InputLabel>
            <Select
              value={formData.station_id}
              label="Chọn trạm"
              onChange={(e) => handleInputChange('station_id', e.target.value)}
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  {station.name} ({station.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Alert Type */}
          <FormControl fullWidth>
            <InputLabel>Loại cảnh báo</InputLabel>
            <Select
              value={formData.alert_type}
              label="Loại cảnh báo"
              onChange={(e) => handleInputChange('alert_type', e.target.value)}
            >
              {alertTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Severity Level */}
          <FormControl fullWidth>
            <InputLabel>Mức độ cảnh báo</InputLabel>
            <Select
              value={formData.severity}
              label="Mức độ cảnh báo"
              onChange={(e) => handleInputChange('severity', e.target.value)}
            >
              {severityLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: `${level.color}.main`,
                      }}
                    />
                    {level.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Message */}
          <TextField
            label="Nội dung cảnh báo"
            multiline
            rows={4}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Mô tả chi tiết vấn đề hoặc sự cố..."
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.station_id || !formData.alert_type || !formData.severity || !formData.message.trim()}
        >
          {loading ? 'Đang tạo...' : 'Tạo Cảnh Báo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAlertDialog; 