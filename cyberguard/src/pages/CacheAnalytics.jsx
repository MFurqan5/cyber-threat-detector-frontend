import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Zap, HardDrive, Server, RefreshCw, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getCacheStatus } from '../services/api'
import { GlassCard, SectionHeader } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'

const CacheAnalytics = () => {
  const { theme } = useTheme()
  const [cacheData, setCacheData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const demo = {
    l1: { hit_rate: 0.82, hits: 8420, misses: 1840 },
    l2: { hit_rate: 0.71, hits: 7280, misses: 2960 },
    l3: { hit_rate: 0.58, hits: 5940, misses: 4300 },
  }

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try { setCacheData(await getCacheStatus()) }
    catch (err) { setError(err.message); setCacheData(demo) }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  const d = cacheData || demo

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="px-3 py-2 rounded-xl text-xs"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(8px)' }}>
        <p className="mb-1" style={{ color: theme.textMuted }}>{label}</p>
        {payload.map((e, i) => <p key={i} style={{ color: e.fill }}>{e.name}: <span className="font-semibold">{e.value?.toLocaleString()}</span></p>)}
      </div>
    )
  }

  const CircularProgress = ({ value, size = 120, color, label, sublabel }) => {
    const radius = (size - 16) / 2
    const circ = 2 * Math.PI * radius
    const pct = Math.round(value * 100)
    const offset = circ - (pct / 100) * circ
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="absolute inset-0">
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={theme.isDark ? 'rgba(255,255,255,0.05)' : '#f3f0ff'} strokeWidth={8} />
          </svg>
          <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
            <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
              strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              style={{ filter: theme.isDark ? `drop-shadow(0 0 6px ${color}80)` : 'none' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold font-display" style={{ color }}>{pct}%</span>
            <span className="text-xs" style={{ color: theme.textMuted }}>hit rate</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>{label}</p>
          <p className="text-xs" style={{ color: theme.textMuted }}>{sublabel}</p>
        </div>
      </div>
    )
  }

  const layers = [
    { key: 'l1', label: 'L1 Cache — Memory', color: theme.accent, icon: Zap, sublabel: 'Python dict' },
    { key: 'l2', label: 'L2 Cache — Redis', color: theme.safe, icon: Server, sublabel: '1hr TTL' },
    { key: 'l3', label: 'L3 Cache — MongoDB', color: theme.warning, icon: HardDrive, sublabel: '24hr TTL' },
  ]

  const barData = layers.map(l => ({
    name: l.label.split('—')[0].trim(),
    hits: d[l.key]?.hits || 0,
    misses: d[l.key]?.misses || 0,
  }))

  const overallRequests = (d.l1?.hits + d.l1?.misses) || 0
  const overallHitRate = overallRequests > 0 ? Math.round((d.l1?.hits / overallRequests) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: theme.textPrimary }}>Cache Analytics</h1>
          <p className="text-sm mt-1 font-body" style={{ color: theme.textMuted }}>Multi-layer cache performance monitoring</p>
          {error && <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: `${theme.warning}10`, border: `1px solid ${theme.warning}28`, color: theme.warning }}>
            ⚠ Backend offline — showing demo data</div>}
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-70"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary, boxShadow: theme.cardShadow }}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Hit Rate', value: `${overallHitRate}%`, color: theme.accent },
          { label: 'Total Requests', value: overallRequests.toLocaleString(), color: theme.accent },
          { label: 'Total Cache Hits', value: ((d.l1?.hits || 0) + (d.l2?.hits || 0) + (d.l3?.hits || 0)).toLocaleString(), color: theme.safe },
          { label: 'Avg Response', value: '0.8ms', color: theme.warning },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-xl p-4"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
            <p className="text-xs mb-1" style={{ color: theme.textMuted }}>{label}</p>
            <p className="text-xl font-bold font-display" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Layer cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {layers.map(({ key, label, color, icon: Icon, sublabel }, idx) => {
          const c = d[key] || {}
          const pct = Math.round((c.hit_rate || 0) * 100)
          const total = (c.hits || 0) + (c.misses || 0)
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{ background: theme.isDark ? `${color}09` : theme.cardBg,
                border: `1px solid ${theme.isDark ? `${color}28` : theme.cardBorder}`,
                boxShadow: theme.isDark ? `0 0 28px ${color}12` : theme.cardShadow,
                backdropFilter: theme.cardBlur }}>
              <div className="absolute -right-5 -top-5 opacity-5" style={{ color }}><Icon size={70} /></div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <h3 className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>{label.split('—')[0]}</h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{sublabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-display" style={{ color }}>{pct}%</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>hit rate</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: `${color}18` }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: idx * 0.1 + 0.3 }}
                  style={{ background: `linear-gradient(90deg, ${color}60, ${color})`,
                    boxShadow: theme.isDark ? `0 0 8px ${color}50` : 'none' }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['Hits', (c.hits||0).toLocaleString(), theme.safe], ['Misses', (c.misses||0).toLocaleString(), theme.danger], ['Total', total.toLocaleString(), color]].map(([lbl, val, clr]) => (
                  <div key={lbl} className="text-center py-2 rounded-lg" style={{ background: theme.isDark ? 'rgba(255,255,255,0.03)' : theme.surfaceBg }}>
                    <p className="text-xs font-semibold" style={{ color: clr }}>{val}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <SectionHeader title="Hits vs Misses" subtitle="Per cache layer" />
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.isDark ? 'rgba(255,255,255,0.04)' : '#f3f0ff'} />
                <XAxis dataKey="name" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hits" name="Hits" fill={theme.safe} radius={[4,4,0,0]} maxBarSize={40} />
                <Bar dataKey="misses" name="Misses" fill={theme.danger} radius={[4,4,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Cache Efficiency" subtitle="Visual hit rate by layer" />
          <div className="flex items-center justify-around py-2">
            <CircularProgress value={d.l1?.hit_rate || 0} color={theme.accent} label="L1 Memory" sublabel="In-process dict" />
            <CircularProgress value={d.l2?.hit_rate || 0} color={theme.safe} label="L2 Redis" sublabel="1hr TTL" />
            <CircularProgress value={d.l3?.hit_rate || 0} color={theme.warning} label="L3 MongoDB" sublabel="24hr TTL" />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  )
}

export default CacheAnalytics
