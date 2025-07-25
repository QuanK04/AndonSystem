// Mock data cho frontend demo
export const mockStations = [
  // Khu sơn (S)
  {
    id: 'S1',
    name: 'Chuyền treo',
    code: 'S1',
    description: 'Chuyền treo sơn',
    location_x: 100,
    location_y: 50,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'S2',
    name: 'UV ván',
    code: 'S2',
    description: 'Sơn UV cho ván',
    location_x: 200,
    location_y: 50,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'S3',
    name: 'Chuyền Cefla',
    code: 'S3',
    description: 'Chuyền sơn Cefla',
    location_x: 300,
    location_y: 50,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'S4',
    name: 'Chà nhám bề mặt',
    code: 'S4',
    description: 'Chà nhám bề mặt sản phẩm',
    location_x: 400,
    location_y: 50,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  // Khu Carcass (C)
  {
    id: 'C1',
    name: 'Cắt ván',
    code: 'C1',
    description: 'Cắt ván theo kích thước',
    location_x: 100,
    location_y: 150,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'C2',
    name: 'Tạo rãnh',
    code: 'C2',
    description: 'Tạo rãnh trên ván',
    location_x: 200,
    location_y: 150,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'C3',
    name: 'Khoan lỗ',
    code: 'C3',
    description: 'Khoan lỗ trên ván',
    location_x: 300,
    location_y: 150,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'C4',
    name: 'Dán biên',
    code: 'C4',
    description: 'Dán biên ván',
    location_x: 400,
    location_y: 150,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  // Khu đóng gói (P)
  {
    id: 'P1',
    name: 'Line 1',
    code: 'P1',
    description: 'Dây chuyền đóng gói Line 1',
    location_x: 100,
    location_y: 250,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'P2',
    name: 'Line 2',
    code: 'P2',
    description: 'Dây chuyền đóng gói Line 2',
    location_x: 200,
    location_y: 250,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  },
  {
    id: 'P3',
    name: 'Lắp ráp',
    code: 'P3',
    description: 'Khu vực lắp ráp sản phẩm',
    location_x: 300,
    location_y: 250,
    status: 'normal',
    active_alerts: 0,
    last_updated: new Date().toISOString()
  }
];

export const mockAlerts = [
  {
    id: 1,
    station_id: 'S2',
    station_name: 'UV ván',
    station_code: 'S2',
    alert_type: 'equipment_failure',
    severity: 'medium',
    message: 'Máy sơn UV bị kẹt, cần kiểm tra',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged_by: null,
    acknowledged_at: null,
    resolved_by: null,
    resolved_at: null
  },
  {
    id: 2,
    station_id: 'P3',
    station_name: 'Lắp ráp',
    station_code: 'P3',
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
    station_id: 'C4',
    station_name: 'Dán biên',
    station_code: 'C4',
    alert_type: 'material_shortage',
    severity: 'high',
    message: 'Thiếu vật tư dán biên',
    status: 'acknowledged',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledged_by: 'Nguyễn Văn A',
    acknowledged_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    resolved_by: null,
    resolved_at: null
  },
  {
    id: 4,
    station_id: 'S1',
    station_name: 'Chuyền treo',
    station_code: 'S1',
    alert_type: 'maintenance_required',
    severity: 'low',
    message: 'Cần bảo trì định kỳ chuyền treo',
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