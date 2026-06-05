import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, ShieldCheck, AlertTriangle, Zap, Globe, Mail, File, Smartphone, Shield, Search, Lock, ArrowRight, Info } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getStats, getDashboardStats } from '../services/api'
import { StatCard, GlassCard, SectionHeader, StatusPill } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useGuestScan, GUEST_SCAN_LIMIT } from '../context/GuestScanContext'
import { useNavigate } from 'react-router-dom'

// ── Empty‑state placeholder data ──────────────────────────────────────────────
const EMPTY_AREA_DATA = [
  { hour: '00:00', scans: 0, threats: 0 }, { hour: '04:00', scans: 0, threats: 0 },
  { hour: '08:00', scans: 0, threats: 0 }, { hour: '12:00', scans: 0, threats: 0 },
  { hour: '16:00', scans: 0, threats: 0 }, { hour: '20:00', scans: 0, threats: 0 },
]
const EMPTY_PIE_DATA = [{ name: 'No Data', value: 100 }]

// ── Function to normalize minute-based data to hourly ────────────────────────
const normalizeToHourly = (data) => {
  if (!data || data.length === 0) return EMPTY_AREA_DATA

  // Check if data is already in hourly format (HH:00)
  const isHourly = data.every(item => item.hour && item.hour.endsWith(':00'))
  if (isHourly) return data

  // If not hourly, it's minute-based (HH:MM) - aggregate to hours
  const hourlyMap = {}

  // Initialize with 24 hours
  for (let i = 0; i < 24; i++) {
    const hour = `${String(i).padStart(2, '0')}:00`
    hourlyMap[hour] = { hour, scans: 0, threats: 0 }
  }

  // Aggregate minute data into hours
  data.forEach(item => {
    let hourKey = item.hour
    if (hourKey && hourKey.includes(':')) {
      hourKey = hourKey.split(':')[0] + ':00'
    }
    if (hourlyMap[hourKey]) {
      hourlyMap[hourKey].scans += (item.scans || 0)
      hourlyMap[hourKey].threats += (item.threats || 0)
    }
  })

  // Return as array in order (00:00 to 23:00)
  return Object.values(hourlyMap)
}

// ── Inject keyframe animations once ───────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('cg-dash-styles')) return
  const s = document.createElement('style')
  s.id = 'cg-dash-styles'
  s.textContent = `
    @keyframes cgBorderPulse {
      0%, 100% { opacity: 0.35; }
      50%       { opacity: 0.8;  }
    }
    @keyframes cgBreath {
      0%, 100% { opacity: 0.18; transform: scale(1);    }
      50%       { opacity: 0.32; transform: scale(1.04); }
    }
    @keyframes cgSlide {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes cgFloat {
      0%, 100% { transform: translateY(0px);   }
      50%       { transform: translateY(-6px);  }
    }
    .cg-border-pulse { animation: cgBorderPulse 2.4s ease-in-out infinite; }
    .cg-breath        { animation: cgBreath 3s ease-in-out infinite; }
    .cg-float         { animation: cgFloat 3.5s ease-in-out infinite; }
    .cg-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: cgSlide 2s linear infinite;
    }
  `
  document.head.appendChild(s)
}

const Dashboard = () => {
  const { theme } = useTheme()
  const { user, guest, isLoggedIn } = useAuth()
  const { guestStats, remainingScans } = useGuestScan()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { injectStyles() }, [])

  const isGuestEmpty = guest && (!guestStats || guestStats.total_scans === 0)
  const isGuestWithData = guest && guestStats && guestStats.total_scans > 0

  const getThreatColor = (name) => {
    switch (name?.toLowerCase()) {
      case 'malware': return theme.danger
      case 'phishing': return theme.warning
      case 'spam': return theme.accent
      case 'clean': return theme.safe
      default: return theme.textMuted || '#888888'
    }
  }

  const getScanIcon = (type) => {
    const iconSize = 13
    switch (type?.toLowerCase()) {
      case 'url': return <Globe size={iconSize} style={{ color: theme.accent }} />
      case 'email': return <Mail size={iconSize} style={{ color: theme.warning }} />
      case 'file': return <File size={iconSize} style={{ color: theme.accent }} />
      case 'app': return <Smartphone size={iconSize} style={{ color: theme.warning }} />
      default: return <Globe size={iconSize} style={{ color: theme.accent }} />
    }
  }

  const getScanIconStyles = (type) => {
    const isAccent = type === 'url' || type === 'file'
    const color = isAccent ? theme.accent : theme.warning
    return { background: `${color}10`, border: `1px solid ${color}25` }
  }

  const fallback = {
    total_scans: 14820, threats_detected: 2341, safe_requests: 12479, cache_hit_rate: 0.78,
    scan_activity: [
      { hour: '00:00', scans: 42, threats: 8 }, { hour: '02:00', scans: 28, threats: 4 },
      { hour: '04:00', scans: 19, threats: 2 }, { hour: '06:00', scans: 65, threats: 12 },
      { hour: '08:00', scans: 134, threats: 28 }, { hour: '10:00', scans: 198, threats: 41 },
      { hour: '12:00', scans: 245, threats: 58 }, { hour: '14:00', scans: 312, threats: 72 },
      { hour: '16:00', scans: 287, threats: 63 }, { hour: '18:00', scans: 201, threats: 44 },
      { hour: '20:00', scans: 156, threats: 31 }, { hour: '22:00', scans: 98, threats: 19 },
    ],
    threat_distribution: [
      { name: 'Phishing', value: 38 }, { name: 'Malware', value: 24 },
      { name: 'Spam', value: 21 }, { name: 'Clean', value: 17 },
    ],
    cache: {
      l1: { hit_rate: 0.82, hits: 8420, misses: 1840 },
      l2: { hit_rate: 0.71, hits: 7280, misses: 2960 },
      l3: { hit_rate: 0.58, hits: 5940, misses: 4300 },
    },
    recent_scans: [
      { id: 1, timestamp: '2025-08-01 14:32:11', type: 'url', status: 'malicious', threat_type: 'phishing', confidence_score: 0.97 },
      { id: 2, timestamp: '2025-08-01 14:31:44', type: 'email', status: 'safe', threat_type: 'clean', confidence_score: 0.91 },
      { id: 3, timestamp: '2025-08-01 14:31:02', type: 'url', status: 'safe', threat_type: 'clean', confidence_score: 0.88 },
      { id: 4, timestamp: '2025-08-01 14:30:18', type: 'email', status: 'malicious', threat_type: 'spam', confidence_score: 0.99 },
      { id: 5, timestamp: '2025-08-01 14:29:55', type: 'url', status: 'malicious', threat_type: 'phishing', confidence_score: 0.94 },
    ],
  }

  useEffect(() => {
    if (guest) { setLoading(false); return }
    const fetchStats = isLoggedIn ? getDashboardStats : getStats
    fetchStats().then(setStats).catch((err) => { setError(err.message); setStats(fallback) }).finally(() => setLoading(false))
  }, [isLoggedIn, guest])

  const displayStats = guest ? guestStats : stats

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="px-3 py-2 rounded-xl text-xs" style={{
        background: theme.bgSecondary, border: `1px solid ${theme.accent}25`, backdropFilter: 'blur(12px)',
      }}>
        <p className="mb-1" style={{ color: theme.textMuted }}>{label}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ color: e.color }}>{e.name}: <span className="font-semibold">{e.value}</span></p>
        ))}
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-transparent mx-auto mb-4"
          style={{ borderTopColor: theme.accent, animation: 'spin 0.8s linear infinite' }} />
        <p className="text-sm" style={{ color: theme.textMuted }}>Loading threat intelligence...</p>
      </div>
    </div>
  )

  const ChartOverlay = ({ message }) => (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-5 py-3 rounded-2xl"
        style={{
          background: theme.isDark ? 'rgba(0,0,0,0.52)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(6px)',
          border: `1px solid ${theme.cardBorder}`,
        }}>
        <div className="cg-float inline-block mb-2">
          <Search size={20} style={{ color: theme.textMuted, opacity: 0.45 }} />
        </div>
        <p className="text-xs font-medium" style={{ color: theme.textMuted }}>{message}</p>
      </motion.div>
    </div>
  )

  const SCAN_ACTIONS = [
    { icon: Globe, label: 'Scan URL', sub: 'Check links for phishing', color: theme.accent, route: '/dashboard/url-scanner' },
    { icon: Mail, label: 'Scan Email', sub: 'Detect spam & malware', color: theme.warning, route: '/dashboard/email-scanner' },
    { icon: File, label: 'Scan File', sub: 'Analyse suspicious files', color: theme.safe, route: '/dashboard/malware-scanner' },
    { icon: Smartphone, label: 'Scan App', sub: 'Inspect APK or app name', color: '#a78bfa', route: '/dashboard/malware-scanner' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display" style={{ color: theme.textPrimary }}>Threat Intelligence Dashboard</h1>
        <p className="text-sm mt-1 font-body" style={{ color: theme.textMuted }}>Real-time cybersecurity monitoring and threat analysis</p>
        {error && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: `${theme.warning}10`, border: `1px solid ${theme.warning}25`, color: theme.warning }}>
            ⚠ Backend offline — showing demo data
          </div>
        )}
        {guest && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
            style={{
              background: theme.isDark ? `${theme.accent}0e` : `${theme.accent}08`,
              border: `1px solid ${theme.accent}30`,
              color: theme.textMuted,
            }}>
            <Shield size={13} style={{ color: theme.accent }} />
            <span style={{ color: theme.accent, fontWeight: 600 }}>Guest Mode</span>
            <span style={{ color: theme.cardBorder }}>·</span>
            <span style={{ color: remainingScans > 0 ? theme.accent : theme.danger }}>
              {remainingScans} scan{remainingScans !== 1 ? 's' : ''} remaining
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart2, label: 'Total Scans', value: isGuestEmpty ? '0' : (displayStats?.total_scans?.toLocaleString() || '0'), color: theme.accent, emptyMsg: 'No scans performed yet' },
          { icon: AlertTriangle, label: 'Threats Detected', value: isGuestEmpty ? '0' : (displayStats?.threats_detected?.toLocaleString() || '0'), color: theme.danger, emptyMsg: 'Waiting for first analysis' },
          {
            icon: ShieldCheck,
            label: 'Cache Hits',
            value: guest ? 'Not available in guest mode' : (displayStats?.personal_cache_hits?.toLocaleString() || '0'),
            color: theme.safe,
            emptyMsg: guest ? 'Sign in to see cache analytics' : 'Scan activity will appear here'
          },
          {
            icon: Zap,
            label: 'Cache Efficiency',
            value: guest ? 'N/A' : (isGuestEmpty ? 'N/A' : (isGuestWithData ? '0%' : `${displayStats?.personal_cache_hit_rate || 0}%`)),
            color: theme.warning,
            emptyMsg: guest ? 'Sign in for cache analytics' : 'Start a scan for insights'
          },
        ].map(({ icon: Icon, label, value, color, delta, emptyMsg }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.09 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-2xl p-5 cursor-default"
            style={{
              background: theme.isDark ? `${color}09` : theme.cardBg,
              border: `1px solid ${theme.isDark ? `${color}28` : theme.cardBorder}`,
              boxShadow: theme.isDark ? `0 0 28px ${color}12` : theme.cardShadow,
              backdropFilter: theme.cardBlur,
              transition: 'background 0.4s, border-color 0.4s',
            }}>
            <div className="absolute -right-4 -bottom-4" style={{ opacity: theme.isDark ? 0.05 : 0.04, color }}>
              <Icon size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}12`, border: `1px solid ${color}28` }}>
                  <Icon size={20} style={{ color: color }} />
                </div>
                {delta !== undefined && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: delta > 0 ? `${theme.safe}14` : `${theme.danger}14`, color: delta > 0 ? theme.safe : theme.danger, border: `1px solid ${delta > 0 ? `${theme.safe}30` : `${theme.danger}30`}` }}>
                    {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold font-display mb-0.5" style={{ color: label.includes('Cache') ? (label === 'Cache Hits' ? theme.safe : theme.warning) : color, fontSize: guest && label.includes('Cache') ? '1.1rem' : '2rem' }}>{value}</p>
              <p className="text-sm font-body mb-1" style={{ color: theme.textMuted }}>{label}</p>
              {((guest && label.includes('Cache')) || (isGuestEmpty && !guest)) && (
                <p className="text-xs" style={{ color: theme.textMuted }}>{emptyMsg}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Scan Activity" subtitle={isGuestEmpty ? 'Scan activity will appear here' : 'Scans and threats over the past 24 hours'}>
              <div className="flex items-center gap-3 text-xs" style={{ color: theme.textMuted }}>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: theme.accent }} /> Scans</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: theme.danger }} /> Threats</span>
              </div>
            </SectionHeader>
            <div style={{ height: '220px', position: 'relative' }}>
              {isGuestEmpty && <ChartOverlay message="No scan data available" />}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={isGuestEmpty ? EMPTY_AREA_DATA : normalizeToHourly(displayStats?.scan_activity || [])}>
                  <defs>
                    <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.danger} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.danger} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${theme.accent}08`} />
                  <XAxis dataKey="hour" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  {!isGuestEmpty && <Tooltip content={<CustomTooltip />} />}
                  <Area type="monotone" dataKey="scans" name="Scans" stroke={theme.accent} strokeWidth={2} fill="url(#scansGrad)" dot={false} isAnimationActive={!isGuestEmpty} />
                  <Area type="monotone" dataKey="threats" name="Threats" stroke={theme.danger} strokeWidth={2} fill="url(#threatsGrad)" dot={false} isAnimationActive={!isGuestEmpty} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Threat Distribution" />
            <div style={{ height: '160px', position: 'relative' }}>
              {isGuestEmpty && <ChartOverlay message="Run a scan to view analytics" />}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={isGuestEmpty ? EMPTY_PIE_DATA : (displayStats?.threat_distribution || [])}
                    cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                    labelLine={false}
                    label={isGuestEmpty ? false : ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const r = innerRadius + (outerRadius - innerRadius) * 0.5
                      const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
                      const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
                      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
                    }}
                    isAnimationActive={!isGuestEmpty}>
                    {isGuestEmpty
                      ? <Cell fill={theme.accent} stroke="none" />
                      : (displayStats?.threat_distribution || []).map((item) => (
                        <Cell key={item.name} fill={getThreatColor(item.name)} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                      ))
                    }
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {isGuestEmpty ? (
                ['Phishing', 'Malware', 'Spam', 'Clean'].map((name, i) => {
                  const colorMap = { Phishing: theme.warning, Malware: theme.danger, Spam: theme.accent, Clean: theme.safe }
                  return (
                    <motion.div key={name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.06 }} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: colorMap[name] }} />
                        <span className="text-xs" style={{ color: theme.textMuted }}>{name}</span>
                      </div>
                      <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: `${colorMap[name]}30` }}>
                        <div className="cg-shimmer h-full w-full" />
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                (displayStats?.threat_distribution || []).map((item) => {
                  const color = getThreatColor(item.name)
                  return (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-xs" style={{ color: theme.textMuted }}>{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color }}>{item.value}%</span>
                    </div>
                  )
                })
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Cache Performance" subtitle={guest ? 'Cache analytics are available for registered users only' : (isGuestEmpty ? 'Waiting for first analysis' : 'Multi-layer cache efficiency')} />

            {guest ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center py-8 px-4 text-center"
                style={{
                  background: `${theme.textMuted}05`,
                  borderRadius: '1rem',
                  border: `1px dashed ${theme.textMuted}25`,
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: `${theme.textMuted}10` }}>
                  <Info size={24} style={{ color: theme.textMuted }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: theme.textPrimary }}>Cache Analytics Unavailable</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>Cache performance data is only available for registered users.</p>
                <motion.button
                  onClick={() => navigate('/signup')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold"
                  style={{
                    background: `${theme.accent}15`,
                    border: `1px solid ${theme.accent}30`,
                    color: theme.accent,
                  }}
                >
                  Sign up for full access
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {[
                  { key: 'l1', label: 'L1 Cache (Memory)', color: theme.accent },
                  { key: 'l2', label: 'L2 Cache (Redis)', color: theme.safe },
                  { key: 'l3', label: 'L3 Cache (MongoDB)', color: theme.warning },
                ].map(({ key, label, color }, idx) => {
                  const c = displayStats?.cache?.[key] || {}
                  const pct = isGuestEmpty ? 0 : Math.round((c.hit_rate || 0) * 100)
                  return (
                    <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.08 }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{label}</span>
                        <span className="text-xs font-bold" style={{ color: color }}>{isGuestEmpty ? '0%' : `${pct}%`}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                        {isGuestEmpty ? (
                          <div className="cg-shimmer h-full w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)`, backgroundSize: '200% 100%' }} />
                        ) : (
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }} style={{ background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}50` }} />
                        )}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{ color: theme.textMuted }}>Hits: {isGuestEmpty ? '0' : (c.hits || 0).toLocaleString()}</span>
                        <span className="text-xs" style={{ color: theme.textMuted }}>Misses: {isGuestEmpty ? '0' : (c.misses || 0).toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-3">
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Recent Scans" subtitle={isGuestEmpty ? 'Start a scan to see activity here' : 'Latest threat detection activity'} />
            {isGuestEmpty ? (
              <div className="space-y-3">
                <p className="text-xs mb-4" style={{ color: theme.textMuted }}>Choose a scan type to get started:</p>
                <div className="grid grid-cols-2 gap-3">
                  {SCAN_ACTIONS.map(({ icon: Icon, label, sub, color, route }, i) => (
                    <motion.button key={label} onClick={() => navigate(route)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }} whileHover={{ y: -3, boxShadow: `0 8px 24px ${color}25` }} whileTap={{ scale: 0.97 }} className="relative overflow-hidden text-left p-4 rounded-2xl flex flex-col gap-2 group" style={{ background: theme.isDark ? `${color}08` : `${color}06`, border: `1px solid ${color}28`, cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }} />
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
                        <Icon size={17} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold font-display" style={{ color: theme.textPrimary }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{sub}</p>
                      </div>
                      <ArrowRight size={12} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {(displayStats?.recent_scans || []).map((scan, i) => (
                  <motion.div key={scan.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150" style={{ border: `1px solid ${theme.cardBorder}` }} onMouseEnter={e => e.currentTarget.style.background = theme.tableRowHover} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={getScanIconStyles(scan.type)}>
                        {getScanIcon(scan.type)}
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: theme.textPrimary }}>{scan.type}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{scan.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={scan.status} />
                      <span className="text-xs tabular-nums" style={{ color: theme.textMuted }}>{Math.round(scan.confidence_score * 100)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <AnimatePresence>
        {guest && remainingScans <= 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-2xl p-5 text-center" style={{ background: `${theme.warning}08`, border: `1px solid ${theme.warning}25` }}>
            <Lock size={22} className="mx-auto mb-2" style={{ color: theme.warning }} />
            <p className="text-sm font-semibold font-display mb-1" style={{ color: theme.textPrimary }}>Guest Scan Limit Reached</p>
            <p className="text-xs mb-3" style={{ color: theme.textMuted }}>You've used all {GUEST_SCAN_LIMIT} guest scans. Create a free account to continue scanning with unlimited access.</p>
            <motion.button onClick={() => navigate('/signup')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-5 py-2.5 rounded-xl text-xs font-semibold font-display" style={{ background: theme.isDark ? `${theme.accent}dd` : theme.accent, color: '#ffffff', boxShadow: `0 0 16px ${theme.accent}40`, border: 'none' }}>Create Free Account</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Dashboard