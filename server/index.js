const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const axios = require('axios'); // Thêm nếu chưa có

// Import routes và database
const stationRoutes = require('./routes/stations');
const alertRoutes = require('./routes/alerts');
const statisticsRoutes = require('./routes/statistics');
const { router: hardwareControlRoutes, setStationController } = require('./routes/hardware-control');
const { initDatabase } = require('./database/database');
const { setupSocketHandlers } = require('./socket/socketHandlers');

// Import StationController và config
const StationController = require('./hardware/station-controller');
const { stationsConfig } = require('./config/stations-config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Khởi tạo StationController
const stationController = new StationController();

// Inject StationController vào hardware control routes
setStationController(stationController);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/stations', stationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/hardware', hardwareControlRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Andon System TEKCOM'
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io, stationController);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Có lỗi xảy ra trong hệ thống',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint không tồn tại' });
});

// Hàm gửi thông báo Power Automate
async function sendPowerAutomateMessage(message) {
  const FLOW_URL = 'https://prod-45.southeastasia.logic.azure.com:443/workflows/3d860fe555f04bc5a6a1a4630b9890c5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HWlj8bkWQBvhnaqVgDbwdsbTm5euiiynjAGKSveJenE';
  const TEAM_ID = '2f9ba389-5c1c-4903-8cde-d1e9d2e46802';
  const CHANNEL_ID = '19:mWUxm9v5XYDN9M9S44wvCveg2kwZPKpQNg66T5ausIk1@thread.tacv2';
  try {
    await axios.post(FLOW_URL, {
      channelId: CHANNEL_ID,
      teamId: TEAM_ID,
      message: '[ANDON] ' + message
    });
  } catch (err) {
    console.error('❌ Lỗi gửi Power Automate flow:', err.message);
  }
}

// Initialize database và start server
async function startServer() {
  try {
    // KHÔNG gọi initDatabase nữa, vì đã dùng MySQL
    // await initDatabase();
    // console.log('✅ Database đã được khởi tạo thành công');
    
    // Khởi tạo các trạm sản xuất
    console.log('🏭 Khởi tạo các trạm sản xuất...');
    Object.entries(stationsConfig).forEach(([stationId, config]) => {
      stationController.addStation(stationId, config);
    });
    
    // Kết nối đến các trạm (bỏ qua khi demo web, chưa có thiết bị)
    // console.log('🔗 Kết nối đến các trạm sản xuất...');
    // for (const [stationId, config] of Object.entries(stationsConfig)) {
    //   try {
    //     await stationController.connectToStation(stationId);
    //     console.log(`✅ Kết nối thành công trạm: ${config.name}`);
    //   } catch (error) {
    //     console.log(`⚠️ Không thể kết nối trạm ${config.name}: ${error.message}`);
    //   }
    // }
    
    // Lắng nghe sự kiện thay đổi trạng thái trạm
    stationController.on('station-status-change', (data) => {
      console.log(`🔄 Trạm ${data.stationName} thay đổi trạng thái: ${data.status}`);
      
      // Gửi thông báo qua Socket.IO
      io.emit('station-status-update', data);
      
      // Tạo cảnh báo nếu cần
      if (data.status === 'red' || data.buttonPressed === 'alert') {
        createAlertFromStation(data);
      }
    });
    
    server.listen(PORT, async () => {
      console.log(`🚀 Server Andon đang chạy trên port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:3000`);
      console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
      await sendPowerAutomateMessage('Hệ thống Andon đã khởi động thành công!');
    });
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
}

// Tạo cảnh báo từ trạm
function createAlertFromStation(stationData) {
  const alertData = {
    stationId: stationData.stationId,
    stationName: stationData.stationName,
    type: stationData.status === 'red' ? 'stop' : 'alert',
    priority: stationData.status === 'red' ? 'high' : 'medium',
    description: stationData.status === 'red' ? 
      `Trạm ${stationData.stationName} dừng máy` : 
      `Cảnh báo từ trạm ${stationData.stationName}`,
    status: 'active'
  };
  
  // Gửi cảnh báo qua Socket.IO
  io.emit('new-alert', alertData);
  console.log(`🚨 Tạo cảnh báo: ${alertData.description}`);
}

startServer();

module.exports = { app, server, io }; 