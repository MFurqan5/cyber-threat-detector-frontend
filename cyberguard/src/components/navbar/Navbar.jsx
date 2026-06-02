import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Activity, Wifi, WifiOff } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeSwitcher'
import NotificationDropdown from '../ui/NotificationDropdown'
import ProfilePanel from './ProfilePanel'

const liveActivities = [
  'Scanning URL: suspicious-login.ru',
  'Email threat blocked: phishing detected',
  'Cache hit: L1 · 0.3ms response',
  'New scan: https://paypal-secure-verify.com',
  'Threat blocked: malware distribution site',
  'Email scan complete: SPAM (97.2% confidence)',
]

// Simple connection status — pings backend to check if alive
const useConnectionStatus = () => {
  const [status, setStatus] = useState({ online: navigator.onLine, latency: null })

  useEffect(() => {
    const check = async () => {
      if (!navigator.onLine) { setStatus({ online: false, latency: null }); return }
      const start = Date.now()

      let backendUrl = 'http://127.0.0.1:8000'
      const cookieMatch = document.cookie.match(/(?:^|; )cg-backend-url=([^;]*)/)
      if (cookieMatch) {
        backendUrl = decodeURIComponent(cookieMatch[1])
      }
      if (backendUrl === 'http://localhost:8000') {
        backendUrl = 'http://127.0.0.1:8000'
      }

      try {
        await fetch(`${backendUrl}/docs`, { method: 'HEAD', signal: AbortSignal.timeout(2000) })
        setStatus({ online: true, latency: Date.now() - start })
      } catch {
        setStatus({ online: navigator.onLine, latency: null })
      }
    }

    check()
    const interval = setInterval(check, 15000)
    window.addEventListener('online',  () => check())
    window.addEventListener('offline', () => setStatus({ online: false, latency: null }))
    return () => clearInterval(interval)
  }, [])

  return status
}

const Navbar = () => {
  const { theme } = useTheme()
  const { unreadCount } = useNotifications()
  const { user, guest } = useAuth()
  const [currentActivity, setCurrentActivity] = useState(0)
  const [time, setTime] = useState(new Date())
  const [notifOpen, setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef()

  const displayName  = guest ? 'Guest'            : (user?.username || user?.email || 'User')
  const displayRole  = guest ? 'Guest Session'    : (user?.role || 'analyst')
  const avatarLetter = guest ? 'G'                : displayName.charAt(0).toUpperCase()
  const avatarBg     = guest
    ? (theme.isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb')
    : `linear-gradient(135deg, ${theme.accent}cc, ${theme.accent}88)`
  const avatarColor  = guest ? theme.textMuted : '#fff'
  const { online, latency } = useConnectionStatus()

  useEffect(() => {
    const a = setInterval(() => setCurrentActivity(p => (p + 1) % liveActivities.length), 3500)
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => { clearInterval(a); clearInterval(t) }
  }, [])

  const wifiColor = !online ? theme.danger : latency !== null && latency < 100 ? theme.safe : latency !== null ? theme.warning : theme.textMuted
  const wifiLabel = !online ? 'Offline' : latency !== null ? `${latency}ms` : 'Checking...'

  return (
    <header className="flex items-center justify-between px-6 h-16 shrink-0 z-10 relative"
      style={{
        background: theme.navbarBg,
        backdropFilter: theme.isDark ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: theme.isDark ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${theme.navbarBorder}`,
        boxShadow: theme.isDark ? 'none' : '0 1px 0 #e5e7eb',
        transition: 'background 0.4s, border-color 0.4s',
      }}>

      {/* Left */}
      <div>
        <h1 className="text-sm font-semibold font-display tracking-wide" style={{ color: theme.textPrimary }}>
          AI Cybersecurity Threat Detector
        </h1>
        <p className="text-xs font-body" style={{ color: theme.textMuted }}>
          {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Center ticker */}
      <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full flex-1 max-w-md mx-8"
        style={{ background: theme.isDark ? 'rgba(255,255,255,0.03)' : theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full"
            style={{ background: theme.accent, animation: 'pulseDot 1.5s ease-in-out infinite', boxShadow: theme.isDark ? `0 0 6px ${theme.accent}` : 'none' }} />
          <span className="text-xs font-medium" style={{ color: theme.accent }}>LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.p key={currentActivity} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }} className="text-xs truncate" style={{ color: theme.textSecondary }}>
            {liveActivities[currentActivity]}
          </motion.p>
        </div>
        <Activity size={12} style={{ color: theme.textMuted }} className="shrink-0" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />

        {/* System Secure */}
        <motion.div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: `${theme.safe}12`, border: `1px solid ${theme.safe}30` }}
          animate={theme.isDark ? { boxShadow: [`0 0 8px ${theme.safe}15`, `0 0 16px ${theme.safe}28`, `0 0 8px ${theme.safe}15`] } : {}}
          transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-2 h-2 rounded-full" style={{ background: theme.safe, animation: 'pulseDot 2s ease-in-out infinite' }} />
          <span className="text-xs font-medium" style={{ color: theme.safe }}>System Secure</span>
        </motion.div>

        {/* WiFi — shows backend latency on hover */}
        <div className="relative group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            style={{ border: `1px solid ${theme.cardBorder}` }}>
            {online
              ? <Wifi size={14} style={{ color: wifiColor }} />
              : <WifiOff size={14} style={{ color: theme.danger }} />}
          </div>
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
            style={{ background: theme.isDark ? 'rgba(14,15,17,0.96)' : '#ffffff', border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
            <p className="font-semibold mb-0.5" style={{ color: theme.textPrimary }}>
              {online ? 'Backend Connected' : 'Backend Offline'}
            </p>
            <p style={{ color: wifiColor }}>
              {online ? `Latency: ${wifiLabel}` : 'No connection'}
            </p>
          </div>
        </div>

        {/* Bell — notification dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ border: `1px solid ${theme.cardBorder}` }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 14, height: 14, color: theme.textMuted }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: theme.danger, color: '#fff', fontSize: '9px' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* User badge — click to open profile panel */}
        <div
          onClick={() => setProfileOpen(p => !p)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity select-none"
          style={{
            border: `1px solid ${profileOpen ? theme.accent : guest ? theme.cardBorder : theme.cardBorder}`,
            borderStyle: guest ? 'dashed' : 'solid',
            transition: 'border-color 0.2s'
          }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: avatarBg, color: avatarColor, boxShadow: guest ? 'none' : `0 0 0 2px ${theme.accent}30` }}>
            {avatarLetter}
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{displayName}</span>
            <span className="text-xs capitalize" style={{ color: guest ? theme.warning : theme.textMuted }}>{displayRole}</span>
          </div>
        </div>

        {/* Profile panel */}
        <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </header>
  )
}

export default Navbar
