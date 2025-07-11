const express = require('express');
const { getDatabase } = require('../database/database');
const router = express.Router();

// GET /api/stations - Lấy danh sách tất cả trạm
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      s.*,
      COUNT(a.id) as active_alerts,
      MAX(a.created_at) as last_alert_time
    FROM stations s
    LEFT JOIN alerts a ON s.id = a.station_id AND a.status = 'active'
    GROUP BY s.id
    ORDER BY s.name
  `, (err, rows) => {
    if (err) {
      console.error('❌ Lỗi truy vấn trạm:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn database' });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// GET /api/stations/:id - Lấy thông tin chi tiết trạm
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const stationId = req.params.id;
  
  db.get(`
    SELECT 
      s.*,
      COUNT(a.id) as active_alerts,
      MAX(a.created_at) as last_alert_time
    FROM stations s
    LEFT JOIN alerts a ON s.id = a.station_id AND a.status = 'active'
    WHERE s.id = ?
    GROUP BY s.id
  `, [stationId], (err, row) => {
    if (err) {
      console.error('❌ Lỗi truy vấn trạm:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn database' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Không tìm thấy trạm' });
    }
    
    res.json({
      success: true,
      data: row
    });
  });
});

// PUT /api/stations/:id/status - Cập nhật trạng thái trạm
router.put('/:id/status', (req, res) => {
  const db = getDatabase();
  const stationId = req.params.id;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['normal', 'warning', 'error', 'maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Trạng thái không hợp lệ',
      validStatuses 
    });
  }
  
  db.run(`
    UPDATE stations 
    SET status = ?, last_updated = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [status, stationId], function(err) {
    if (err) {
      console.error('❌ Lỗi cập nhật trạng thái trạm:', err);
      return res.status(500).json({ error: 'Lỗi cập nhật database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Không tìm thấy trạm' });
    }
    
    // Emit socket event để cập nhật real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('station_status_updated', {
        stationId: parseInt(stationId),
        status: status,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: { stationId, status }
    });
  });
});

// POST /api/stations - Tạo trạm mới
router.post('/', (req, res) => {
  const db = getDatabase();
  const { name, code, description, location_x, location_y } = req.body;
  
  // Validate required fields
  if (!name || !code) {
    return res.status(400).json({ 
      error: 'Tên và mã trạm là bắt buộc' 
    });
  }
  
  db.run(`
    INSERT INTO stations (name, code, description, location_x, location_y)
    VALUES (?, ?, ?, ?, ?)
  `, [name, code, description || '', location_x || 0, location_y || 0], function(err) {
    if (err) {
      console.error('❌ Lỗi tạo trạm:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Mã trạm đã tồn tại' });
      }
      return res.status(500).json({ error: 'Lỗi tạo trạm' });
    }
    
    res.status(201).json({
      success: true,
      message: 'Tạo trạm thành công',
      data: {
        id: this.lastID,
        name,
        code,
        description,
        location_x,
        location_y
      }
    });
  });
});

// DELETE /api/stations/:id - Xóa trạm
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const stationId = req.params.id;
  
  db.run('DELETE FROM stations WHERE id = ?', [stationId], function(err) {
    if (err) {
      console.error('❌ Lỗi xóa trạm:', err);
      return res.status(500).json({ error: 'Lỗi xóa trạm' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Không tìm thấy trạm' });
    }
    
    res.json({
      success: true,
      message: 'Xóa trạm thành công'
    });
  });
});

module.exports = router; 