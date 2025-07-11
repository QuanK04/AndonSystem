import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Stations API
export const fetchStations = async () => {
  try {
    const response = await api.get('/stations');
    return response.data || [];
  } catch (error) {
    console.error('❌ Lỗi fetch stations:', error);
    return [];
  }
};

export const updateStationStatus = async (stationId, status) => {
  try {
    const response = await api.put(`/stations/${stationId}/status`, { status });
    return response;
  } catch (error) {
    console.error('❌ Lỗi update station status:', error);
    throw error;
  }
};

// Alerts API
export const fetchAlerts = async (params = {}) => {
  try {
    const response = await api.get('/alerts', { params });
    return response.data || [];
  } catch (error) {
    console.error('❌ Lỗi fetch alerts:', error);
    return [];
  }
};

export const fetchActiveAlerts = async () => {
  try {
    const response = await api.get('/alerts/active');
    return response.data || [];
  } catch (error) {
    console.error('❌ Lỗi fetch active alerts:', error);
    return [];
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await api.post('/alerts', alertData);
    return response;
  } catch (error) {
    console.error('❌ Lỗi create alert:', error);
    throw error;
  }
};

export const acknowledgeAlert = async (alertId, acknowledgedBy) => {
  try {
    const response = await api.put(`/alerts/${alertId}/acknowledge`, {
      acknowledged_by: acknowledgedBy
    });
    return response;
  } catch (error) {
    console.error('❌ Lỗi acknowledge alert:', error);
    throw error;
  }
};

export const resolveAlert = async (alertId, resolvedBy) => {
  try {
    const response = await api.put(`/alerts/${alertId}/resolve`, {
      resolved_by: resolvedBy
    });
    return response;
  } catch (error) {
    console.error('❌ Lỗi resolve alert:', error);
    throw error;
  }
};

export const fetchAlertStatistics = async (days = 7) => {
  try {
    const response = await api.get('/alerts/statistics', { params: { days } });
    return response.data || [];
  } catch (error) {
    console.error('❌ Lỗi fetch alert statistics:', error);
    return [];
  }
};

// Statistics API
export const fetchStatistics = async () => {
  try {
    const response = await api.get('/statistics/overview');
    return response.data || {};
  } catch (error) {
    console.error('❌ Lỗi fetch statistics:', error);
    return {};
  }
};

export const fetchStationStatistics = async (days = 7) => {
  try {
    const response = await api.get('/statistics/stations', { params: { days } });
    return response.data || [];
  } catch (error) {
    console.error('❌ Lỗi fetch station statistics:', error);
    return [];
  }
};

export const fetchAlertTrends = async (days = 7) => {
  try {
    const response = await api.get('/statistics/alerts/trend', { params: { days } });
    return response.data || [];
  } catch (error) {
    console.error('❌ Lỗi fetch alert trends:', error);
    return [];
  }
};

export const fetchPerformanceStats = async (days = 30) => {
  try {
    const response = await api.get('/statistics/performance', { params: { days } });
    return response.data || {};
  } catch (error) {
    console.error('❌ Lỗi fetch performance stats:', error);
    return {};
  }
};

export const updateProductionStats = async (productionData) => {
  try {
    const response = await api.post('/statistics/production', productionData);
    return response;
  } catch (error) {
    console.error('❌ Lỗi update production stats:', error);
    throw error;
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response;
  } catch (error) {
    console.error('❌ Lỗi health check:', error);
    throw error;
  }
};

export default api; 