const pool = require('../database/mysql');
const axios = require('axios');

function setupSocketHandlers(io) {
  console.log('🔌 Socket.IO handlers đã được thiết lập');
  
  io.on('connection', (socket) => {
    console.log(`👤 Client kết nối: ${socket.id}`);
    
    // Gửi dữ liệu ban đầu cho client mới
    sendInitialData(socket);
    
    // Xử lý sự kiện từ client
    socket.on('request_stations', () => {
      sendStationsData(socket);
    });
    
    socket.on('update_station_status', (data) => {
      handleUpdateStationStatus(socket, data);
    });
    
    socket.on('disconnect', () => {
      console.log(`👤 Client ngắt kết nối: ${socket.id}`);
    });
  });
  
  // Lưu io instance để sử dụng trong routes
  io.app = io;
}

async function sendInitialData(socket) {
  try {
    // Gửi dữ liệu trạm (chỉ lấy từ stations)
    const [stations] = await pool.query(`
      SELECT * FROM stations ORDER BY name
    `);
    socket.emit('stations_data', stations);
    // Không còn gửi dữ liệu cảnh báo
  } catch (err) {
    console.error('❌ Lỗi gửi dữ liệu ban đầu qua socket:', err);
  }
}

async function sendStationsData(socket) {
  try {
    const [stations] = await pool.query(`SELECT * FROM stations ORDER BY name`);
    socket.emit('stations_data', stations);
  } catch (err) {
    console.error('❌ Lỗi gửi dữ liệu trạm qua socket:', err);
  }
}

async function handleUpdateStationStatus(socket, data) {
  const { station_id, status } = data;
  if (!station_id || !status) {
    socket.emit('error', { message: 'Thiếu thông tin bắt buộc' });
    return;
  }
  const validStatuses = ['normal', 'warning', 'error', 'maintenance'];
  if (!validStatuses.includes(status)) {
    socket.emit('error', { message: 'Trạng thái không hợp lệ' });
    return;
  }
  try {
    // Lấy trạng thái cũ và thông tin trạm
    const [[oldStation]] = await pool.query(
      `SELECT status, name, code FROM stations WHERE id = ?`,
      [station_id]
    );
    const oldStatus = oldStation ? oldStation.status : null;
    const stationName = oldStation ? oldStation.name : '';
    const stationCode = oldStation ? oldStation.code : '';
    const [result] = await pool.query(
      `UPDATE stations SET status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, station_id]
    );
    if (result.affectedRows === 0) {
      socket.emit('error', { message: 'Không tìm thấy trạm' });
      return;
    }
    // Ghi log vào bảng logs mới
    await pool.query(
      `INSERT INTO logs (event_type, source, station_id, old_status, new_status) VALUES ('change_status', 'server', ?, ?, ?)`,
      [station_id, oldStatus, status]
    );
    // Gửi Power Automate flow
    const statusLabel = {
      normal: 'Bình thường',
      warning: 'Cảnh báo',
      error: 'Lỗi',
      maintenance: 'Bảo trì',
    };
    const now = new Date();
    const timeStr = `${now.toLocaleTimeString('vi-VN', { hour12: false })} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const msg = `[${timeStr}] Trạm ${stationName}[${stationCode}] thay đổi trạng thái từ [${statusLabel[oldStatus] || oldStatus}] thành [${statusLabel[status]}]`;
    const FLOW_URL = 'https://prod-45.southeastasia.logic.azure.com:443/workflows/3d860fe555f04bc5a6a1a4630b9890c5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HWlj8bkWQBvhnaqVgDbwdsbTm5euiiynjAGKSveJenE';
    const TEAM_ID = '2f9ba389-5c1c-4903-8cde-d1e9d2e46802';
    const CHANNEL_ID = '19:mWUxm9v5XYDN9M9S44wvCveg2kwZPKpQNg66T5ausIk1@thread.tacv2';
    try {
      await axios.post(FLOW_URL, {
        channelId: CHANNEL_ID,
        teamId: TEAM_ID,
        message: '[ANDON] ' + msg
      });
    } catch (err) {
      console.error('❌ Lỗi gửi Power Automate flow:', err.message);
    }
    // Broadcast cho tất cả clients
    socket.broadcast.emit('station_status_updated', {
      station_id,
      status: status,
      timestamp: new Date().toISOString()
    });
    socket.emit('station_status_updated_success', { success: true });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái trạm:', err, err.stack);
    socket.emit('error', { message: 'Lỗi cập nhật trạng thái trạm', details: err.message });
  }
}

// RESET ALL STATIONS TO NORMAL
async function resetAllStationsToNormal() {
  // Lấy danh sách các trạm không ở trạng thái bình thường
  const [stations] = await pool.query(`SELECT id, status FROM stations WHERE status != 'normal'`);
  for (const station of stations) {
    await pool.query(`UPDATE stations SET status = 'normal', last_updated = CURRENT_TIMESTAMP WHERE id = ?`, [station.id]);
    await pool.query(
      `INSERT INTO logs (event_type, source, station_id, old_status, new_status) VALUES ('reset_all', 'server', ?, ?, 'normal')`,
      [station.id, station.status]
    );
  }
}

// Hàm tiện ích để broadcast sự kiện từ routes
function broadcastEvent(eventName, data) {
  const io = global.io;
  if (io) {
    io.emit(eventName, data);
  }
}

module.exports = {
  setupSocketHandlers,
  broadcastEvent
}; 