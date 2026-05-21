import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Activity, Wifi } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from '../ui/ThemeSwitcher'

const liveActivities = [
  'Scanning URL: suspicious-login.ru',
  'Email threat blocked: phishing detected',
  'Cache hit: L1 · 0.3ms response',
  'New scan: https://paypal-secure-verify.com',
  'Threat blocked: malware distribution site',
  'Email scan complete: SPAM (97.2% confidence)',
]

const Navbar = () => {
  const { theme } = useTheme()
  const [currentActivity, setCurrentActivity] = useState(0)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const a = setInterval(() => setCurrentActivity(p => (p + 1) % liveActivities.length), 3500)
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => { clearInterval(a); clearInterval(t) }
  }, [])

  return (
    <header
      className="flex items-center justify-between px-6 h-16 shrink-0 z-10 relative"
      style={{
        background: theme.navbarBg,
        backdropFilter: theme.isDark ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: theme.isDark ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${theme.navbarBorder}`,
        boxShadow: theme.isDark ? 'none' : '0 1px 0 #e5e7eb',
        transition: 'background 0.4s, border-color 0.4s',
      }}
    >
      {/* Left: Title */}
      <div>
        <h1 className="text-sm font-semibold font-display tracking-wide" style={{ color: theme.textPrimary }}>
          AI Cybersecurity Threat Detector
        </h1>
        <p className="text-xs font-body" style={{ color: theme.textMuted }}>
          {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Center: Live ticker */}
      <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full flex-1 max-w-md mx-8"
        style={{ background: theme.isDark ? 'rgba(255,255,255,0.03)' : theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full"
            style={{ background: theme.accent, animation: 'pulseDot 1.5s ease-in-out infinite',
              boxShadow: theme.isDark ? `0 0 6px ${theme.accent}` : 'none' }} />
          <span className="text-xs font-medium" style={{ color: theme.accent }}>LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.p key={currentActivity}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs truncate" style={{ color: theme.textSecondary }}>
            {liveActivities[currentActivity]}
          </motion.p>
        </div>
        <Activity size={12} style={{ color: theme.textMuted }} className="shrink-0" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        {/* ← THEME TOGGLE in navbar */}
        <ThemeToggle />

        {/* System Secure badge */}
        <motion.div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: `${theme.safe}12`, border: `1px solid ${theme.safe}30` }}
          animate={theme.isDark ? { boxShadow: [`0 0 8px ${theme.safe}15`, `0 0 16px ${theme.safe}28`, `0 0 8px ${theme.safe}15`] } : {}}
          transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-2 h-2 rounded-full" style={{ background: theme.safe,
            animation: 'pulseDot 2s ease-in-out infinite' }} />
          <span className="text-xs font-medium" style={{ color: theme.safe }}>System Secure</span>
        </motion.div>

        {/* Wifi */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          style={{ border: `1px solid ${theme.cardBorder}` }}>
          <Wifi size={14} style={{ color: theme.textMuted }} />
        </div>

        {/* Bell */}
        <div className="relative w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          style={{ border: `1px solid ${theme.cardBorder}` }}>
          <Bell size={14} style={{ color: theme.textMuted }} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: theme.danger }} />
        </div>

        {/* User */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          style={{ border: `1px solid ${theme.cardBorder}` }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}40`, color: theme.accent }}>
            U
          </div>
          <span className="text-xs hidden sm:block" style={{ color: theme.textSecondary }}>Analyst</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
