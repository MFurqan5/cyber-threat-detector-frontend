import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../services/api'
import ThemeToggle from '../components/ui/ThemeSwitcher'
import AnimatedBackground from '../components/ui/AnimatedBackground'

const PasswordStrength = ({ password }) => {
  const { theme } = useTheme()
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One number', pass: /\d/.test(password) },
    { label: 'One special character', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const passed = checks.filter(c => c.pass).length
  const strength = passed === 0 ? null : passed <= 1 ? 'weak' : passed <= 3 ? 'medium' : 'strong'
  const strengthColor = { weak: theme.danger, medium: theme.warning, strong: theme.safe }[strength] || theme.cardBorder
  const strengthLabel = { weak: 'Weak', medium: 'Fair', strong: 'Strong' }[strength] || ''
  if (!password) return null
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[0,1,2,3].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: theme.isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: i < passed ? '100%' : '0%' }} transition={{ duration: 0.3, delay: i * 0.05 }} style={{ background: strengthColor }} />
            </div>
          ))}
        </div>
        {strengthLabel && <span className="text-xs font-semibold w-12 text-right" style={{ color: strengthColor }}>{strengthLabel}</span>}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(({ label, pass }) => (
          <div key={label} className="flex items-center gap-1.5">
            <CheckCircle2 size={11} style={{ color: pass ? theme.safe : theme.textMuted, flexShrink: 0 }} />
            <span className="text-xs" style={{ color: pass ? theme.textSecondary : theme.textMuted }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const Signup = () => {
  const { theme } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [agreed, setAgreed] = useState(false)

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.confirm) { setError('Please fill in all fields.'); return }
    if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
      setError('Username can only contain alphanumeric characters, underscores, or hyphens (no spaces).');
      return
    }
    if (form.username.length < 3 || form.username.length > 50) {
      setError('Username must be between 3 and 50 characters.');
      return
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!agreed) { setError('Please accept the terms and conditions.'); return }
    setError('')
    setLoading(true)
    try {
      const data = await registerUser(form.username, form.email, form.password)
      const userData = data.user || { username: form.username, email: form.email, role: 'analyst' }
      login(data.access_token, userData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    background: theme.inputBg,
    border: `1px solid ${field === 'confirm' && form.confirm && form.password !== form.confirm ? theme.danger : focusedField === field ? theme.inputFocusBorder : theme.inputBorder}`,
    boxShadow: focusedField === field ? `0 0 0 3px ${theme.inputFocusShadow}` : 'none',
    color: theme.textPrimary, caretColor: theme.accent, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  })

  const passwordsMatch = form.confirm && form.password === form.confirm

  return (
    <div className="relative min-h-screen w-full flex" style={{ background: theme.bgPrimary }}>
      <AnimatedBackground />
      <div className="absolute top-5 right-5 z-20"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden lg:flex flex-col justify-between w-[42%] relative z-10 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35` }}>
            <Shield size={20} style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>CyberSentinel AI</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>Threat Detection Platform</p>
          </div>
        </div>

        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <h1 className="text-4xl font-bold font-display mb-4 leading-tight" style={{ color: theme.textPrimary }}>
              Start scanning.<br /><span style={{ color: theme.accent }}>Stay protected.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: theme.textMuted }}>
              Create your account and get instant access to AI-powered threat detection, real-time scanning, and full analytics.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="mt-10 space-y-3">
            {['URL phishing & malware detection', 'Email spam & threat classification', 'Multi-layer cache analytics', 'Full scan history & export'].map((feat, i) => (
              <motion.div key={feat} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.08 }} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${theme.safe}18`, border: `1px solid ${theme.safe}30` }}>
                  <CheckCircle2 size={11} style={{ color: theme.safe }} />
                </div>
                <span className="text-sm" style={{ color: theme.textSecondary }}>{feat}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs" style={{ color: theme.textMuted }}>© 2025 CyberSentinel AI. All rights reserved.</p>
      </motion.div>

      <div className="hidden lg:block w-px self-stretch my-12 relative z-10" style={{ background: `linear-gradient(to bottom, transparent, ${theme.cardBorder}, transparent)` }} />

      <div className="flex-1 flex items-center justify-center relative z-10 p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="w-full max-w-md py-6">

          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35` }}>
              <Shield size={18} style={{ color: theme.accent }} />
            </div>
            <p className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>CyberSentinel AI</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: theme.cardBg, backdropFilter: theme.cardBlur, WebkitBackdropFilter: theme.cardBlur, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
            <div className="mb-7">
              <h2 className="text-2xl font-bold font-display mb-1.5" style={{ color: theme.textPrimary }}>Create account</h2>
              <p className="text-sm" style={{ color: theme.textMuted }}>Get started with CyberSentinel AI today</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 20 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: `${theme.danger}10`, border: `1px solid ${theme.danger}30`, color: theme.danger }}>
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textMuted }}>Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focusedField === 'username' ? theme.accent : theme.textMuted }} />
                  <input type="text" placeholder="john_analyst" value={form.username} onChange={set('username')} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body" style={inputStyle('username')} autoComplete="username" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textMuted }}>Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focusedField === 'email' ? theme.accent : theme.textMuted }} />
                  <input type="email" placeholder="analyst@cybersentinel.ai" value={form.email} onChange={set('email')} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body" style={inputStyle('email')} autoComplete="email" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textMuted }}>Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focusedField === 'password' ? theme.accent : theme.textMuted }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={set('password')} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body" style={inputStyle('password')} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity" style={{ color: theme.textMuted }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>{form.password && <PasswordStrength password={form.password} />}</AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textMuted }}>Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: focusedField === 'confirm' ? theme.accent : theme.textMuted }} />
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirm} onChange={set('confirm')} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-body" style={inputStyle('confirm')} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity" style={{ color: theme.textMuted }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {form.confirm && <div className="absolute right-10 top-1/2 -translate-y-1/2"><CheckCircle2 size={14} style={{ color: passwordsMatch ? theme.safe : theme.danger }} /></div>}
                </div>
                {form.confirm && !passwordsMatch && <p className="text-xs mt-1.5" style={{ color: theme.danger }}>Passwords do not match</p>}
              </div>

              <div className="flex items-start gap-3 pt-1">
                <button type="button" onClick={() => setAgreed(p => !p)} className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
                  style={{ background: agreed ? theme.accent : 'transparent', border: `1.5px solid ${agreed ? theme.accent : theme.inputBorder}`, boxShadow: agreed && theme.isDark ? `0 0 8px ${theme.accent}50` : 'none' }}>
                  {agreed && <CheckCircle2 size={10} style={{ color: '#fff' }} />}
                </button>
                <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                  I agree to the <span className="font-medium cursor-pointer hover:opacity-70 transition-opacity" style={{ color: theme.accent }}>Terms of Service</span> and <span className="font-medium cursor-pointer hover:opacity-70 transition-opacity" style={{ color: theme.accent }}>Privacy Policy</span>
                </p>
              </div>

              <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-semibold font-display flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: theme.isDark ? `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}aa)` : theme.accent, color: '#ffffff', boxShadow: theme.isDark ? `0 0 24px ${theme.accent}40, 0 4px 12px rgba(0,0,0,0.3)` : `0 4px 14px ${theme.accent}40`, border: 'none' }}>
                {loading ? (<><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin 0.8s linear infinite' }} />Creating account...</>) : (<>Create account<ArrowRight size={15} /></>)}
              </motion.button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
              <span className="text-xs" style={{ color: theme.textMuted }}>or</span>
              <div className="flex-1 h-px" style={{ background: theme.cardBorder }} />
            </div>

            <p className="text-center text-sm" style={{ color: theme.textMuted }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: theme.accent }}>Sign in</Link>
            </p>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-2 mt-5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.safe }} />
            <p className="text-xs" style={{ color: theme.textMuted }}>Protected by CyberSentinel AI · TLS 1.3 encrypted</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup