import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight, UserX } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'
import ThemeToggle from '../components/ui/ThemeSwitcher'
import AnimatedBackground from '../components/ui/AnimatedBackground'

const Login = () => {
  const { theme } = useTheme()
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const handleGuest = () => {
    loginAsGuest()
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)

    // Admin role-based login check
    if (email === 'admin@cyberguard.ai' && password === 'admin123') {
      try {
        sessionStorage.setItem('cg-admin', 'true')
        login('admin-mock-token', { username: 'Administrator', email: 'admin@cyberguard.ai', role: 'admin' })
        navigate('/admin')
      } catch (err) {
        setError('Error during admin sign in.')
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      const data = await loginUser(email, password)
      const userData = data.user || { username: data.username || email.split('@')[0], email, role: 'analyst' }
      login(data.access_token, userData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    background: theme.inputBg,
    border: `1px solid ${focusedField === field ? theme.inputFocusBorder : theme.inputBorder}`,
    boxShadow: focusedField === field ? `0 0 0 3px ${theme.inputFocusShadow}` : 'none',
    color: theme.textPrimary,
    caretColor: theme.accent,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  })

  return (
    <div className="relative min-h-screen w-full flex" style={{ background: theme.bgPrimary }}>
      <AnimatedBackground />

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex flex-col justify-between w-[45%] relative z-10 p-12"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35`, boxShadow: theme.isDark ? `0 0 20px ${theme.accent}25` : 'none' }}>
            <Shield size={20} style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>CyberGuard AI</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>Threat Detection Platform</p>
          </div>
        </div>

        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <div className="mb-8">
              <div className="relative w-20 h-20">
                {theme.isDark && [0, 1, 2].map(i => (
                  <div key={i} className="absolute inset-0 rounded-full border"
                    style={{ borderColor: `${theme.accent}${['30','20','10'][i]}`, transform: `scale(${1 + i * 0.35})`, animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
                ))}
                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}35`, boxShadow: theme.isDark ? `0 0 30px ${theme.accent}25` : 'none' }}>
                  <Shield size={36} style={{ color: theme.accent }} />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold font-display mb-4 leading-tight" style={{ color: theme.textPrimary }}>
              Protect your<br />
              <span style={{ color: theme.accent }}>digital perimeter.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: theme.textMuted }}>
              AI-powered threat detection for URLs and emails. Real-time scanning, multi-layer caching, and intelligent classification.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex gap-8 mt-10">
            {[{ value: '99.2%', label: 'Detection Rate' }, { value: '<1ms', label: 'Cache Response' }, { value: '3-Layer', label: 'Cache System' }].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold font-display" style={{ color: theme.accent }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs" style={{ color: theme.textMuted }}>© 2025 CyberGuard AI. All rights reserved.</p>
      </motion.div>

      <div className="hidden lg:block w-px self-stretch my-12 relative z-10"
        style={{ background: `linear-gradient(to bottom, transparent, ${theme.cardBorder}, transparent)` }} />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="w-full max-w-md">

          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35` }}>
              <Shield size={18} style={{ color: theme.accent }} />
            </div>
            <p className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>CyberGuard AI</p>
          </div>

          <div className="rounded-2xl p-8"
            style={{ background: theme.cardBg, backdropFilter: theme.cardBlur, WebkitBackdropFilter: theme.cardBlur, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>

            <div className="mb-8">
              <h2 className="text-2xl font-bold font-display mb-1.5" style={{ color: theme.textPrimary }}>Welcome back</h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>Sign in to your account to continue</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: `${theme.danger}10`, border: `1px solid ${theme.danger}30`, color: theme.danger }}>
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textMuted }}>Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: focusedField === 'email' ? theme.accent : theme.textMuted }} />
                  <input type="email" placeholder="analyst@cyberguard.ai" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body"
                    style={inputStyle('email')} autoComplete="email" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textMuted }}>Password</label>
                  <button type="button" className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: theme.accent }}>Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: focusedField === 'password' ? theme.accent : theme.textMuted }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body"
                    style={inputStyle('password')} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: theme.textMuted }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-semibold font-display flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: theme.isDark ? `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}aa)` : theme.accent, color: '#ffffff', boxShadow: theme.isDark ? `0 0 24px ${theme.accent}40, 0 4px 12px rgba(0,0,0,0.3)` : `0 4px 14px ${theme.accent}40`, border: 'none' }}>
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin 0.8s linear infinite' }} />Signing in...</>
                ) : (
                  <>Sign in<ArrowRight size={15} /></>
                )}
              </motion.button>
            </form>

            {/* Divider + Guest */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
              <span className="text-xs" style={{ color: theme.textMuted }}>or</span>
              <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
            </div>

            {/* Guest CTA */}
            <motion.button
              type="button"
              onClick={handleGuest}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: theme.isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textSecondary,
              }}>
              <UserX size={15} />
              Continue as Guest
            </motion.button>

            <p className="text-center text-xs mt-4" style={{ color: theme.textMuted }}>
              Guest mode: scans work but history is not saved.
            </p>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
            </div>

            <p className="text-center text-sm" style={{ color: theme.textMuted }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: theme.accent }}>Create account</Link>
            </p>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-2 mt-5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.safe }} />
            <p className="text-xs" style={{ color: theme.textMuted }}>Protected by CyberGuard AI · TLS 1.3 encrypted</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login