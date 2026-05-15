import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, ShieldCheck, AlertTriangle, Zap, Globe, Mail } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getStats } from '../services/api'
import { StatCard, GlassCard, SectionHeader, StatusPill } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'

const Dashboard = () => {
  const { theme } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    getStats().then(setStats).catch((err) => { setError(err.message); setStats(fallback) }).finally(() => setLoading(false))
  }, [])

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

  const pieColors = [theme.danger, theme.warning, theme.accent, theme.safe]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-transparent mx-auto mb-4"
          style={{ borderTopColor: theme.accent, animation: 'spin 0.8s linear infinite' }} />
        <p className="text-sm" style={{ color: theme.textMuted }}>Loading threat intelligence...</p>
      </div>
    </div>
  )

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
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart2} label="Total Scans" value={stats?.total_scans?.toLocaleString()} color={theme.accent} delta={12} index={0} />
        <StatCard icon={AlertTriangle} label="Threats Detected" value={stats?.threats_detected?.toLocaleString()} color={theme.danger} delta={-3} index={1} />
        <StatCard icon={ShieldCheck} label="Safe Requests" value={stats?.safe_requests?.toLocaleString()} color={theme.safe} delta={8} index={2} />
        <StatCard icon={Zap} label="Cache Hit Rate" value={`${Math.round((stats?.cache_hit_rate || 0) * 100)}%`} color={theme.warning} index={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Scan Activity" subtitle="Scans and threats over the past 24 hours">
              <div className="flex items-center gap-3 text-xs" style={{ color: theme.textMuted }}>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: theme.accent }} /> Scans</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: theme.danger }} /> Threats</span>
              </div>
            </SectionHeader>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.scan_activity || []}>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="scans" name="Scans" stroke={theme.accent} strokeWidth={2} fill="url(#scansGrad)" dot={false} />
                  <Area type="monotone" dataKey="threats" name="Threats" stroke={theme.danger} strokeWidth={2} fill="url(#threatsGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Threat Distribution" />
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats?.threat_distribution || []} cx="50%" cy="50%"
                    innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const r = innerRadius + (outerRadius - innerRadius) * 0.5
                      const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
                      const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
                      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
                    }}>
                    {(stats?.threat_distribution || []).map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {(stats?.threat_distribution || []).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                    <span className="text-xs" style={{ color: theme.textMuted }}>{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: pieColors[i % pieColors.length] }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Cache Performance" subtitle="Multi-layer cache efficiency" />
            <div className="space-y-5">
              {[
                { key: 'l1', label: 'L1 Cache (Memory)', color: theme.accent },
                { key: 'l2', label: 'L2 Cache (Redis)', color: theme.safe },
                { key: 'l3', label: 'L3 Cache (MongoDB)', color: theme.warning },
              ].map(({ key, label, color }) => {
                const c = stats?.cache?.[key] || {}
                const pct = Math.round((c.hit_rate || 0) * 100)
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                        style={{ background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 8px ${color}50` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs" style={{ color: theme.textMuted }}>Hits: {(c.hits || 0).toLocaleString()}</span>
                      <span className="text-xs" style={{ color: theme.textMuted }}>Misses: {(c.misses || 0).toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-3">
          <GlassCard className="p-5 h-full">
            <SectionHeader title="Recent Scans" subtitle="Latest threat detection activity" />
            <div className="space-y-2">
              {(stats?.recent_scans || []).map((scan, i) => (
                <motion.div key={scan.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{ border: `1px solid ${theme.cardBorder}` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${scan.type === 'url' ? theme.accent : theme.warning}10`,
                        border: `1px solid ${scan.type === 'url' ? theme.accent : theme.warning}25`,
                      }}>
                      {scan.type === 'url'
                        ? <Globe size={13} style={{ color: theme.accent }} />
                        : <Mail size={13} style={{ color: theme.warning }} />}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: theme.textPrimary }}>{scan.type}</p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>{scan.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={scan.status} />
                    <span className="text-xs tabular-nums" style={{ color: theme.textMuted }}>
                      {Math.round(scan.confidence_score * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard
