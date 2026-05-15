import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

// ─── GlassCard ─────────────────────────────────────────────────────────────────
export const GlassCard = ({ children, className = '', hover = true, glow = false, style = {}, onClick }) => {
  const { theme } = useTheme()
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl ${className}`}
      style={{
        background: theme.cardBg,
        backdropFilter: theme.cardBlur,
        WebkitBackdropFilter: theme.cardBlur,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: glow
          ? `0 0 28px ${theme.accent}18, ${theme.cardShadow}`
          : theme.cardShadow,
        transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// ─── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, color, delta, index = 0 }) => {
  const { theme } = useTheme()
  const c = color || theme.accent
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: theme.isDark ? `${c}09` : theme.cardBg,
        border: `1px solid ${theme.isDark ? `${c}28` : theme.cardBorder}`,
        boxShadow: theme.isDark ? `0 0 28px ${c}12` : theme.cardShadow,
        backdropFilter: theme.cardBlur,
        transition: 'background 0.4s, border-color 0.4s',
      }}
    >
      <div className="absolute -right-4 -bottom-4" style={{ opacity: theme.isDark ? 0.05 : 0.04, color: c }}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${c}12`, border: `1px solid ${c}28` }}>
            <Icon size={20} style={{ color: c }} />
          </div>
          {delta !== undefined && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: delta > 0 ? `${theme.safe}14` : `${theme.danger}14`,
                color: delta > 0 ? theme.safe : theme.danger,
                border: `1px solid ${delta > 0 ? `${theme.safe}30` : `${theme.danger}30`}`,
              }}>
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold font-display mb-1" style={{ color: c }}>{value}</p>
        <p className="text-sm font-body" style={{ color: theme.textMuted }}>{label}</p>
      </div>
    </motion.div>
  )
}

// ─── StatusPill ────────────────────────────────────────────────────────────────
export const StatusPill = ({ status }) => {
  const { theme } = useTheme()
  const isSafe = status === 'safe' || status === 'clean'
  const isWarn = status === 'spam'
  const color = isSafe ? theme.safe : isWarn ? theme.warning : theme.danger
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
      style={{ color, background: `${color}14`, border: `1px solid ${color}32` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  )
}

// ─── GlowButton ───────────────────────────────────────────────────────────────
export const GlowButton = ({ children, onClick, disabled, variant = 'primary', className = '', loading = false }) => {
  const { theme } = useTheme()
  const c = variant === 'danger' ? theme.danger : theme.accent
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`relative px-6 py-3 rounded-xl font-semibold text-sm font-display transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: theme.isDark ? `${c}1a` : c,
        border: theme.isDark ? `1px solid ${c}50` : 'none',
        color: theme.isDark ? c : '#fff',
        boxShadow: theme.isDark ? `0 0 20px ${c}22` : `0 2px 8px ${c}40`,
      }}
    >
      <span className="flex items-center justify-center gap-2">
        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-transparent"
            style={{ borderTopColor: theme.isDark ? c : '#fff', animation: 'spin 0.8s linear infinite' }} />
        )}
        {children}
      </span>
    </motion.button>
  )
}

// ─── SecondaryButton ──────────────────────────────────────────────────────────
export const SecondaryButton = ({ children, onClick, disabled, className = '', icon: Icon }) => {
  const { theme } = useTheme()
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium font-body transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: theme.isDark ? theme.cardBg : theme.surfaceBg,
        border: `1px solid ${theme.cardBorder}`,
        color: theme.textSecondary,
        boxShadow: theme.isDark ? 'none' : theme.cardShadow,
      }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </motion.button>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, children }) => {
  const { theme } = useTheme()
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold font-display" style={{ color: theme.textPrimary }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5 font-body" style={{ color: theme.textMuted }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── GlowInput ────────────────────────────────────────────────────────────────
export const GlowInput = ({ placeholder, value, onChange, className = '', multiline = false, rows = 4 }) => {
  const { theme } = useTheme()
  const base = {
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    color: theme.textPrimary,
    caretColor: theme.accent,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const onFocus = (e) => {
    e.target.style.borderColor = theme.inputFocusBorder
    e.target.style.boxShadow = `0 0 0 3px ${theme.inputFocusShadow}`
  }
  const onBlur = (e) => {
    e.target.style.borderColor = theme.inputBorder
    e.target.style.boxShadow = 'none'
  }
  if (multiline) return (
    <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
      onFocus={onFocus} onBlur={onBlur}
      className={`w-full px-4 py-3 rounded-xl text-sm font-body resize-none placeholder-gray-400 ${className}`}
      style={base} />
  )
  return (
    <input type="text" placeholder={placeholder} value={value} onChange={onChange}
      onFocus={onFocus} onBlur={onBlur}
      className={`w-full px-4 py-3 rounded-xl text-sm font-body placeholder-gray-400 ${className}`}
      style={base} />
  )
}

// ─── ConfidenceBar ────────────────────────────────────────────────────────────
export const ConfidenceBar = ({ score, label, color }) => {
  const { theme } = useTheme()
  const c = color || theme.accent
  const pct = Math.round(score * 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: theme.textMuted }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: c }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${c}18` }}>
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ background: `linear-gradient(90deg, ${c}70, ${c})`, boxShadow: theme.isDark ? `0 0 8px ${c}50` : 'none' }} />
      </div>
    </div>
  )
}

export const LoadingSpinner = ({ size = 20 }) => {
  const { theme } = useTheme()
  return (
    <div className="rounded-full border-2 border-transparent"
      style={{ width: size, height: size, borderTopColor: theme.accent, animation: 'spin 0.7s linear infinite' }} />
  )
}
