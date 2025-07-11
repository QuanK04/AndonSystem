const express = require('express');
const { getDatabase } = require('../database/database');
const router = express.Router();

// GET /api/alerts - Lấy danh sách cảnh báo
router.get('/', (req, res) => {
  const db = getDatabase();
  const { status, station_id, limit = 50 } = req.query;
  
  let query = `
    SELECT 
      a.*,
      s.name as station_name,
      s.code as station_code
    FROM alerts a
    JOIN stations s ON a.station_id = s.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }
  
  if (station_id) {
    query += ' AND a.station_id = ?';
    params.push(station_id);
  }
  
  query += ' ORDER BY a.created_at DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi truy vấn cảnh báo:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn database' });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// GET /api/alerts/active - Lấy cảnh báo đang hoạt động
router.get('/active', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      a.*,
      s.name as station_name,
      s.code as station_code,
      s.location_x,
      s.location_y
    FROM alerts a
    JOIN stations s ON a.station_id = s.id
    WHERE a.status = 'active'
    ORDER BY a.created_at DESC
  `, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi truy vấn cảnh báo hoạt động:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn database' });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// POST /api/alerts - Tạo cảnh báo mới
router.post('/', (req, res) => {
  const db = getDatabase();
  const { station_id, alert_type, severity, message } = req.body;
  
  // Validate required fields
  if (!station_id || !alert_type || !severity || !message) {
    return res.status(400).json({ 
      error: 'Tất cả các trường là bắt buộc' 
    });
  }
  
  // Validate severity
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(severity)) {
    return res.status(400).json({ 
      error: 'Mức độ cảnh báo không hợp lệ',
      validSeverities 
    });
  }
  
  db.run(`
    INSERT INTO alerts (station_id, alert_type, severity, message)
    VALUES (?, ?, ?, ?)
  `, [station_id, alert_type, severity, message], function(err) {
    if (err) {
      console.error('❌ Lỗi tạo cảnh báo:', err);
      return res.status(500).json({ error: 'Lỗi tạo cảnh báo' });
    }
    
    // Emit socket event để cập nhật real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('new_alert', {
        id: this.lastID,
        station_id: parseInt(station_id),
        alert_type,
        severity,
        message,
        created_at: new Date().toISOString()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Tạo cảnh báo thành công',
      data: {
        id: this.lastID,
        station_id,
        alert_type,
        severity,
        message
      }
    });
  });
});

// PUT /api/alerts/:id/acknowledge - Xác nhận cảnh báo
router.put('/:id/acknowledge', (req, res) => {
  const db = getDatabase();
  const alertId = req.params.id;
  const { acknowledged_by } = req.body;
  
  if (!acknowledged_by) {
    return res.status(400).json({ error: 'Tên người xác nhận là bắt buộc' });
  }
  
  db.run(`
    UPDATE alerts 
    SET status = 'acknowledged', 
        acknowledged_by = ?, 
        acknowledged_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status = 'active'
  `, [acknowledged_by, alertId], function(err) {
    if (err) {
      console.error('❌ Lỗi xác nhận cảnh báo:', err);
      return res.status(500).json({ error: 'Lỗi cập nhật database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cảnh báo hoặc đã được xử lý' });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_acknowledged', {
        alertId: parseInt(alertId),
        acknowledged_by,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Xác nhận cảnh báo thành công'
    });
  });
});

// PUT /api/alerts/:id/resolve - Giải quyết cảnh báo
router.put('/:id/resolve', (req, res) => {
  const db = getDatabase();
  const alertId = req.params.id;
  const { resolved_by } = req.body;
  
  if (!resolved_by) {
    return res.status(400).json({ error: 'Tên người giải quyết là bắt buộc' });
  }
  
  db.run(`
    UPDATE alerts 
    SET status = 'resolved', 
        resolved_by = ?, 
        resolved_at = CURRENT_TIMESTAMP
    WHERE id = ? AND status IN ('active', 'acknowledged')
  `, [resolved_by, alertId], function(err) {
    if (err) {
      console.error('❌ Lỗi giải quyết cảnh báo:', err);
      return res.status(500).json({ error: 'Lỗi cập nhật database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cảnh báo hoặc đã được giải quyết' });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('alert_resolved', {
        alertId: parseInt(alertId),
        resolved_by,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Giải quyết cảnh báo thành công'
    });
  });
});

// GET /api/alerts/statistics - Thống kê cảnh báo
router.get('/statistics', (req, res) => {
  const db = getDatabase();
  const { days = 7 } = req.query;
  
  db.all(`
    SELECT 
      severity,
      COUNT(*) as count,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
    FROM alerts 
    WHERE created_at >= datetime('now', '-${days} days')
    GROUP BY severity
  `, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi thống kê cảnh báo:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn database' });
    }
    
    res.json({
      success: true,
      data: rows,
      period: `${days} ngày gần đây`
    });
  });
});

module.exports = router; 