import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Globe, Mail, Database,
  History, Settings, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/url-scanner', icon: Globe, label: 'URL Scanner' },
  { to: '/email-scanner', icon: Mail, label: 'Email Scanner' },
  { to: '/cache', icon: Database, label: 'Cache Analytics' },
  { to: '/history', icon: History, label: 'Scan History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { theme } = useTheme()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-full z-20 shrink-0"
      style={{
        background: theme.sidebarBg,
        backdropFilter: theme.isDark ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: theme.isDark ? 'blur(24px)' : 'none',
        borderRight: `1px solid ${theme.sidebarBorder}`,
        boxShadow: theme.isDark ? '4px 0 24px rgba(0,0,0,0.3)' : '1px 0 0 #e5e7eb',
        transition: 'background 0.4s, border-color 0.4s',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: `${theme.accent}18`,
            border: `1px solid ${theme.accent}35`,
            boxShadow: theme.isDark ? `0 0 16px ${theme.accent}22` : 'none',
          }}>
          <Shield size={18} style={{ color: theme.accent }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <p className="text-sm font-semibold font-display leading-tight whitespace-nowrap"
                style={{ color: theme.textPrimary }}>CyberGuard</p>
              <p className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>AI Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 relative overflow-hidden">
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 rounded-xl"
                    style={{ background: theme.sidebarActiveBg, border: `1px solid ${theme.sidebarActiveBorder}` }}
                    transition={{ duration: 0.25 }} />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ background: theme.isDark ? 'rgba(255,255,255,0.04)' : `${theme.accent}06` }} />
                )}
                {isActive && (
                  <motion.div layoutId="activeBar" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: theme.accent, boxShadow: theme.isDark ? `0 0 8px ${theme.accent}` : 'none' }} />
                )}
                <Icon size={18} className="shrink-0 relative z-10"
                  style={{ color: isActive ? theme.accent : theme.textMuted,
                    filter: isActive && theme.isDark ? `drop-shadow(0 0 5px ${theme.accent})` : 'none',
                    transition: 'color 0.2s' }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                      className="text-sm font-medium relative z-10 whitespace-nowrap font-body"
                      style={{ color: isActive ? theme.accent : theme.textSecondary, transition: 'color 0.2s' }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                    style={{ background: theme.bgSecondary, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary,
                      boxShadow: theme.cardShadow }}>
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="px-3 py-2 rounded-lg text-center"
            style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}15` }}>
            <p className="text-xs" style={{ color: theme.textMuted }}>v1.0.0 · AI Threat Engine</p>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform z-30"
        style={{
          background: theme.bgPrimary, border: `1px solid ${theme.accent}40`,
          boxShadow: theme.isDark ? `0 0 12px ${theme.accent}18` : '0 2px 8px rgba(0,0,0,0.1)',
        }}>
        {collapsed
          ? <ChevronRight size={12} style={{ color: theme.accent }} />
          : <ChevronLeft size={12} style={{ color: theme.accent }} />}
      </button>
    </motion.aside>
  )
}

export default Sidebar
