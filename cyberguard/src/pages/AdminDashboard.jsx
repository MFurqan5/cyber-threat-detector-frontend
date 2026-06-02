import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart2, Shield, AlertTriangle, Zap, Database,
  Users, FileText, Server, RefreshCw, Download,
  CheckCircle, XCircle, AlertCircle, Activity,
  Clock, Globe, Mail, LogOut, Lock,
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ui/ThemeSwitcher'
import AnimatedBackground from '../components/ui/AnimatedBackground'

const ADMIN_EMAIL    = 'admin@cyberguard.ai'
const ADMIN_PASSWORD = 'admin123'

// ─── Demo data ─────────────────────────────────────────────────────────────────
const DEMO = {
  stats: { totalScansToday: 1284, threatsDetected: 187, safeResults: 1097, uptime: '99.8%' },
  cache: {
    l1: { hits: 8420, misses: 1840, hitRate: 82, avgMs: 0.3 },
    l2: { hits: 7280, misses: 2960, hitRate: 71, avgMs: 4.8 },
    l3: { hits: 5940, misses: 4300, hitRate: 58, avgMs: 14.2 },
    origin: { hits: 1240, misses: 0, hitRate: 100, avgMs: 52.1 },
  },
  pieData: [
    { name: 'Phishing', value: 38, color: '#f43f5e' },
    { name: 'Spam',     value: 24, color: '#f59e0b' },
    { name: 'Malware',  value: 21, color: '#6366f1' },
    { name: 'Clean',    value: 17, color: '#10b981' },
  ],
  lineData: [
    { day: 'Mon', threats: 24 }, { day: 'Tue', threats: 38 },
    { day: 'Wed', threats: 31 }, { day: 'Thu', threats: 52 },
    { day: 'Fri', threats: 44 }, { day: 'Sat', threats: 19 },
    { day: 'Sun', threats: 28 },
  ],
  hourData: [
    { hour: '00', scans: 12 }, { hour: '03', scans: 8  },
    { hour: '06', scans: 34 }, { hour: '09', scans: 89 },
    { hour: '12', scans: 124},{ hour: '15', scans: 156 },
    { hour: '18', scans: 98 }, { hour: '21', scans: 67 },
  ],
  liveFeed: [
    { id: 1, input: 'https://paypal-secure.ru', type: 'url',   result: 'malicious', confidence: 0.97, layer: 'L1',     ms: 0.3,  time: '14:32:11' },
    { id: 2, input: 'Congratulations winner!', type: 'email', result: 'spam',      confidence: 0.99, layer: 'Model',  ms: 48.2, time: '14:31:55' },
    { id: 3, input: 'https://google.com',      type: 'url',   result: 'safe',      confidence: 0.95, layer: 'L2',     ms: 4.1,  time: '14:31:44' },
    { id: 4, input: 'Hi, meeting at 3pm',      type: 'email', result: 'safe',      confidence: 0.91, layer: 'L1',     ms: 0.3,  time: '14:31:30' },
    { id: 5, input: 'https://malware-dist.tk', type: 'url',   result: 'malicious', confidence: 0.94, layer: 'Model',  ms: 51.0, time: '14:31:18' },
    { id: 6, input: 'https://github.com',      type: 'url',   result: 'safe',      confidence: 0.98, layer: 'L3',     ms: 13.2, time: '14:31:05' },
  ],
  users: [
    { id: 1, name: 'Sarah Ahmed',   email: 'sarah@org.com',  scans: 284, lastLogin: '2 min ago',   role: 'analyst', active: true  },
    { id: 2, name: 'John Malik',    email: 'john@org.com',   scans: 156, lastLogin: '1 hr ago',    role: 'user',    active: true  },
    { id: 3, name: 'Zara Khan',     email: 'zara@org.com',   scans: 423, lastLogin: '3 hrs ago',   role: 'analyst', active: true  },
    { id: 4, name: 'Omar Sheikh',   email: 'omar@org.com',   scans: 89,  lastLogin: '1 day ago',   role: 'user',    active: false },
    { id: 5, name: 'Fatima Noor',   email: 'fatima@org.com', scans: 612, lastLogin: '5 min ago',   role: 'analyst', active: true  },
  ],
  threatLogs: [
    { id: 1, input: 'https://paypal-secure-verify.ru/login', severity: 'critical', action: 'blocked',  indicators: ['brand_impersonation','suspicious_tld','login_form'], explanation: 'Domain mimics PayPal with suspicious TLD and login credential harvesting form detected.', time: '14:32:11' },
    { id: 2, input: 'URGENT: Your account suspended...',    severity: 'high',     action: 'flagged',   indicators: ['urgency_language','credential_request','suspicious_sender'], explanation: 'Email uses urgency tactics to extract credentials. Sender domain is not associated with any known service.', time: '14:28:44' },
    { id: 3, input: 'https://malware-dist.tk/download.exe', severity: 'critical', action: 'blocked',   indicators: ['malware_host','executable_download','suspicious_tld'], explanation: 'Known malware distribution host with direct executable download link on suspicious TLD.', time: '14:22:05' },
  ],
  health: {
    postgres: { status: 'healthy', records: 14820, version: 'PostgreSQL 15.2' },
    redis:    { status: 'healthy', records: 8420,  version: 'Redis 7.0'       },
    mongodb:  { status: 'healthy', records: 5940,  version: 'MongoDB 6.0'     },
    model:    { urlVersion: 'url_model_v1.2.pkl', emailVersion: 'email_model_v1.1.pkl' },
  },
}

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

// ─── CSV Export ────────────────────────────────────────────────────────────────
const exportCSV = () => {
  const rows = [
    ['Timestamp', 'Type', 'Input', 'Result', 'Confidence', 'Layer', 'Response(ms)'],
    ...DEMO.liveFeed.map(r => [r.time, r.type, r.input, r.result, `${Math.round(r.confidence * 100)}%`, r.layer, r.ms]),
  ]
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `cyberguard-admin-export-${Date.now()}.csv`; a.click()
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
                <AlertCircle size={14} className="shrink-0" />{error}
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
  const [liveFeed, setLiveFeed] = useState(DEMO.liveFeed)
  const [users, setUsers] = useState(DEMO.users)
  const [refreshing, setRefreshing] = useState(false)
  const feedTypes = ['url', 'email']
  const feedResults = ['safe', 'malicious', 'spam']
  const feedLayers = ['L1', 'L2', 'L3', 'Model']

  // Auto-refresh live feed every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      const newScan = {
        id: Date.now(),
        input: Math.random() > 0.5 ? `https://site-${Math.floor(Math.random()*999)}.com` : `Email scan #${Math.floor(Math.random()*999)}`,
        type: feedTypes[Math.floor(Math.random() * 2)],
        result: feedResults[Math.floor(Math.random() * 3)],
        confidence: 0.75 + Math.random() * 0.24,
        layer: feedLayers[Math.floor(Math.random() * 4)],
        ms: parseFloat((Math.random() * 60).toFixed(1)),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      }
      setLiveFeed(p => [newScan, ...p.slice(0, 9)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 800))
    setRefreshing(false)
  }

  const toggleRole = (id) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, role: u.role === 'user' ? 'analyst' : 'user' } : u))
  }

  const toggleActive = (id) => {
    setUsers(p => p.map(u => u.id === id ? { ...u, active: !u.active } : u))
  }

  const pieColors = DEMO.pieData.map(d => d.color)

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
            <button onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-70"
              style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={exportCSV}
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

        {/* ── Overview Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BarChart2, label: 'Total Scans Today',  value: DEMO.stats.totalScansToday.toLocaleString(), color: theme.accent },
            { icon: AlertTriangle, label: 'Threats Detected', value: DEMO.stats.threatsDetected.toLocaleString(), color: theme.danger },
            { icon: CheckCircle,   label: 'Safe Results',     value: DEMO.stats.safeResults.toLocaleString(),     color: theme.safe  },
            { icon: Activity,      label: 'System Uptime',    value: DEMO.stats.uptime,                           color: theme.warning },
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
          <SectionTitle icon={Zap} title="Cache Performance" subtitle="Live hit rates and response times per layer" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'l1', label: 'L1 Memory',  color: theme.accent },
              { key: 'l2', label: 'L2 Redis',   color: theme.safe   },
              { key: 'l3', label: 'L3 MongoDB', color: theme.warning },
              { key: 'origin', label: 'Origin Model', color: '#a78bfa' },
            ].map(({ key, label, color }) => {
              const c = DEMO.cache[key]
              return (
                <div key={key} className="rounded-xl p-4 text-center"
                  style={{ background: theme.isDark ? `${color}09` : theme.surfaceBg, border: `1px solid ${theme.isDark ? `${color}25` : theme.cardBorder}` }}>
                  <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>{label}</p>
                  <p className="text-3xl font-bold font-display mb-1" style={{ color }}>{c.hitRate}%</p>
                  <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: `${color}18` }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${c.hitRate}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${color}70, ${color})` }} />
                  </div>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Hits: <span className="font-semibold" style={{ color }}>{c.hits.toLocaleString()}</span></p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Avg: <span className="font-semibold" style={{ color }}>{c.avgMs}ms</span></p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ── Charts Row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pie */}
          <Card className="p-5">
            <SectionTitle icon={BarChart2} title="Threat Breakdown" subtitle="Phishing vs spam vs malware vs clean" />
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DEMO.pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const r = innerRadius + (outerRadius - innerRadius) * 0.5
                      const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
                      const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
                      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>{`${(percent*100).toFixed(0)}%`}</text>
                    }} labelLine={false}>
                    {DEMO.pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {DEMO.pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: theme.textMuted }}>{d.name}: <span style={{ color: d.color, fontWeight: 600 }}>{d.value}%</span></span>
                </div>
              ))}
            </div>
          </Card>

          {/* Line */}
          <Card className="p-5">
            <SectionTitle icon={Activity} title="Threats — Last 7 Days" subtitle="Daily threat detection count" />
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO.lineData}>
                  <defs>
                    <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.danger} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark ? 'rgba(255,255,255,0.04)' : '#f3f0ff'} />
                  <XAxis dataKey="day" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="threats" name="Threats" stroke={theme.danger} strokeWidth={2} fill="url(#threatGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar */}
          <Card className="p-5">
            <SectionTitle icon={Clock} title="Busiest Scan Hours" subtitle="Scans per hour of the day" />
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO.hourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark ? 'rgba(255,255,255,0.04)' : '#f3f0ff'} />
                  <XAxis dataKey="hour" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="scans" name="Scans" fill={theme.accent} radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ── Live Scan Feed ──────────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="p-5 pb-0">
            <SectionTitle icon={Activity} title="Live Scan Feed" subtitle="Auto-refreshes every 5 seconds">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.safe }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.safe, animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                LIVE
              </div>
            </SectionTitle>
          </div>
          {/* Table header */}
          <div className="grid gap-3 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '70px 1fr 80px 90px 60px 65px 80px', background: theme.tableHeaderBg, borderTop: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}>
            <span>Time</span><span>Input</span><span>Type</span><span>Result</span><span>Conf.</span><span>Layer</span><span>Resp.</span>
          </div>
          <AnimatePresence>
            {liveFeed.map((scan, i) => {
              const isSafe = scan.result === 'safe'
              const c = isSafe ? theme.safe : scan.result === 'spam' ? theme.warning : theme.danger
              return (
                <motion.div key={scan.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                  className="grid gap-3 px-5 py-2.5 items-center"
                  style={{ gridTemplateColumns: '70px 1fr 80px 90px 60px 65px 80px', borderBottom: `1px solid ${theme.tableRowBorder}` }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.tableRowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>{scan.time}</span>
                  <span className="text-xs font-mono truncate" style={{ color: theme.textSecondary }}>{scan.input}</span>
                  <div className="flex items-center gap-1">
                    {scan.type === 'url' ? <Globe size={11} style={{ color: theme.accent }} /> : <Mail size={11} style={{ color: theme.warning }} />}
                    <span className="text-xs uppercase" style={{ color: theme.textSecondary }}>{scan.type}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                    style={{ background: `${c}14`, color: c, border: `1px solid ${c}30` }}>
                    {scan.result}
                  </span>
                  <span className="text-xs tabular-nums" style={{ color: theme.textSecondary }}>{Math.round(scan.confidence * 100)}%</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded text-center"
                    style={{ background: theme.surfaceBg, color: theme.accent, border: `1px solid ${theme.cardBorder}` }}>
                    {scan.layer}
                  </span>
                  <span className="text-xs" style={{ color: theme.textMuted }}>{scan.ms}ms</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </Card>

        {/* ── User Management ─────────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="p-5 pb-0">
            <SectionTitle icon={Users} title="User Management" subtitle="All registered users, roles, and activity" />
          </div>
          <div className="grid gap-3 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 1fr 80px 100px 90px 80px 70px', background: theme.tableHeaderBg, borderTop: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}>
            <span>Name</span><span>Email</span><span>Scans</span><span>Last Login</span><span>Role</span><span>Status</span><span>Action</span>
          </div>
          {users.map(user => (
            <div key={user.id} className="grid gap-3 px-5 py-3 items-center"
              style={{ gridTemplateColumns: '1fr 1fr 80px 100px 90px 80px 70px', borderBottom: `1px solid ${theme.tableRowBorder}` }}
              onMouseEnter={e => e.currentTarget.style.background = theme.tableRowHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{user.name}</span>
              <span className="text-xs font-mono truncate" style={{ color: theme.textMuted }}>{user.email}</span>
              <span className="text-xs" style={{ color: theme.textSecondary }}>{user.scans}</span>
              <span className="text-xs" style={{ color: theme.textMuted }}>{user.lastLogin}</span>
              <button onClick={() => toggleRole(user.id)}
                className="text-xs px-2 py-1 rounded-full font-medium w-fit transition-all hover:opacity-80"
                style={{
                  background: user.role === 'analyst' ? `${theme.accent}14` : theme.surfaceBg,
                  color: user.role === 'analyst' ? theme.accent : theme.textMuted,
                  border: `1px solid ${user.role === 'analyst' ? `${theme.accent}30` : theme.cardBorder}`,
                }}>
                {user.role}
              </button>
              <div className="flex items-center gap-1.5">
                <StatusDot ok={user.active} />
                <span className="text-xs" style={{ color: user.active ? theme.safe : theme.danger }}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button onClick={() => toggleActive(user.id)}
                className="text-xs px-2 py-1 rounded-lg transition-all hover:opacity-80"
                style={{
                  background: user.active ? `${theme.danger}10` : `${theme.safe}10`,
                  color: user.active ? theme.danger : theme.safe,
                  border: `1px solid ${user.active ? `${theme.danger}25` : `${theme.safe}25`}`,
                }}>
                {user.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </Card>

        {/* ── Threat Logs ─────────────────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionTitle icon={FileText} title="Threat Logs" subtitle="High/critical severity detections with full analysis" />
          <div className="space-y-3">
            {DEMO.threatLogs.map(log => (
              <div key={log.id} className="rounded-xl p-4"
                style={{ background: `${theme.danger}07`, border: `1px solid ${theme.danger}22` }}>
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ background: log.severity === 'critical' ? `${theme.danger}20` : `${theme.warning}15`, color: log.severity === 'critical' ? theme.danger : theme.warning, border: `1px solid ${log.severity === 'critical' ? `${theme.danger}35` : `${theme.warning}30`}` }}>
                      {log.severity}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ background: log.action === 'blocked' ? `${theme.danger}15` : `${theme.warning}12`, color: log.action === 'blocked' ? theme.danger : theme.warning }}>
                      {log.action}
                    </span>
                    <span className="text-xs font-mono truncate max-w-xs" style={{ color: theme.textPrimary }}>{log.input}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>{log.time}</span>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: theme.textMuted }}>{log.explanation}</p>
                <div className="flex flex-wrap gap-1.5">
                  {log.indicators.map(ind => (
                    <span key={ind} className="text-xs px-2 py-0.5 rounded-lg"
                      style={{ background: `${theme.danger}09`, border: `1px solid ${theme.danger}22`, color: theme.danger }}>
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── System Health ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
          <Card className="p-5">
            <SectionTitle icon={Server} title="System Health" subtitle="Database and service status" />
            <div className="space-y-3">
              {[
                { name: 'PostgreSQL', icon: Database, ...DEMO.health.postgres },
                { name: 'Redis',      icon: Zap,      ...DEMO.health.redis    },
                { name: 'MongoDB',    icon: Database, ...DEMO.health.mongodb  },
              ].map(({ name, icon: Icon, status, records, version }) => (
                <div key={name} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${theme.accent}10`, border: `1px solid ${theme.accent}20` }}>
                      <Icon size={14} style={{ color: theme.accent }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{name}</p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{version} · {records.toLocaleString()} records</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot ok={status === 'healthy'} />
                    <span className="text-xs font-medium capitalize" style={{ color: status === 'healthy' ? theme.safe : theme.danger }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={Cpu} title="Model Versions" subtitle="Currently loaded ML models" />
            <div className="space-y-3">
              {[
                { label: 'URL Threat Model', value: DEMO.health.model.urlVersion,   color: theme.accent },
                { label: 'Email Spam Model', value: DEMO.health.model.emailVersion, color: theme.warning },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-3 py-3 rounded-xl"
                  style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{label}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color }}>
                      {value}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot ok={true} />
                    <span className="text-xs" style={{ color: theme.safe }}>Loaded</span>
                  </div>
                </div>
              ))}
              <div className="px-3 py-3 rounded-xl"
                style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}20` }}>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Total DB Records: <span className="font-bold" style={{ color: theme.accent }}>
                    {(DEMO.health.postgres.records + DEMO.health.redis.records + DEMO.health.mongodb.records).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('cg-admin') === 'true')

  const handleLogin  = () => { sessionStorage.setItem('cg-admin', 'true');  setLoggedIn(true)  }
  const handleLogout = () => { sessionStorage.removeItem('cg-admin');        setLoggedIn(false) }

  return loggedIn
    ? <AdminDashboardContent onLogout={handleLogout} />
    : <AdminLogin onLogin={handleLogin} />
}

export default AdminDashboard
