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
  TextField,
  Tooltip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useData } from '../context/DataContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import dayjs from 'dayjs';

const STATUS_COLORS = {
  normal: '#43a047',
  warning: '#ffa726',
  error: '#e53935',
  maintenance: '#1e88e5',
  future: '#e0e0e0',
};

const STATUS_LABELS = {
  normal: 'Bình thường',
  warning: 'Cảnh báo',
  error: 'Lỗi',
  maintenance: 'Bảo trì',
  future: 'Tương lai',
};

function StationStatusTimeline({ stationId, date, stations }) {
  const [log, setLog] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!stationId || !date) return;
    setLoading(true);
    axios.get(`/api/stations/${stationId}/status-log?date=${date}`)
      .then(res => setLog(res.data.data || []))
      .catch(() => setLog([]))
      .finally(() => setLoading(false));
  }, [stationId, date]);

  // Chuẩn bị dữ liệu các đoạn màu
  const segments = [];
  const startOfDay = dayjs(date).startOf('day');
  const endOfDay = dayjs(date).endOf('day');
  let lastTime = startOfDay;
  let lastStatus = 'normal';
  if (log.length > 0 && dayjs(log[0].time).isAfter(startOfDay)) {
    lastStatus = 'normal';
  }
  log.forEach((entry, idx) => {
    const entryTime = dayjs(entry.time);
    if (entryTime.isAfter(lastTime)) {
      segments.push({
        from: lastTime,
        to: entryTime,
        status: lastStatus,
      });
    }
    lastTime = entryTime;
    lastStatus = entry.new_status;
  });
  // Đoạn cuối cùng đến hết ngày hoặc đến hiện tại nếu là hôm nay
  const now = dayjs();
  const isToday = dayjs(date).isSame(now, 'day');
  if (isToday && now.isAfter(lastTime)) {
    segments.push({ from: lastTime, to: now, status: lastStatus });
    if (now.isBefore(endOfDay)) {
      segments.push({ from: now, to: endOfDay, status: 'future' });
    }
  } else if (!isToday && lastTime.isBefore(endOfDay)) {
    segments.push({ from: lastTime, to: endOfDay, status: lastStatus });
  }

  // Tính phần trăm chiều dài mỗi đoạn
  const totalMinutes = 24 * 60;
  const getPercent = (from, to) => {
    return ((to.diff(from, 'minute')) / totalMinutes) * 100;
  };

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Trạng thái trạm trong ngày {dayjs(date).format('DD/MM/YYYY')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: 32, borderRadius: 2, overflow: 'hidden', boxShadow: 1, bgcolor: '#f5f5f5' }}>
        {segments.map((seg, idx) => (
          <Tooltip
            key={idx}
            title={
              <>
                <div><b>Trạng thái:</b> {STATUS_LABELS[seg.status] || seg.status}</div>
                <div><b>Thời gian:</b> {dayjs(seg.from).format('HH:mm')} - {dayjs(seg.to).format('HH:mm')}</div>
              </>
            }
            arrow
            placement="top"
          >
            <Box
              sx={{
                height: 32,
                width: `${getPercent(seg.from, seg.to)}%`,
                bgcolor: STATUS_COLORS[seg.status] || '#bdbdbd',
                transition: 'width 0.2s',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption">0h</Typography>
        <Typography variant="caption">12h</Typography>
        <Typography variant="caption">24h</Typography>
      </Box>
      {loading && <Typography variant="caption" color="text.secondary">Đang tải dữ liệu...</Typography>}
    </Box>
  );
}

const Statistics = () => {
  const { stations, statistics } = useData();
  const socket = useSocket();
  const [timeRange, setTimeRange] = useState('7');
  const [selectedStation, setSelectedStation] = React.useState(stations[0]?.id || '');
  const [selectedDate, setSelectedDate] = React.useState(dayjs().format('YYYY-MM-DD'));

  const handleRefresh = () => {
    if (socket) {
      socket.emit('request_stations');
    }
  };

  const getStatusCount = (status) => {
    return stations.filter(station => station.status === status).length;
  };

  // Sắp xếp hiệu suất trạm sản xuất theo S-C-P và mã số tăng dần
  const getStationPerformance = () => {
    const perf = stations.map(station => ({
      ...station,
      uptime: station.status === 'normal' ? 100 : station.status === 'warning' ? 75 : 50,
    }));
    const khuOrder = { S: 0, C: 1, P: 2 };
    perf.sort((a, b) => {
      const khuA = khuOrder[a.code[0]] ?? 99;
      const khuB = khuOrder[b.code[0]] ?? 99;
      if (khuA !== khuB) return khuA - khuB;
      const numA = parseInt(a.code.slice(1), 10);
      const numB = parseInt(b.code.slice(1), 10);
      return numA - numB;
    });
    return perf;
  };

  const performanceData = getStationPerformance();

  // Hàm xác định khu từ code
  const getKhu = (code) => {
    if (code.startsWith('S')) return 'Khu Sơn';
    if (code.startsWith('C')) return 'Khu Carcass';
    if (code.startsWith('P')) return 'Khu Đóng Gói';
    return '';
  };

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
                {getStatusCount('warning') + getStatusCount('maintenance')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm cảnh báo/bảo trì
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stations.length ? ((getStatusCount('warning') + getStatusCount('maintenance')) / stations.length) * 100 : 0} 
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
                {getStatusCount('error')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trạm lỗi
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stations.length ? (getStatusCount('error') / stations.length) * 100 : 0} 
                color="error"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 3, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            type="date"
            size="small"
            label="Chọn ngày"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
        </Box>
        {/* Hiển thị 11 thanh timeline cho tất cả trạm */}
        {stations
          .slice()
          .sort((a, b) => {
            const khuOrder = { S: 0, C: 1, P: 2 };
            const khuA = khuOrder[a.code[0]] ?? 99;
            const khuB = khuOrder[b.code[0]] ?? 99;
            if (khuA !== khuB) return khuA - khuB;
            const numA = parseInt(a.code.slice(1), 10);
            const numB = parseInt(b.code.slice(1), 10);
            return numA - numB;
          })
          .map(station => (
            <Box key={station.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip label={station.code} size="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 2 }}>{station.name}</Typography>
                <Typography variant="caption" color="text.secondary">{station.description}</Typography>
              </Box>
              <StationStatusTimeline stationId={station.id} date={selectedDate} stations={stations} />
            </Box>
        ))}
      </Card>
    </Box>
  );
};

export default Statistics; 