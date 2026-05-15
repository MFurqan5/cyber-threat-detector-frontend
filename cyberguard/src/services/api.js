import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

// ─── Scan Endpoints ────────────────────────────────────────────────────────────

/**
 * Scan a URL for phishing/malicious threats
 * @param {string} url - The URL to scan
 * @returns {Promise<{result: {prediction_label, confidence_score, threat_type}, source: string}>}
 */
export const scanUrl = (url) =>
  api.post('/scan/url', { url })

/**
 * Scan an email for spam/phishing
 * @param {string} text - The email text content
 * @returns {Promise<{result: {prediction_label, confidence_score, threat_type, indicators, summary}, source: string}>}
 */
export const scanEmail = (text) =>
  api.post('/scan/email', { text })

// ─── Stats Endpoint ────────────────────────────────────────────────────────────

/**
 * Get platform-wide statistics
 * @returns {Promise<{total_scans, threats_detected, safe_requests, cache_hit_rate, scan_activity, threat_distribution}>}
 */
export const getStats = () =>
  api.get('/stats')

// ─── History Endpoint ──────────────────────────────────────────────────────────

/**
 * Get scan history
 * @param {number} limit - Number of records to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<{records: Array, total: number}>}
 */
export const getHistory = (limit = 50, offset = 0) =>
  api.get('/history', { params: { limit, offset } })

// ─── Cache Status Endpoint ─────────────────────────────────────────────────────

/**
 * Get cache performance metrics
 * @returns {Promise<{l1: {hits, misses, hit_rate}, l2: {hits, misses, hit_rate}, l3: {hits, misses, hit_rate}}>}
 */
export const getCacheStatus = () =>
  api.get('/cache/status')

export default api
