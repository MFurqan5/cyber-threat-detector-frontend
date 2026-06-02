import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Shield, Pencil, Check, LogOut, Lock, Eye, EyeOff, KeyRound, Loader2, AlertCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth, isGuest } from '../../context/AuthContext'
import { getMe, updateMe } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const ROLE_COLORS = {
  admin:   { bg: '#ef444418', border: '#ef444440', text: '#ef4444', label: 'Administrator' },
  analyst: { bg: '#6366f118', border: '#6366f140', text: '#6366f1', label: 'Analyst' },
  user:    { bg: '#22c55e18', border: '#22c55e40', text: '#22c55e', label: 'User' },
}

const ProfilePanel = ({ open, onClose }) => {
  const { theme } = useTheme()
  const { user: ctxUser, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const panelRef = useRef()

  const [profile, setProfile]   = useState(null)   // data from PostgreSQL
  const [loading, setLoading]   = useState(false)
  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [showPw,  setShowPw]    = useState(false)
  const [saved,   setSaved]     = useState(false)
  const [error,   setError]     = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  // ── Fetch from PostgreSQL whenever panel opens ──────────────────────────────
  useEffect(() => {
    if (!open) { setEditing(false); setError(''); return }
    setLoading(true)
    getMe()
      .then(data => {
        setProfile(data)
        setForm({ username: data.username || '', email: data.email || '', password: '' })
        // keep AuthContext in sync with DB truth
        updateUser({ username: data.username, email: data.email, role: data.role })
      })
      .catch(() => {
        // fallback to AuthContext / localStorage if backend unreachable
        if (ctxUser) {
          setProfile(ctxUser)
          setForm({ username: ctxUser.username || '', email: ctxUser.email || '', password: '' })
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ── Close on outside click ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const guestMode   = isGuest()
  const displayed   = profile || ctxUser
  const roleKey     = guestMode ? 'user' : (displayed?.role || 'analyst')
  const roleInfo    = ROLE_COLORS[roleKey] || ROLE_COLORS.analyst
  const avatarLetter = guestMode ? 'G' : (displayed?.username || displayed?.email || 'U').charAt(0).toUpperCase()

  // ── Save changes to PostgreSQL ──────────────────────────────────────────────
  const handleSave = async () => {
    setError('')
    setSaving(true)
    const payload = {}
    if (form.username && form.username !== profile?.username) payload.username = form.username.trim()
    if (form.email    && form.email    !== profile?.email)    payload.email    = form.email.trim()
    if (form.password)                                        payload.password = form.password

    try {
      const res = await updateMe(payload)
      const updated = res.user || res
      setProfile(prev => ({ ...prev, ...updated }))
      updateUser(updated)   // sync AuthContext + localStorage
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  const inputBase = {
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    color: theme.textPrimary,
    caretColor: theme.accent,
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 28, scale: 0.97 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 28, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed top-20 right-4 z-50 w-80 rounded-2xl overflow-hidden"
            style={{
              background:         theme.cardBg,
              backdropFilter:     theme.cardBlur,
              WebkitBackdropFilter: theme.cardBlur,
              border:             `1px solid ${theme.cardBorder}`,
              boxShadow: theme.isDark
                ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
                : '0 24px 64px rgba(0,0,0,0.14)',
            }}
          >
            {/* Accent top strip */}
            <div className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}66)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3"
              style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
              <span className="text-sm font-bold font-display" style={{ color: theme.textPrimary }}>
                My Profile
              </span>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: theme.isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
                <X size={14} style={{ color: theme.textMuted }} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Loading skeleton */}
              {loading && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 size={24} className="animate-spin" style={{ color: theme.accent }} />
                  <p className="text-xs" style={{ color: theme.textMuted }}>Loading profile…</p>
                </div>
              )}

              {/* Guest mode view */}
              {!loading && guestMode && (
                <>
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                      style={{ background: `${theme.textMuted}18`, color: theme.textMuted, border: `1px dashed ${theme.cardBorder}` }}>
                      G
                    </div>
                    <div>
                      <p className="font-bold text-base" style={{ color: theme.textPrimary }}>Guest Session</p>
                      <p className="text-xs mt-1" style={{ color: theme.textMuted }}>You're browsing without an account.</p>
                      <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>Scan history is not saved in guest mode.</p>
                    </div>
                    <div className="w-full flex gap-2 mt-2">
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => { onClose(); navigate('/login') }}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}aa)`, color: '#fff', border: 'none', boxShadow: `0 4px 12px ${theme.accent}35` }}>
                        Sign In
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => { onClose(); navigate('/signup') }}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: `${theme.accent}14`, color: theme.accent, border: `1px solid ${theme.accent}35` }}>
                        Sign Up
                      </motion.button>
                    </div>
                  </div>
                  <div className="h-px" style={{ background: theme.cardBorder }} />
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: `${theme.danger}10`, color: theme.danger, border: `1px solid ${theme.danger}25` }}>
                    <LogOut size={14} /> Exit Guest Mode
                  </motion.button>
                </>
              )}

              {!loading && !guestMode && (
                <>
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}88)`,
                        color: '#fff',
                        boxShadow: `0 0 0 3px ${theme.accent}28, 0 8px 20px ${theme.accent}30`,
                      }}>
                      {avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-base truncate" style={{ color: theme.textPrimary }}>
                        {displayed?.username || 'User'}
                      </p>
                      <p className="text-xs truncate mb-1.5" style={{ color: theme.textMuted }}>
                        {displayed?.email || '—'}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: roleInfo.bg, border: `1px solid ${roleInfo.border}`, color: roleInfo.text }}>
                        <Shield size={10} /> {roleInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Success flash */}
                  <AnimatePresence>
                    {saved && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background: `${theme.safe}18`, border: `1px solid ${theme.safe}30`, color: theme.safe }}>
                        <Check size={13} /> Profile saved to database
                      </motion.div>
                    )}
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background: `${theme.danger}12`, border: `1px solid ${theme.danger}30`, color: theme.danger }}>
                        <AlertCircle size={13} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Fields */}
                  <div className="space-y-3">

                    {/* Username */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
                        style={{ color: theme.textMuted }}>
                        <User size={11} /> Username
                      </label>
                      {editing ? (
                        <input className="w-full px-3 py-2 rounded-xl text-sm font-body" style={inputBase}
                          value={form.username} placeholder="username"
                          onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                      ) : (
                        <p className="text-sm font-medium px-3 py-2 rounded-xl"
                          style={{ background: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.surfaceBg, color: theme.textPrimary }}>
                          {displayed?.username || '—'}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
                        style={{ color: theme.textMuted }}>
                        <Mail size={11} /> Email
                      </label>
                      {editing ? (
                        <input type="email" className="w-full px-3 py-2 rounded-xl text-sm font-body" style={inputBase}
                          value={form.email} placeholder="email@example.com"
                          onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                      ) : (
                        <p className="text-sm font-medium px-3 py-2 rounded-xl"
                          style={{ background: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.surfaceBg, color: theme.textPrimary }}>
                          {displayed?.email || '—'}
                        </p>
                      )}
                    </div>

                    {/* Role — always read-only */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
                        style={{ color: theme.textMuted }}>
                        <KeyRound size={11} /> Role
                      </label>
                      <p className="text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-2"
                        style={{ background: roleInfo.bg, color: roleInfo.text }}>
                        <Shield size={12} /> {roleInfo.label}
                        <span className="ml-auto text-xs opacity-50">(read-only)</span>
                      </p>
                    </div>

                    {/* New password — only in edit mode */}
                    <AnimatePresence>
                      {editing && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1.5"
                            style={{ color: theme.textMuted }}>
                            <Lock size={11} /> New Password <span className="lowercase font-normal opacity-60">(optional)</span>
                          </label>
                          <div className="relative">
                            <input type={showPw ? 'text' : 'password'}
                              className="w-full pl-3 pr-9 py-2 rounded-xl text-sm font-body" style={inputBase}
                              value={form.password} placeholder="Leave blank to keep current"
                              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                            <button type="button" onClick={() => setShowPw(p => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                              style={{ color: theme.textMuted }}>
                              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    {editing ? (
                      <>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
                          style={{ background: `linear-gradient(135deg, ${theme.accent}dd, ${theme.accent}aa)`, color: '#fff',
                            boxShadow: `0 4px 14px ${theme.accent}40`, border: 'none' }}>
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          {saving ? 'Saving…' : 'Save Changes'}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setEditing(false); setError('') }}
                          className="px-4 py-2 rounded-xl text-sm font-medium"
                          style={{ background: theme.isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
                            color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` }}>
                          Cancel
                        </motion.button>
                      </>
                    ) : (
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setEditing(true); setError('') }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: `${theme.accent}14`, color: theme.accent, border: `1px solid ${theme.accent}35` }}>
                        <Pencil size={13} /> Edit Profile
                      </motion.button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px" style={{ background: theme.cardBorder }} />

                  {/* Logout */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: `${theme.danger}10`, color: theme.danger, border: `1px solid ${theme.danger}25` }}>
                    <LogOut size={14} /> Sign Out
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default ProfilePanel
