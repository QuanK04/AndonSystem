const express = require('express');
const pool = require('../database/mysql');
const router = express.Router();

// GET /api/statistics/overview - Tổng quan thống kê
router.get('/overview', async (req, res) => {
  try {
    // Lấy thống kê tổng quan
    const [stationStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_stations,
        COUNT(CASE WHEN status = 'normal' THEN 1 END) as normal_stations,
        COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_stations,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_stations,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_stations
      FROM stations
    `);
    
    // Lấy thống kê cảnh báo
    const [alertStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_alerts,
        COUNT(CASE WHEN status = 'acknowledged' THEN 1 END) as acknowledged_alerts,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_alerts,
        COUNT(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 END) as critical_alerts
      FROM alerts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);
    
    res.json({
      success: true,
      data: {
        stations: stationStats[0],
        alerts: alertStats[0],
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('❌ Lỗi thống kê tổng quan:', err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// GET /api/statistics/stations - Thống kê theo trạm
router.get('/stations', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const [rows] = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.code,
        s.status,
        COUNT(a.id) as total_alerts,
        COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_alerts,
        COUNT(CASE WHEN a.severity = 'critical' THEN 1 END) as critical_alerts,
        MAX(a.created_at) as last_alert_time
      FROM stations s
      LEFT JOIN alerts a ON s.id = a.station_id 
        AND a.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY s.id
      ORDER BY active_alerts DESC, total_alerts DESC
    `, [days]);
    
    res.json({
      success: true,
      data: rows,
      period: `${days} ngày gần đây`
    });
  } catch (err) {
    console.error('❌ Lỗi thống kê trạm:', err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// GET /api/statistics/alerts/trend - Xu hướng cảnh báo theo thời gian (dựa vào logs)
router.get('/alerts/trend', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        severity,
        COUNT(*) as count
      FROM logs
      WHERE event_type = 'alert'
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at), severity
      ORDER BY date DESC, severity
    `, [days]);
    
    // Nhóm dữ liệu theo ngày
    const trendData = {};
    rows.forEach(row => {
      if (!trendData[row.date]) {
        trendData[row.date] = {
          date: row.date,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        };
      }
      trendData[row.date][row.severity] = row.count;
    });
    
    res.json({
      success: true,
      data: Object.values(trendData),
      period: `${days} ngày gần đây`
    });
  } catch (err) {
    console.error('❌ Lỗi thống kê xu hướng cảnh báo:', err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// GET /api/statistics/performance - Hiệu suất sản xuất
router.get('/performance', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [rows] = await pool.query(`
      SELECT 
        s.name as station_name,
        s.code as station_code,
        COALESCE(ps.total_products, 0) as total_products,
        COALESCE(ps.defect_products, 0) as defect_products,
        COALESCE(ps.downtime_minutes, 0) as downtime_minutes,
        CASE 
          WHEN ps.total_products > 0 
          THEN ROUND((ps.total_products - ps.defect_products) * 100.0 / ps.total_products, 2)
          ELSE 0 
        END as quality_rate
      FROM stations s
      LEFT JOIN production_stats ps ON s.id = ps.station_id 
        AND ps.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY s.name
    `, [days]);
    
    // Tính tổng
    const totals = rows.reduce((acc, row) => {
      acc.total_products += row.total_products;
      acc.defect_products += row.defect_products;
      acc.downtime_minutes += row.downtime_minutes;
      return acc;
    }, { total_products: 0, defect_products: 0, downtime_minutes: 0 });
    
    totals.quality_rate = totals.total_products > 0 
      ? Math.round((totals.total_products - totals.defect_products) * 100 / totals.total_products)
      : 0;
    
    res.json({
      success: true,
      data: {
        stations: rows,
        totals: totals
      },
      period: `${days} ngày gần đây`
    });
  } catch (err) {
    console.error('❌ Lỗi thống kê hiệu suất:', err);
    res.status(500).json({ error: 'Lỗi truy vấn database' });
  }
});

// POST /api/statistics/production - Cập nhật thống kê sản xuất
router.post('/production', async (req, res) => {
  try {
    const { station_id, total_products, defect_products, downtime_minutes, date } = req.body;
    
    if (!station_id || total_products === undefined) {
      return res.status(400).json({ error: 'station_id và total_products là bắt buộc' });
    }
    
    const productionDate = date || new Date().toISOString().split('T')[0];
    
    await pool.query(`
      INSERT INTO production_stats 
      (station_id, date, total_products, defect_products, downtime_minutes)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      total_products = VALUES(total_products),
      defect_products = VALUES(defect_products),
      downtime_minutes = VALUES(downtime_minutes)
    `, [
      station_id, 
      productionDate, 
      total_products || 0, 
      defect_products || 0, 
      downtime_minutes || 0
    ]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Lỗi cập nhật thống kê sản xuất:', err);
    res.status(500).json({ error: 'Lỗi cập nhật thống kê sản xuất' });
  }
});

module.exports = router; 