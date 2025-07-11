const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes và database
const stationRoutes = require('./routes/stations');
const alertRoutes = require('./routes/alerts');
const statisticsRoutes = require('./routes/statistics');
const { initDatabase } = require('./database/database');
const { setupSocketHandlers } = require('./socket/socketHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Andon System TEKCOM'
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

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

// Initialize database và start server
async function startServer() {
  try {
    await initDatabase();
    console.log('✅ Database đã được khởi tạo thành công');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server Andon đang chạy trên port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:3000`);
      console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io }; 