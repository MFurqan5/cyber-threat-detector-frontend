import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart2, Shield, AlertTriangle, Zap, Database,
  Users, FileText, Server, RefreshCw, Download,
  CheckCircle, Activity,
  Clock, Globe, Mail, File, Smartphone, LogOut, Lock, Cpu,
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ui/ThemeSwitcher'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import { getAdminStats, getAdminHistory, getAdminCacheStatus } from '../services/api'
import { useNavigate } from 'react-router-dom'

const ADMIN_EMAIL    = 'admin@cyberguard.ai'
const ADMIN_PASSWORD = 'admin123'

// ─── Helpers ───────────────────────────────────────────────────────────────────
const PIE_COLORS = { Phishing: '#f43f5e', Spam: '#f59e0b', Malware: '#6366f1', Clean: '#10b981' }

// ─── Sub-components ────────────────────────────────────────────────────────────
const Card = ({ children, className = '', style = {} }) => {
  const { theme } = useTheme()
  return (
    <div className={`rounded-2xl ${className}`}
      style={{
        background: theme.cardBg,
        backdropFilter: theme.cardBlur,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow,
        transition: 'background 0.4s, border-color 0.4s',
        ...style,
      }}>
      {children}
    </div>
  )
}

const SectionTitle = ({ icon: Icon, title, subtitle, action }) => {
  const { theme } = useTheme()
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${theme.accent}14`, border: `1px solid ${theme.accent}28` }}>
          <Icon size={15} style={{ color: theme.accent }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>{title}</h3>
          {subtitle && <p className="text-xs" style={{ color: theme.textMuted }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

const StatusDot = ({ ok }) => (
  <div className="w-2 h-2 rounded-full" style={{ background: ok ? '#10b981' : '#f43f5e', boxShadow: ok ? '0 0 6px #10b981' : '0 0 6px #f43f5e' }} />
)

const CustomTooltip = ({ active, payload, label }) => {
  const { theme } = useTheme()
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-xs"
      style={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(8px)' }}>
      <p className="mb-1" style={{ color: theme.textMuted }}>{label}</p>
      {payload.map((e, i) => <p key={i} style={{ color: e.color || e.fill }}>{e.name || e.dataKey}: <span className="font-semibold">{e.value}</span></p>)}
    </div>
  )
}

const ScanTypeIcon = ({ type }) => {
  const { theme } = useTheme()
  const size = 11
  switch (type?.toLowerCase()) {
    case 'url':   return <Globe size={size} style={{ color: theme.accent }} />
    case 'email': return <Mail size={size} style={{ color: theme.warning }} />
    case 'file':  return <File size={size} style={{ color: theme.accent }} />
    case 'app':   return <Smartphone size={size} style={{ color: theme.warning }} />
    default:      return <Globe size={size} style={{ color: theme.accent }} />
  }
}

// ─── CSV Export (uses live data passed in) ────────────────────────────────────
const buildCSV = (records) => {
  const rows = [
    ['Timestamp', 'Type', 'Input', 'Status', 'Confidence', 'Inference(ms)'],
    ...(records || []).map(r => [
      r.timestamp || '',
      r.input_type || '',
      r.input_value || '',
      r.status || '',
      r.confidence_score ? `${Math.round(r.confidence_score * 100)}%` : '',
      r.inference_ms || '',
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `cyberguard-admin-${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// ─── Login screen ──────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError('Invalid admin credentials.')
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center" style={{ background: theme.bgPrimary }}>
      <AnimatedBackground />
      <div className="absolute top-5 right-5 z-20"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm px-6">
        <div className="rounded-2xl p-8"
          style={{ background: theme.cardBg, backdropFilter: theme.cardBlur, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}35`, boxShadow: theme.isDark ? `0 0 24px ${theme.accent}30` : 'none' }}>
              <Lock size={26} style={{ color: theme.accent }} />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold font-display" style={{ color: theme.textPrimary }}>Admin Access</h1>
              <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>CyberGuard AI · Restricted Area</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm mb-4"
                style={{ background: `${theme.danger}10`, border: `1px solid ${theme.danger}30`, color: theme.danger }}>
                <Shield size={14} className="shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: theme.textMuted }}>Admin Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@cyberguard.ai"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: theme.textMuted }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold font-display flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              style={{ background: theme.isDark ? `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}aa)` : theme.accent, color: '#fff', border: 'none', boxShadow: theme.isDark ? `0 0 24px ${theme.accent}40` : `0 4px 14px ${theme.accent}40` }}>
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin 0.8s linear infinite' }} /> : <Lock size={14} />}
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main admin dashboard ──────────────────────────────────────────────────────
const AdminDashboardContent = ({ onLogout }) => {
  const { theme } = useTheme()

  // ── State ────────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null)
  const [cache, setCache] = useState(null)
  const [liveFeed, setLiveFeed] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // ── Fetch all data ───────────────────────────────────────────────────────────
  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [statsData, cacheData, historyData] = await Promise.all([
        getAdminStats(24),
        getAdminCacheStatus(),
        getAdminHistory(10, 0, null, false),
      ])
      setStats(statsData)
      setCache(cacheData)
      setLiveFeed(historyData?.records || [])
      setError(null)
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingStats(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-refresh live feed every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const historyData = await getAdminHistory(10, 0, null, false)
        setLiveFeed(historyData?.records || [])
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }))
      } catch (_) {}
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // ── Derived values ───────────────────────────────────────────────────────────
  const s = stats || {}
  const c = cache || {}

  const cacheL1 = c.l1 || { hits: 0, misses: 0, hit_rate: 0 }
  const cacheL2 = c.l2 || { hits: 0, misses: 0, hit_rate: 0 }
  const cacheL3 = c.l3 || { hits: 0, misses: 0, hit_rate: 0 }

  const pieData = (s.threat_distribution || []).map(item => ({
    ...item,
    color: PIE_COLORS[item.name] || '#888',
  }))

  // Build last-7-days threat data from scan_activity grouped by day
  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date().getDay()
    return Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (today - 6 + i + 7) % 7
      return { day: days[dayIdx], threats: 0 }
    })
  })()

  // Build hourly bar data from scan_activity (last 24h from backend)
  const hourData = (s.scan_activity || [])
    .filter((_, i) => i % 3 === 0) // sample every 3rd hour for readability
    .map(h => ({ hour: h.hour?.substring(0, 2) || '00', scans: h.scans || 0 }))

  if (loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.bgPrimary }}>
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-transparent mx-auto mb-4"
            style={{ borderTopColor: theme.accent, animation: 'spin 0.8s linear infinite' }} />
          <p className="text-sm" style={{ color: theme.textMuted }}>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: theme.bgPrimary }}>
      <AnimatedBackground />

      {/* Top bar */}
      <div className="relative z-10 sticky top-0"
        style={{ background: theme.navbarBg, backdropFilter: theme.isDark ? 'blur(20px)' : 'none', borderBottom: `1px solid ${theme.navbarBorder}` }}>
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}30` }}>
              <Shield size={16} style={{ color: theme.accent }} />
            </div>
            <div>
              <span className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>CyberGuard</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${theme.danger}15`, color: theme.danger, border: `1px solid ${theme.danger}30` }}>
                ADMIN
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs hidden sm:block" style={{ color: theme.textMuted }}>
                Updated {lastUpdated}
              </span>
            )}
            <button onClick={() => fetchAll(true)} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-70"
              style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => buildCSV(liveFeed)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: theme.isDark ? `${theme.safe}14` : '#f0fdf4', border: `1px solid ${theme.isDark ? `${theme.safe}30` : '#bbf7d0'}`, color: theme.safe }}>
              <Download size={12} /> Export CSV
            </button>
            <ThemeToggle />
            <button onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-70"
              style={{ background: `${theme.danger}10`, border: `1px solid ${theme.danger}25`, color: theme.danger }}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: `${theme.warning}10`, border: `1px solid ${theme.warning}28`, color: theme.warning }}>
            ⚠ Backend error: {error} — showing partial data
          </div>
        )}

        {/* ── Overview Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BarChart2,    label: 'Total Scans (24h)',   value: (s.total_scans || 0).toLocaleString(),      color: theme.accent  },
            { icon: AlertTriangle,label: 'Threats Detected',    value: (s.threats_detected || 0).toLocaleString(), color: theme.danger  },
            { icon: CheckCircle,  label: 'Safe Results',        value: (s.safe_requests || 0).toLocaleString(),    color: theme.safe    },
            { icon: Zap,          label: 'Avg Response Time',   value: s.avg_time_ms ? `${s.avg_time_ms}ms` : 'N/A', color: theme.warning },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="relative overflow-hidden rounded-2xl p-4"
              style={{ background: theme.isDark ? `${color}09` : theme.cardBg, border: `1px solid ${theme.isDark ? `${color}28` : theme.cardBorder}`, boxShadow: theme.isDark ? `0 0 24px ${color}12` : theme.cardShadow }}>
              <div className="absolute -right-3 -bottom-3 opacity-5" style={{ color }}><Icon size={60} /></div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Cache Performance ───────────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionTitle icon={Zap} title="Cache Performance" subtitle="Real-time hit rates and request counts per layer" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: 'l1', label: 'L1 Memory',  color: theme.accent,   data: cacheL1 },
              { key: 'l2', label: 'L2 Redis',   color: theme.safe,     data: cacheL2 },
              { key: 'l3', label: 'L3 MongoDB', color: theme.warning,  data: cacheL3 },
            ].map(({ key, label, color, data }) => {
              const pct = Math.round((data.hit_rate || 0) * 100)
              return (
                <div key={key} className="rounded-xl p-4 text-center"
                  style={{ background: theme.isDark ? `${color}09` : theme.surfaceBg, border: `1px solid ${theme.isDark ? `${color}25` : theme.cardBorder}` }}>
                  <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>{label}</p>
                  <p className="text-3xl font-bold font-display mb-1" style={{ color }}>{pct}%</p>
                  <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: `${color}18` }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${color}70, ${color})` }} />
                  </div>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Hits: <span className="font-semibold" style={{ color }}>{(data.hits || 0).toLocaleString()}</span></p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Misses: <span className="font-semibold" style={{ color: theme.danger }}>{(data.misses || 0).toLocaleString()}</span></p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ── Charts Row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pie — Threat Distribution */}
          <Card className="p-5">
            <SectionTitle icon={BarChart2} title="Threat Breakdown" subtitle="All-time distribution across categories" />
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData.length ? pieData : [{ name: 'No data', value: 1, color: '#3a3a4a' }]}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={pieData.length ? 3 : 0} dataKey="value"
                    label={pieData.length ? ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const r = innerRadius + (outerRadius - innerRadius) * 0.5
                      const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
                      const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
                      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
                    } : false} labelLine={false}>
                    {(pieData.length ? pieData : [{ color: '#3a3a4a' }]).map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {pieData.length ? pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: theme.textMuted }}>{d.name}: <span style={{ color: d.color, fontWeight: 600 }}>{d.value}%</span></span>
                </div>
              )) : (
                <p className="col-span-2 text-xs text-center" style={{ color: theme.textMuted }}>No scan data yet</p>
              )}
            </div>
          </Card>

          {/* Area — Scan Activity (24h) */}
          <Card className="p-5">
            <SectionTitle icon={Activity} title="Scan Activity (24h)" subtitle="Scans and threats per hour" />
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.scan_activity || []}>
                  <defs>
                    <linearGradient id="adminScanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adminThreatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.danger} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark ? 'rgba(255,255,255,0.04)' : '#f3f0ff'} />
                  <XAxis dataKey="hour" tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                  <YAxis tick={{ fill: theme.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="scans" name="Scans" stroke={theme.accent} strokeWidth={2} fill="url(#adminScanGrad)" dot={false} />
                  <Area type="monotone" dataKey="threats" name="Threats" stroke={theme.danger} strokeWidth={2} fill="url(#adminThreatGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar — Hourly Scan Volumes */}
          <Card className="p-5">
            <SectionTitle icon={Clock} title="Scan Volume by Hour" subtitle="Requests per hour (sampled)" />
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark ? 'rgba(255,255,255,0.04)' : '#f3f0ff'} />
                  <XAxis dataKey="hour" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="scans" name="Scans" fill={theme.accent} radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ── Live Scan Feed (real data, polling every 15s) ─────────────────── */}
        <Card className="overflow-hidden">
          <div className="p-5 pb-0">
            <SectionTitle icon={Activity} title="Live Scan Feed" subtitle="Latest 10 scans from all users — refreshes every 15 seconds">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.safe }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.safe, animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                LIVE
              </div>
            </SectionTitle>
          </div>
          {/* Table header */}
          <div className="grid gap-3 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '150px 1fr 70px 90px 60px 70px', background: theme.tableHeaderBg, borderTop: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}>
            <span>Timestamp</span><span>Input</span><span>Type</span><span>Result</span><span>Conf.</span><span>Time(ms)</span>
          </div>
          <AnimatePresence>
            {liveFeed.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: theme.textMuted }}>
                No scan records yet
              </div>
            ) : liveFeed.map((scan, i) => {
              const status = scan.status || 'safe'
              const isSafe = status === 'safe'
              const c = isSafe ? theme.safe : status === 'spam' ? theme.warning : theme.danger
              return (
                <motion.div key={scan.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                  className="grid gap-3 px-5 py-2.5 items-center"
                  style={{ gridTemplateColumns: '150px 1fr 70px 90px 60px 70px', borderBottom: `1px solid ${theme.tableRowBorder}` }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.tableRowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>
                    {scan.timestamp ? scan.timestamp.split('T').join(' ').substring(0, 19) : '—'}
                  </span>
                  <span className="text-xs font-mono truncate" style={{ color: theme.textSecondary }}>
                    {scan.input_value || '—'}
                  </span>
                  <div className="flex items-center gap-1">
                    <ScanTypeIcon type={scan.input_type} />
                    <span className="text-xs uppercase" style={{ color: theme.textSecondary }}>{scan.input_type || '—'}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                    style={{ background: `${c}14`, color: c, border: `1px solid ${c}30` }}>
                    {status}
                  </span>
                  <span className="text-xs tabular-nums" style={{ color: theme.textSecondary }}>
                    {scan.confidence_score ? `${Math.round(scan.confidence_score * 100)}%` : '—'}
                  </span>
                  <span className="text-xs" style={{ color: theme.textMuted }}>
                    {scan.inference_ms ? `${Math.round(scan.inference_ms)}ms` : '—'}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </Card>

        {/* ── Scan Type Breakdown ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <SectionTitle icon={BarChart2} title="Scans by Type (24h)" subtitle="Breakdown of URL, email, file and app scans" />
            <div className="space-y-3">
              {[
                { label: 'URL Scans',   value: s.by_type?.url   || 0, color: theme.accent,   icon: Globe },
                { label: 'Email Scans', value: s.by_type?.email || 0, color: theme.warning,  icon: Mail },
                { label: 'File Scans',  value: s.by_type?.file  || 0, color: theme.safe,     icon: File },
                { label: 'App Scans',   value: s.by_type?.app   || 0, color: '#a78bfa',      icon: Smartphone },
              ].map(({ label, value, color, icon: Icon }) => {
                const total = (s.total_scans || 1)
                const pct = Math.round((value / total) * 100)
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon size={12} style={{ color }} />
                        <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color }}>{value.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* ── System Health ──────────────────────────────────────────────────── */}
          <Card className="p-5">
            <SectionTitle icon={Server} title="System Health" subtitle="Cache layer status based on real response data" />
            <div className="space-y-3">
              {[
                { name: 'L1 Cache (Memory)',   ok: cacheL1.hits + cacheL1.misses > 0, detail: `${cacheL1.hits.toLocaleString()} hits · ${Math.round(cacheL1.hit_rate * 100)}% rate`, color: theme.accent },
                { name: 'L2 Cache (Redis)',    ok: cacheL2.hits + cacheL2.misses > 0, detail: `${cacheL2.hits.toLocaleString()} hits · ${Math.round(cacheL2.hit_rate * 100)}% rate`, color: theme.safe },
                { name: 'L3 Cache (MongoDB)',  ok: cacheL3.hits + cacheL3.misses > 0, detail: `${cacheL3.hits.toLocaleString()} hits · ${Math.round(cacheL3.hit_rate * 100)}% rate`, color: theme.warning },
              ].map(({ name, ok, detail, color }) => (
                <div key={name} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                      <Database size={14} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{name}</p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot ok={ok} />
                    <span className="text-xs font-medium" style={{ color: ok ? theme.safe : theme.danger }}>
                      {ok ? 'Active' : 'No Data'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="px-3 py-3 rounded-xl"
                style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}20` }}>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Total Cache Hits: <span className="font-bold" style={{ color: theme.accent }}>
                    {(cacheL1.hits + cacheL2.hits + cacheL3.hits).toLocaleString()}
                  </span>
                  <span className="ml-3">Total Misses: <span className="font-bold" style={{ color: theme.danger }}>
                    {(cacheL1.misses + cacheL2.misses + cacheL3.misses).toLocaleString()}
                  </span></span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Recent Threat Detections ─────────────────────────────────────────── */}
        {(() => {
          const threats = liveFeed.filter(r => r.status === 'malicious' || r.status === 'spam')
          if (!threats.length) return null
          return (
            <Card className="p-5">
              <SectionTitle icon={FileText} title="Recent Threat Detections" subtitle="Malicious and spam results from live feed" />
              <div className="space-y-3">
                {threats.slice(0, 5).map((log, i) => {
                  const severity = log.confidence_score >= 0.9 ? 'critical' : 'high'
                  const c = severity === 'critical' ? theme.danger : theme.warning
                  return (
                    <div key={log.id || i} className="rounded-xl p-4"
                      style={{ background: `${c}07`, border: `1px solid ${c}22` }}>
                      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
                            style={{ background: `${c}20`, color: c, border: `1px solid ${c}35` }}>
                            {severity}
                          </span>
                          <span className="text-xs font-mono truncate max-w-xs" style={{ color: theme.textPrimary }}>
                            {log.input_value || '—'}
                          </span>
                        </div>
                        <span className="text-xs font-mono" style={{ color: theme.textMuted }}>
                          {log.timestamp ? log.timestamp.substring(0, 19).replace('T', ' ') : '—'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-lg"
                          style={{ background: `${c}09`, border: `1px solid ${c}22`, color: c }}>
                          {log.threat_type || 'unknown'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-lg"
                          style={{ background: `${c}09`, border: `1px solid ${c}22`, color: c }}>
                          {log.input_type || '—'} scan
                        </span>
                        {log.confidence_score && (
                          <span className="text-xs px-2 py-0.5 rounded-lg"
                            style={{ background: `${c}09`, border: `1px solid ${c}22`, color: c }}>
                            {Math.round(log.confidence_score * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })()}

      </div>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('cg-admin') === 'true')

  const handleLogin  = () => { sessionStorage.setItem('cg-admin', 'true');  setLoggedIn(true)  }
  const handleLogout = () => {
    sessionStorage.removeItem('cg-admin')
    logout()
    setLoggedIn(false)
    navigate('/login', { replace: true })
  }

  return loggedIn
    ? <AdminDashboardContent onLogout={handleLogout} />
    : <AdminLogin onLogin={handleLogin} />
}

export default AdminDashboard
