import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, CheckCircle, Info, X, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { useTheme } from '../../context/ThemeContext'

const TYPE_CONFIG = {
  danger:  { icon: AlertTriangle, color: '#f43f5e' },
  warning: { icon: AlertTriangle, color: '#f59e0b' },
  safe:    { icon: CheckCircle,   color: '#10b981' },
  info:    { icon: Info,          color: '#6366f1' },
}

const NotificationDropdown = ({ open, onClose }) => {
  const { theme } = useTheme()
  const { notifications, markAllRead, markRead, unreadCount } = useNotifications()
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
          style={{
            background: theme.isDark ? 'rgba(14,15,17,0.96)' : '#ffffff',
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
            backdropFilter: theme.isDark ? 'blur(24px)' : 'none',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: theme.accent }} />
              <span className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: theme.danger, color: '#fff', minWidth: '18px', textAlign: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
                style={{ color: theme.accent }}>
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell size={24} style={{ color: theme.textMuted, opacity: 0.4 }} />
                <p className="text-xs" style={{ color: theme.textMuted }}>No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                const Icon = cfg.icon
                return (
                  <div key={n.id}
                    onClick={() => markRead(n.id)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                    style={{
                      background: !n.read ? `${cfg.color}08` : 'transparent',
                      borderBottom: `1px solid ${theme.cardBorder}`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = theme.isDark ? 'rgba(255,255,255,0.03)' : theme.surfaceBg}
                    onMouseLeave={e => e.currentTarget.style.background = !n.read ? `${cfg.color}08` : 'transparent'}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <Icon size={13} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold truncate" style={{ color: theme.textPrimary }}>{n.title}</p>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />}
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: theme.textMuted }}>{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted, opacity: 0.6 }}>{n.time}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationDropdown
