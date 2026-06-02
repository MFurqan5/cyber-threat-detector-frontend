import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, X, Info } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { useTheme } from '../../context/ThemeContext'

const TOAST_CONFIG = {
  danger:  { icon: AlertTriangle, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)'  },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  safe:    { icon: CheckCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  info:    { icon: Info,          color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
}

const Toast = ({ toast, onRemove }) => {
  const { theme } = useTheme()
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl w-80 relative overflow-hidden"
      style={{
        background: theme.isDark ? cfg.bg : '#ffffff',
        border: `1px solid ${cfg.border}`,
        boxShadow: theme.isDark
          ? `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${cfg.color}15`
          : '0 4px 16px rgba(0,0,0,0.1)',
        backdropFilter: theme.isDark ? 'blur(16px)' : 'none',
      }}
    >
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        style={{ background: cfg.color }}
      />

      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <Icon size={15} style={{ color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold font-display" style={{ color: theme.textPrimary }}>{toast.title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: theme.textMuted }}>{toast.message}</p>
      </div>

      <button onClick={() => onRemove(toast.id)}
        className="shrink-0 hover:opacity-70 transition-opacity mt-0.5"
        style={{ color: theme.textMuted }}>
        <X size={13} />
      </button>
    </motion.div>
  )
}

const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications()

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
