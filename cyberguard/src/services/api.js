import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== URL SCANNING ==========
export const scanUrl = async (url, email = null) => {
  const response = await api.post('/scan/url', { url, email });
  return response.data;
};

// ========== EMAIL SCANNING ==========
export const scanEmail = async (emailContent, email = null) => {
  const response = await api.post('/scan/email', { 
    email_content: emailContent,
    email: email || 'user@company.com'
  });
  return response.data;
};

// ========== STATISTICS ==========
export const getStats = async (hours = 24) => {
  try {
    const response = await api.get('/stats/summary', { params: { hours } });
    console.log('Real stats from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get real stats:', error);
    return {
      total_scans: 0,
      threats_detected: 0,
      safe_requests: 0
    };
  }
};

// ========== HISTORY ==========
export const getHistory = async (limit = 100, offset = 0, scanType = null, maliciousOnly = false) => {
  try {
    const params = { limit, offset };
    if (scanType) params.scan_type = scanType;
    if (maliciousOnly) params.malicious_only = true;
    
    const response = await api.get('/stats/history', { params });
    console.log('Real history from backend:', response.data);
    
    if (response.data && response.data.scans) {
      return {
        records: response.data.scans.map(scan => ({
          id: scan.id,
          timestamp: new Date(scan.timestamp).toLocaleString(),
          input_type: scan.type,
          status: scan.prediction === 'malicious' ? 'malicious' : 'safe',
          threat_type: scan.threat_type,
          confidence_score: scan.confidence,
          input_value: scan.input
        })),
        total: response.data.total
      };
    }
    return { records: [], total: 0 };
  } catch (error) {
    console.error('Failed to get real history:', error);
    return { records: [], total: 0 };
  }
};

// ========== CACHE STATUS - NO HARDCODED VALUES ==========
export const getCacheStatus = async () => {
  try {
    const response = await api.get('/stats/cache/status');
    console.log('Raw cache status from backend:', response.data);
    
    // Return backend data directly - NO hardcoded values!
    return {
      l1: {
        hit_rate: response.data.l1?.hit_rate || 0,
        hits: response.data.l1?.hits || 0,
        misses: response.data.l1?.misses || 0
      },
      l2: {
        hit_rate: response.data.l2?.hit_rate || 0,
        hits: response.data.l2?.hits || 0,
        misses: response.data.l2?.misses || 0
      },
      l3: {
        hit_rate: response.data.l3?.hit_rate || 0,
        hits: response.data.l3?.hits || 0,
        misses: response.data.l3?.misses || 0
      }
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return {
      l1: { hit_rate: 0, hits: 0, misses: 0 },
      l2: { hit_rate: 0, hits: 0, misses: 0 },
      l3: { hit_rate: 0, hits: 0, misses: 0 }
    };
  }
};

// ========== HEALTH CHECK ==========
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;