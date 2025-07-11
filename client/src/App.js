import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';

// Import mock data for demo
import { mockStations, mockAlerts, mockStatistics, MockSocket, mockApi } from './services/mockData';

// Components
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import LoadingScreen from './components/LoadingScreen';

// Context
import { SocketContext } from './context/SocketContext';
import { DataContext } from './context/DataContext';

function App() {
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Khởi tạo Mock Socket cho demo
    const newSocket = new MockSocket();

    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected');
      console.log('✅ Mock Socket.IO đã kết nối');
    }, 1000);

    // Lắng nghe sự kiện real-time
    newSocket.on('stations_data', (data) => {
      setStations(data);
    });

    newSocket.on('alerts_data', (data) => {
      setAlerts(data);
    });

    newSocket.on('new_alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    newSocket.on('alert_acknowledged', (data) => {
      setAlerts(prev => prev.map(alert => 
        alert.id === data.alert_id 
          ? { ...alert, status: 'acknowledged', acknowledged_by: data.acknowledged_by }
          : alert
      ));
    });

    newSocket.on('alert_resolved', (data) => {
      setAlerts(prev => prev.map(alert => 
        alert.id === data.alert_id 
          ? { ...alert, status: 'resolved', resolved_by: data.resolved_by }
          : alert
      ));
    });

    newSocket.on('station_status_updated', (data) => {
      setStations(prev => prev.map(station => 
        station.id === data.station_id 
          ? { ...station, status: data.status, last_updated: data.timestamp }
          : station
      ));
    });

    setSocket(newSocket);

    // Load dữ liệu ban đầu từ mock data
    const loadInitialData = async () => {
      try {
        const [stationsData, alertsData, statsData] = await Promise.all([
          mockApi.fetchStations(),
          mockApi.fetchAlerts(),
          mockApi.fetchStatistics()
        ]);

        setStations(stationsData);
        setAlerts(alertsData);
        setStatistics(statsData);
      } catch (error) {
        console.error('❌ Lỗi tải dữ liệu ban đầu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Cleanup khi component unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SocketContext.Provider value={socket}>
      <DataContext.Provider value={{
        stations,
        alerts,
        statistics,
        connectionStatus,
        setStations,
        setAlerts,
        setStatistics
      }}>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <Header />
            <Container 
              component="main" 
              maxWidth="xl" 
              sx={{ 
                flexGrow: 1, 
                py: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: 'calc(100vh - 64px)'
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </DataContext.Provider>
    </SocketContext.Provider>
  );
}

export default App; 