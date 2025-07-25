import React, { useState } from 'react';
import { Box, Typography, Button, MenuItem, Select, FormControl, InputLabel, Chip, Stack } from '@mui/material';
import { useSocket } from '../context/SocketContext';
import { useData } from '../context/DataContext';

const STATUS_OPTIONS = [
  { value: 'normal', label: 'Bình thường', color: 'success' },
  { value: 'warning', label: 'Cảnh báo', color: 'warning' },
  { value: 'error', label: 'Lỗi', color: 'error' },
  { value: 'maintenance', label: 'Bảo trì', color: 'info' },
];

const StationSimulator = () => {
  const { stations } = useData();
  const socket = useSocket();
  const [selectedStation, setSelectedStation] = useState(stations[0]?.id || '');
  const [currentStatus, setCurrentStatus] = useState('normal');
  const [sending, setSending] = useState(false);

  const handleChangeStatus = async (status) => {
    if (!selectedStation || !socket) return;
    setSending(true);
    socket.emit('update_station_status', {
      station_id: selectedStation,
      status,
    });
    setCurrentStatus(status);
    setTimeout(() => setSending(false), 500); // giả lập phản hồi
  };

  const handleStationChange = (stationId) => {
    setSelectedStation(stationId);
    const found = stations.find(s => s.id === stationId);
    setCurrentStatus(found ? found.status : 'normal');
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 3, borderRadius: 3, boxShadow: 3, bgcolor: '#fff' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Station Simulator
      </Typography>
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Chọn trạm</InputLabel>
        <Select
          value={selectedStation}
          label="Chọn trạm"
          onChange={e => handleStationChange(e.target.value)}
        >
          {stations.map(station => (
            <MenuItem key={station.id} value={station.id}>{station.name} ({station.code})</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Trạng thái hiện tại:
        <Chip
          label={STATUS_OPTIONS.find(opt => opt.value === currentStatus)?.label || currentStatus}
          color={STATUS_OPTIONS.find(opt => opt.value === currentStatus)?.color || 'default'}
          sx={{ ml: 1 }}
        />
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {STATUS_OPTIONS.map(opt => (
          <Button
            key={opt.value}
            variant={currentStatus === opt.value ? 'contained' : 'outlined'}
            color={opt.color}
            disabled={sending}
            onClick={() => handleChangeStatus(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Mở trang này ở tab khác để test realtime với dashboard.
      </Typography>
    </Box>
  );
};

export default StationSimulator; 