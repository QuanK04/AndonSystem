import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Factory as FactoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const StatisticsCards = ({ statistics }) => {
  const { stations = {}, alerts = {} } = statistics;

  const cards = [
    {
      title: 'Tổng Trạm',
      value: stations.total_stations || 0,
      icon: <FactoryIcon />,
      color: 'primary',
      progress: 100,
      subtitle: 'Trạm sản xuất',
    },
    {
      title: 'Hoạt Động Bình Thường',
      value: stations.normal_stations || 0,
      icon: <CheckCircleIcon />,
      color: 'success',
      progress: stations.total_stations ? (stations.normal_stations / stations.total_stations) * 100 : 0,
      subtitle: 'Trạm đang hoạt động tốt',
    },
    {
      title: 'Cảnh Báo Đang Hoạt Động',
      value: alerts.active_alerts || 0,
      icon: <WarningIcon />,
      color: 'warning',
      progress: alerts.total_alerts ? (alerts.active_alerts / alerts.total_alerts) * 100 : 0,
      subtitle: 'Cần xử lý',
    },
    {
      title: 'Cảnh Báo Nghiêm Trọng',
      value: alerts.critical_alerts || 0,
      icon: <ErrorIcon />,
      color: 'error',
      progress: alerts.active_alerts ? (alerts.critical_alerts / alerts.active_alerts) * 100 : 0,
      subtitle: 'Cần can thiệp ngay',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: `${card.color}.light`,
                    color: `${card.color}.main`,
                    mr: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {card.subtitle}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={card.progress}
                color={card.color}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: `${card.color}.lighter`,
                }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {card.progress.toFixed(1)}% tỷ lệ
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsCards; 