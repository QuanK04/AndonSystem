const express = require('express');
const pool = require('../database/mysql');
const router = express.Router();
const axios = require('axios');

// GET /api/stations - Lấy danh sách tất cả trạm
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        COUNT(a.id) as active_alerts,
        MAX(a.created_at) as last_alert_time
      FROM stations s
      LEFT JOIN alerts a ON s.id = a.station_id AND a.status = 'active'
      GROUP BY s.id
      ORDER BY s.name
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (err) {
    console.error('❌ Lỗi truy vấn trạm:', err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// GET /api/stations/:id - Lấy thông tin chi tiết trạm
router.get('/:id', async (req, res) => {
  const stationId = req.params.id;
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        COUNT(a.id) as active_alerts,
        MAX(a.created_at) as last_alert_time
      FROM stations s
      LEFT JOIN alerts a ON s.id = a.station_id AND a.status = 'active'
      WHERE s.id = ?
      GROUP BY s.id
    `, [stationId]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Không tìm thấy trạm' });
    }
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('❌ Lỗi truy vấn trạm:', err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// PUT /api/stations/:id/status - Cập nhật trạng thái trạm
router.put('/:id/status', async (req, res) => {
  const stationId = req.params.id;
  const { status } = req.body;
  const validStatuses = ['normal', 'warning', 'error', 'maintenance'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Trạng thái không hợp lệ',
      validStatuses 
    });
  }
  try {
    // Lấy trạng thái cũ
    const [[oldStation]] = await pool.query(
      `SELECT status FROM stations WHERE id = ?`,
      [stationId]
    );
    const oldStatus = oldStation ? oldStation.status : null;
    const [result] = await pool.query(
      `UPDATE stations SET status = ?, last_updated = NOW() WHERE id = ?`,
      [status, stationId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy trạm' });
    }
    // Ghi log vào bảng logs mới
    await pool.query(
      `INSERT INTO logs (event_type, source, station_id, old_status, new_status) VALUES ('change_status', 'server', ?, ?, ?)`,
      [stationId, oldStatus, status]
    );
    // Emit socket event để cập nhật real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('station_status_updated', {
        stationId,
        status: status,
        timestamp: new Date().toISOString()
      });
    }
    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: { stationId, status }
    });
  } catch (err) {
    console.error('❌ Lỗi cập nhật trạng thái trạm:', err);
    res.status(500).json({ error: 'Lỗi cập nhật database' });
  }
});

// POST /api/stations - Tạo trạm mới
router.post('/', async (req, res) => {
  const { name, code, description, location_x, location_y } = req.body;
  if (!name || !code) {
    return res.status(400).json({ 
      error: 'Tên và mã trạm là bắt buộc' 
    });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO stations (id, name, code, description, location_x, location_y, status, last_updated) VALUES (?, ?, ?, ?, ?, ?, 'normal', NOW())`,
      [code, name, code, description || '', location_x || 0, location_y || 0]
    );
    res.status(201).json({
      success: true,
      message: 'Tạo trạm thành công',
      data: {
        id: code,
        name,
        code,
        description,
        location_x,
        location_y
      }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Mã trạm đã tồn tại' });
    }
    console.error('❌ Lỗi tạo trạm:', err);
    res.status(500).json({ error: 'Lỗi tạo trạm' });
  }
});

// DELETE /api/stations/:id - Xóa trạm
router.delete('/:id', async (req, res) => {
  const stationId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM stations WHERE id = ?', [stationId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy trạm' });
    }
    res.json({
      success: true,
      message: 'Xóa trạm thành công'
    });
  } catch (err) {
    console.error('❌ Lỗi xóa trạm:', err);
    res.status(500).json({ error: 'Lỗi xóa trạm' });
  }
});

// POST /api/stations/reset-all - Đặt lại tất cả trạng thái trạm về bình thường và ghi log cho từng trạm, gửi Power Automate flow
router.post('/reset-all', async (req, res) => {
  try {
    const [stations] = await pool.query(`SELECT id, status FROM stations WHERE status != 'normal'`);
    for (const station of stations) {
      await pool.query(`UPDATE stations SET status = 'normal', last_updated = NOW() WHERE id = ?`, [station.id]);
      await pool.query(
        `INSERT INTO logs (event_type, source, station_id, old_status, new_status) VALUES ('change_status', 'server', ?, ?, 'normal')`,
        [station.id, station.status]
      );
    }
    // Ghi thêm 1 log tổng thể
    await pool.query(`INSERT INTO logs (event_type, source) VALUES ('clear_all', 'server')`);
    // Gửi Power Automate flow
    const FLOW_URL = 'https://prod-45.southeastasia.logic.azure.com:443/workflows/3d860fe555f04bc5a6a1a4630b9890c5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HWlj8bkWQBvhnaqVgDbwdsbTm5euiiynjAGKSveJenE';
    const TEAM_ID = '2f9ba389-5c1c-4903-8cde-d1e9d2e46802';
    const CHANNEL_ID = '19:mWUxm9v5XYDN9M9S44wvCveg2kwZPKpQNg66T5ausIk1@thread.tacv2';
    try {
      await axios.post(FLOW_URL, {
        channelId: CHANNEL_ID,
        teamId: TEAM_ID,
        message: '[ANDON] Tất cả các trạm được reset về trạng thái bình thường'
      });
    } catch (err) {
      console.error('❌ Lỗi gửi Power Automate flow reset all:', err.message);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi reset trạng thái tất cả trạm:', err);
    res.status(500).json({ error: 'Lỗi reset trạng thái tất cả trạm' });
  }
});

// GET /api/stations/:id/status-log?date=YYYY-MM-DD - Lịch sử trạng thái của trạm trong ngày
router.get('/:id/status-log', async (req, res) => {
  const stationId = req.params.id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Thiếu ngày (date)' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT time, new_status FROM logs WHERE station_id = ? AND event_type = 'change_status' AND DATE(time) = ? ORDER BY time ASC`,
      [stationId, date]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ Lỗi lấy lịch sử trạng thái trạm:', err);
    res.status(500).json({ error: 'Lỗi lấy lịch sử trạng thái trạm' });
  }
});

module.exports = router; 