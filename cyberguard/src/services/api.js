import axios from 'axios'

// ─── Cookie Helpers ────────────────────────────────────────────────────────────
export const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export const setCookie = (name, value, days = 7) => {
  let expires = ""
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`
}

export const eraseCookie = (name) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
}

let cookieUrl = getCookie('cg-backend-url')
if (cookieUrl === 'http://localhost:8000') {
  cookieUrl = 'http://127.0.0.1:8000'
  setCookie('cg-backend-url', 'http://127.0.0.1:8000', 30)
}
const BASE_URL = cookieUrl || 'http://127.0.0.1:8000'

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
    const token = getCookie('cg-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = error.response?.data?.detail || error.message || 'Request failed'
    if (Array.isArray(message)) {
      message = message.map(err => {
        const fieldName = err.loc && err.loc.length > 1 ? err.loc[1] : '';
        return fieldName ? `${fieldName}: ${err.msg}` : err.msg;
      }).join(', ')
    } else if (typeof message === 'object') {
      message = JSON.stringify(message)
    }
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
  api.post('/scan/email', { email_content: text })

// ─── Stats Endpoint ────────────────────────────────────────────────────────────

/**
 * Get platform-wide statistics
 * @returns {Promise<{total_scans, threats_detected, safe_requests, cache_hit_rate, scan_activity, threat_distribution}>}
 */
export const getStats = () =>
  api.get('/stats/summary')

// ─── History Endpoint ──────────────────────────────────────────────────────────

/**
 * Get scan history
 * @param {number} limit - Number of records to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<{records: Array, total: number}>}
 */
export const getHistory = (limit = 50, offset = 0) =>
  api.get('/stats/history', { params: { limit, offset } })

// ─── Cache Status Endpoint ─────────────────────────────────────────────────────

/**
 * Get cache performance metrics
 * @returns {Promise<{l1: {hits, misses, hit_rate}, l2: {hits, misses, hit_rate}, l3: {hits, misses, hit_rate}}>}
 */
export const getCacheStatus = () =>
  api.get('/stats/cache/status')

/**
 * Check backend health status
 * @returns {Promise<any>}
 */
export const healthCheck = () =>
  api.get('/')

export default api

// ─── Auth Endpoints ────────────────────────────────────────────────────────────

/**
 * Login with email and password
 * @returns {Promise<{access_token, token_type, user}>}
 */
export const loginUser = (email, password) =>
  api.post('/auth/login', { username_or_email: email, password })

/**
 * Register a new user
 * @returns {Promise<{message, user}>}
 */
export const registerUser = (username, email, password) =>
  api.post('/auth/register', { username, email, password })

/**
 * Get current logged-in user info (optional, if your backend supports it)
 */
export const getMe = () =>
  api.get('/auth/me')

// ─── Malware Scanner Endpoints ─────────────────────────────────────────────────

/**
 * Upload a file for malware scanning
 * @param {File} file - The file to scan
 * @returns {Promise<{verdict, confidence_score, threat_type, indicators, file_name, file_size}>}
 */
export const scanFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/scan/app', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * Search for an app in the safe apps list
 * @param {string} appName - App name to search
 * @returns {Promise<{found, safe, app_name, category, developer, rating, installs}>}
 */
export const searchApp = (appName) =>
  api.post('/scan/app-name', { app_name: appName })
