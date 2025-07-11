const { getDatabase } = require('../database/database');

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
    
    socket.on('request_alerts', () => {
      sendAlertsData(socket);
    });
    
    socket.on('create_alert', (data) => {
      handleCreateAlert(socket, data);
    });
    
    socket.on('acknowledge_alert', (data) => {
      handleAcknowledgeAlert(socket, data);
    });
    
    socket.on('resolve_alert', (data) => {
      handleResolveAlert(socket, data);
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

function sendInitialData(socket) {
  const db = getDatabase();
  
  // Gửi dữ liệu trạm
  db.all(`
    SELECT 
      s.*,
      COUNT(a.id) as active_alerts
    FROM stations s
    LEFT JOIN alerts a ON s.id = a.station_id AND a.status = 'active'
    GROUP BY s.id
    ORDER BY s.name
  `, (err, stations) => {
    if (!err) {
      socket.emit('stations_data', stations);
    }
  });
  
  // Gửi cảnh báo đang hoạt động
  db.all(`
    SELECT 
      a.*,
      s.name as station_name,
      s.code as station_code
    FROM alerts a
    JOIN stations s ON a.station_id = s.id
    WHERE a.status = 'active'
    ORDER BY a.created_at DESC
  `, (err, alerts) => {
    if (!err) {
      socket.emit('alerts_data', alerts);
    }
  });
}

function sendStationsData(socket) {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      s.*,
      COUNT(a.id) as active_alerts
    FROM stations s
    LEFT JOIN alerts a ON s.id = a.station_id AND a.status = 'active'
    GROUP BY s.id
    ORDER BY s.name
  `, (err, stations) => {
    if (!err) {
      socket.emit('stations_data', stations);
    }
  });
}

function sendAlertsData(socket) {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      a.*,
      s.name as station_name,
      s.code as station_code
    FROM alerts a
    JOIN stations s ON a.station_id = s.id
    WHERE a.status = 'active'
    ORDER BY a.created_at DESC
  `, (err, alerts) => {
    if (!err) {
      socket.emit('alerts_data', alerts);
    }
  });
}

function handleCreateAlert(socket, data) {
  const db = getDatabase();
  const { station_id, alert_type, severity, message } = data;
  
  if (!station_id || !alert_type || !severity || !message) {
    socket.emit('error', { message: 'Thiếu thông tin bắt buộc' });
    return;
  }
  
  db.run(`
    INSERT INTO alerts (station_id, alert_type, severity, message)
    VALUES (?, ?, ?, ?)
  `, [station_id, alert_type, severity, message], function(err) {
    if (err) {
      socket.emit('error', { message: 'Lỗi tạo cảnh báo' });
      return;
    }
    
    // Broadcast cho tất cả clients
    socket.broadcast.emit('new_alert', {
      id: this.lastID,
      station_id: parseInt(station_id),
      alert_type,
      severity,
      message,
      created_at: new Date().toISOString()
    });
    
    socket.emit('alert_created', { success: true, id: this.lastID });
  });
}

function handleAcknowledgeAlert(socket, data) {
  const db = getDatabase();
  const { alert_id, acknowledged_by } = data;
  
  if (!alert_id || !acknowledged_by) {
    socket.emit('error', { message: 'Thiếu thông tin bắt buộc' });
    return;
  }
  
  db.run(`
    UPDATE alerts 
    SET status = 'acknowledged', 
        acknowledged_by = ?, 
        acknowledged_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'active'
  `, [acknowledged_by, alert_id], function(err) {
    if (err) {
      socket.emit('error', { message: 'Lỗi xác nhận cảnh báo' });
      return;
    }
    
    if (this.changes === 0) {
      socket.emit('error', { message: 'Không tìm thấy cảnh báo hoặc đã được xử lý' });
      return;
    }
    
    // Broadcast cho tất cả clients
    socket.broadcast.emit('alert_acknowledged', {
      alert_id: parseInt(alert_id),
      acknowledged_by,
      timestamp: new Date().toISOString()
    });
    
    socket.emit('alert_acknowledged_success', { success: true });
  });
}

function handleResolveAlert(socket, data) {
  const db = getDatabase();
  const { alert_id, resolved_by } = data;
  
  if (!alert_id || !resolved_by) {
    socket.emit('error', { message: 'Thiếu thông tin bắt buộc' });
    return;
  }
  
  db.run(`
    UPDATE alerts 
    SET status = 'resolved', 
        resolved_by = ?, 
        resolved_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status IN ('active', 'acknowledged')
  `, [resolved_by, alert_id], function(err) {
    if (err) {
      socket.emit('error', { message: 'Lỗi giải quyết cảnh báo' });
      return;
    }
    
    if (this.changes === 0) {
      socket.emit('error', { message: 'Không tìm thấy cảnh báo hoặc đã được giải quyết' });
      return;
    }
    
    // Broadcast cho tất cả clients
    socket.broadcast.emit('alert_resolved', {
      alert_id: parseInt(alert_id),
      resolved_by,
      timestamp: new Date().toISOString()
    });
    
    socket.emit('alert_resolved_success', { success: true });
  });
}

function handleUpdateStationStatus(socket, data) {
  const db = getDatabase();
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
  
  db.run(`
    UPDATE stations 
    SET status = ?, last_updated = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [status, station_id], function(err) {
    if (err) {
      socket.emit('error', { message: 'Lỗi cập nhật trạng thái trạm' });
      return;
    }
    
    if (this.changes === 0) {
      socket.emit('error', { message: 'Không tìm thấy trạm' });
      return;
    }
    
    // Broadcast cho tất cả clients
    socket.broadcast.emit('station_status_updated', {
      station_id: parseInt(station_id),
      status: status,
      timestamp: new Date().toISOString()
    });
    
    socket.emit('station_status_updated_success', { success: true });
  });
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