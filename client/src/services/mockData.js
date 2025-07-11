// Mock data cho frontend demo
export const mockStations = [
  {
    id: 1,
    name: 'CNC',
    code: 'CNC',
    description: 'Cắt gỗ theo thiết kế',
    location_x: 100,
    location_y: 50,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Dán cạnh',
    code: 'EDGE',
    description: 'Dán cạnh cho các tấm gỗ',
    location_x: 300,
    location_y: 50,
    status: 'warning',
    active_alerts: 1,
    last_updated: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Khoan lỗ',
    code: 'DRILL',
    description: 'Khoan lỗ cho bản lề và phụ kiện',
    location_x: 500,
    location_y: 50,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Lắp ráp',
    code: 'ASSEMBLY',
    description: 'Lắp ráp các thành phần',
    location_x: 100,
    location_y: 200,
    status: 'error',
    active_alerts: 2,
    last_updated: new Date().toISOString()
  },
  {
    id: 5,
    name: 'KCS',
    code: 'QC',
    description: 'Kiểm tra chất lượng sản phẩm',
    location_x: 300,
    location_y: 200,
    status: 'maintenance',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Đóng gói',
    code: 'PACK',
    description: 'Đóng gói thành phẩm',
    location_x: 500,
    location_y: 200,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  }
];

export const mockAlerts = [
  {
    id: 1,
    station_id: 2,
    station_name: 'Dán cạnh',
    station_code: 'EDGE',
    alert_type: 'equipment_failure',
    severity: 'medium',
    message: 'Máy dán cạnh bị kẹt, cần kiểm tra',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_by: null,
    resolved_at: null
  },
  {
    id: 2,
    station_id: 4,
    station_name: 'Lắp ráp',
    station_code: 'ASSEMBLY',
    alert_type: 'quality_issue',
    severity: 'critical',
    message: 'Phát hiện lỗi lắp ráp nghiêm trọng',
    status: 'active',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_by: null,
    resolved_at: null
  },
  {
    id: 3,
    station_id: 4,
    station_name: 'Lắp ráp',
    station_code: 'ASSEMBLY',
    alert_type: 'material_shortage',
    severity: 'high',
    message: 'Thiếu phụ kiện lắp ráp',
    status: 'acknowledged',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledged_by: 'Nguyễn Văn A',
    acknowledged_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    resolved_by: null,
    resolved_at: null
  },
  {
    id: 4,
    station_id: 1,
    station_name: 'CNC',
    station_code: 'CNC',
    alert_type: 'maintenance_required',
    severity: 'low',
    message: 'Cần bảo trì định kỳ máy CNC',
    status: 'resolved',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    acknowledged_by: 'Trần Thị B',
    acknowledged_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
    resolved_by: 'Trần Thị B',
    resolved_at: new Date(Date.now() - 80 * 60 * 1000).toISOString()
  }
];

export const mockStatistics = {
  stations: {
    total_stations: 6,
    normal_stations: 3,
    warning_stations: 1,
    error_stations: 1,
    maintenance_stations: 1
  },
  alerts: {
    total_alerts: 4,
    active_alerts: 2,
    acknowledged_alerts: 1,
    resolved_alerts: 1,
    critical_alerts: 1
  }
};

// Mock Socket.IO cho demo
export class MockSocket {
  constructor() {
    this.listeners = {};
    this.connected = true;
    console.log('🔌 Mock Socket.IO đã được khởi tạo');
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    console.log(`📤 Mock Socket emit: ${event}`, data);
    
    // Simulate responses
    if (event === 'create_alert') {
      setTimeout(() => {
        const newAlert = {
          id: Date.now(),
          station_id: data.station_id,
          station_name: mockStations.find(s => s.id === data.station_id)?.name,
          station_code: mockStations.find(s => s.id === data.station_id)?.code,
          alert_type: data.alert_type,
          severity: data.severity,
          message: data.message,
          status: 'active',
          created_at: new Date().toISOString()
        };
        mockAlerts.unshift(newAlert);
        this.trigger('alert_created', { success: true, id: newAlert.id });
        this.trigger('new_alert', newAlert);
      }, 500);
    }
    
    if (event === 'acknowledge_alert') {
      setTimeout(() => {
        const alert = mockAlerts.find(a => a.id === data.alert_id);
        if (alert) {
          alert.status = 'acknowledged';
          alert.acknowledged_by = data.acknowledged_by;
          alert.acknowledged_at = new Date().toISOString();
        }
        this.trigger('alert_acknowledged_success', { success: true });
        this.trigger('alert_acknowledged', {
          alert_id: data.alert_id,
          acknowledged_by: data.acknowledged_by,
          timestamp: new Date().toISOString()
        });
      }, 300);
    }
    
    if (event === 'resolve_alert') {
      setTimeout(() => {
        const alert = mockAlerts.find(a => a.id === data.alert_id);
        if (alert) {
          alert.status = 'resolved';
          alert.resolved_by = data.resolved_by;
          alert.resolved_at = new Date().toISOString();
        }
        this.trigger('alert_resolved_success', { success: true });
        this.trigger('alert_resolved', {
          alert_id: data.alert_id,
          resolved_by: data.resolved_by,
          timestamp: new Date().toISOString()
        });
      }, 300);
    }
    
    if (event === 'update_station_status') {
      setTimeout(() => {
        const station = mockStations.find(s => s.id === data.station_id);
        if (station) {
          station.status = data.status;
          station.last_updated = new Date().toISOString();
        }
        this.trigger('station_status_updated_success', { success: true });
        this.trigger('station_status_updated', {
          station_id: data.station_id,
          status: data.status,
          timestamp: new Date().toISOString()
        });
      }, 300);
    }
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    this.connected = false;
    console.log('🔌 Mock Socket đã ngắt kết nối');
  }
}

// Mock API functions
export const mockApi = {
  fetchStations: async () => mockStations,
  fetchAlerts: async () => mockAlerts,
  fetchStatistics: async () => mockStatistics,
  fetchActiveAlerts: async () => mockAlerts.filter(a => a.status === 'active'),
  createAlert: async (data) => ({ success: true, data }),
  acknowledgeAlert: async (alertId, acknowledgedBy) => ({ success: true }),
  resolveAlert: async (alertId, resolvedBy) => ({ success: true }),
  updateStationStatus: async (stationId, status) => ({ success: true }),
  checkHealth: async () => ({ status: 'OK', service: 'Mock Andon System' })
}; 