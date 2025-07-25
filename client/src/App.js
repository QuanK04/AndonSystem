import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';

// Import mock data for demo
import { mockStations, mockAlerts, mockStatistics, MockSocket, mockApi } from './services/mockData';
import { io } from 'socket.io-client';
import * as api from './services/api';

// Components
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import LoadingScreen from './components/LoadingScreen';
import StationSimulator from './pages/StationSimulator';
import WebhookTest from './pages/WebhookTest';

// Context
import { SocketContext } from './context/SocketContext';
import { DataContext } from './context/DataContext';

function App() {
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    setConnectionStatus('connecting');

    newSocket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('✅ Socket.IO đã kết nối');
    });
    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });
    newSocket.on('stations_data', (data) => {
      setStations(data);
    });
    // Không còn lắng nghe alerts
    // Load dữ liệu ban đầu từ API (nếu cần)
    const loadInitialData = async () => {
      try {
        const stationsData = await api.fetchStations();
        setStations(stationsData.data || []);
        // Tính toán statistics động
        const statistics = {
          stations: {
            total_stations: stationsData.data.length,
            normal_stations: stationsData.data.filter(s => s.status === 'normal').length,
            warning_stations: stationsData.data.filter(s => s.status === 'warning').length,
            error_stations: stationsData.data.filter(s => s.status === 'error').length,
            maintenance_stations: stationsData.data.filter(s => s.status === 'maintenance').length
          }
        };
        setStatistics(statistics);
      } catch (error) {
        console.error('❌ Lỗi tải dữ liệu ban đầu:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      const statistics = {
        stations: {
          total_stations: stations.length,
          normal_stations: stations.filter(s => s.status === 'normal').length,
          warning_stations: stations.filter(s => s.status === 'warning').length,
          error_stations: stations.filter(s => s.status === 'error').length,
          maintenance_stations: stations.filter(s => s.status === 'maintenance').length
        }
      };
      setStatistics(statistics);
    }
  }, [stations]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SocketContext.Provider value={socket}>
      <DataContext.Provider value={{
        stations,
        statistics,
        connectionStatus,
        setStations,
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
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/station-simulator" element={<StationSimulator />} />
                <Route path="/webhook-test" element={<WebhookTest />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </DataContext.Provider>
    </SocketContext.Provider>
  );
}

export default App; 