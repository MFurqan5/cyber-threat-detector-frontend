import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Globe, Mail, Database, Zap,
  Lock, BarChart2, CheckCircle2, ArrowRight,
  ShieldAlert, Menu, X, History, UserX,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ui/ThemeSwitcher'

const LandingPage = () => {
  const { theme: t } = useTheme()
  const { loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleGuest = () => {
    loginAsGuest()
    navigate('/dashboard')
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div style={{ background: t.bgPrimary, color: t.textPrimary, fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '60px',
        background: scrolled ? (t.isDark ? 'rgba(14,15,17,0.95)' : 'rgba(255,255,255,0.95)') : t.bgPrimary,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? t.cardBorder : 'transparent'}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${t.accent}18`, border: `1px solid ${t.accent}35` }}>
            <Shield size={15} style={{ color: t.accent }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: t.textPrimary }}>CyberSentinel AI</span>
        </div>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2rem' }}>
          {[['Features', 'features'], ['How It Works', 'how'], ['Stats', 'stats']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: t.textSecondary }}
              onMouseEnter={e => e.target.style.color = t.textPrimary}
              onMouseLeave={e => e.target.style.color = t.textSecondary}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <Link to="/login" className="hidden md:block" style={{ fontSize: '0.875rem', fontWeight: 500, color: t.textSecondary, textDecoration: 'none', padding: '0.4rem 1rem', borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.cardBg }}>Sign In</Link>
          <Link to="/signup" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '0.4rem 1.1rem', borderRadius: 10, background: t.accent }}>Get Started</Link>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textPrimary }}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{ position: 'sticky', top: 60, zIndex: 99, background: t.isDark ? 'rgba(14,15,17,0.98)' : '#fff', borderBottom: `1px solid ${t.cardBorder}`, padding: '1rem 2rem' }}>
          {[['Features', 'features'], ['How It Works', 'how'], ['Stats', 'stats']].map(([label, id]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: t.textSecondary, padding: '0.6rem 0' }}>{label}</button>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Link to="/login" style={{ flex: 1, textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: t.textSecondary, textDecoration: 'none', padding: '0.5rem', borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>Sign In</Link>
            <Link to="/signup" style={{ flex: 1, textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '0.5rem', borderRadius: 10, background: t.accent }}>Sign Up</Link>
          </div>
        </div>
      )}

      {/* HERO */}
      <section style={{ padding: '5rem 2rem 4rem', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.9rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem', background: `${t.accent}14`, border: `1px solid ${t.accent}30`, color: t.accent }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
          AI-Powered Cybersecurity Platform
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem', color: t.textPrimary }}>
          Detect Threats Before<br /><span style={{ color: t.accent }}>They Reach You</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.7, color: t.textMuted, maxWidth: '520px', margin: '0 auto 2.5rem' }}>
          Scan URLs, emails, and files for threats in real time using machine learning.
          Multi-layer caching delivers results in under a millisecond.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600, color: '#fff', background: t.accent, textDecoration: 'none', boxShadow: `0 4px 20px ${t.accent}40` }}>
            Start for Free <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 500, color: t.textSecondary, background: t.cardBg, textDecoration: 'none', border: `1px solid ${t.cardBorder}` }}>
            Sign In
          </Link>
          <button onClick={handleGuest}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 500, color: t.textMuted, background: 'transparent', border: `1px dashed ${t.cardBorder}`, cursor: 'pointer' }}>
            <UserX size={15} /> Continue as Guest
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {[[CheckCircle2, 'No credit card required'], [Lock, 'TLS 1.3 encrypted'], [Zap, 'Results under 1ms']].map(([Icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: t.textMuted }}>
              <Icon size={13} style={{ color: t.safe }} />{text}
            </div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '4rem 2rem', background: t.bgSecondary }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.accent, marginBottom: '0.6rem' }}>Features</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 700, color: t.textPrimary, marginBottom: '0.6rem' }}>Everything you need to stay protected</h2>
            <p style={{ fontSize: '0.95rem', color: t.textMuted, maxWidth: '460px', margin: '0 auto' }}>A complete AI security platform built for analysts and teams.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { icon: Globe,       color: t.accent,  title: 'URL Scanner',       desc: 'Detects phishing and malware using Random Forest classification trained on real phishing datasets.' },
              { icon: Mail,        color: t.warning, title: 'Email Scanner',      desc: 'Identifies spam and phishing emails using Naive Bayes + TF-IDF with 97%+ accuracy.' },
              { icon: ShieldAlert, color: t.danger,  title: 'Malware Detection',  desc: 'Upload any file. Our model analyzes binary signatures, entropy, and behavioral patterns.' },
              { icon: Database,    color: t.safe,    title: '3-Layer Cache',      desc: 'L1 memory → L2 Redis → L3 MongoDB. Repeat scans return in under 1ms with no ML overhead.' },
              { icon: BarChart2,   color: '#a78bfa', title: 'Threat Analytics',   desc: 'Real-time dashboard with charts, cache performance metrics, and live scan feed.' },
              { icon: History,     color: t.accent,  title: 'Scan History',       desc: 'Full audit trail with filtering by date, type, and status. Export to PDF or Excel.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                style={{ padding: '1.5rem', borderRadius: 16, background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, transition: 'transform 0.2s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}14`, border: `1px solid ${color}28`, marginBottom: '1rem' }}>
                  <Icon size={19} style={{ color }} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.textPrimary, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: t.textMuted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '4rem 2rem', background: t.bgPrimary }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.accent, marginBottom: '0.6rem' }}>How It Works</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 700, color: t.textPrimary }}>From input to verdict in milliseconds</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
            {[
              { n: '1', icon: Globe,    color: t.accent,  title: 'Submit Input',  desc: 'Paste a URL, email, or upload a file' },
              { n: '2', icon: Database, color: t.safe,    title: 'Cache Lookup',  desc: 'L1 → L2 → L3 checked instantly' },
              { n: '3', icon: Zap,      color: '#a78bfa', title: 'AI Analysis',   desc: 'ML model runs on cache miss' },
              { n: '4', icon: Shield,   color: t.danger,  title: 'Get Verdict',   desc: 'Safe or malicious with confidence' },
            ].map(({ n, icon: Icon, color, title, desc }) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, border: `1px solid ${color}28`, margin: '0 auto' }}>
                    <Icon size={26} style={{ color }} />
                  </div>
                  <div style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>{n}</div>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: t.textPrimary, marginBottom: '0.4rem' }}>{title}</h3>
                <p style={{ fontSize: '0.82rem', color: t.textMuted, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" style={{ padding: '4rem 2rem', background: t.bgSecondary }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.accent, marginBottom: '0.6rem' }}>By the Numbers</p>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 700, color: t.textPrimary }}>Trusted. Fast. Accurate.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {[
              { value: '99.2%',   label: 'Detection Accuracy', color: t.safe    },
              { value: '14,820+', label: 'Scans Processed',    color: t.accent  },
              { value: '<1ms',    label: 'Cache Response',      color: '#a78bfa' },
              { value: '3',       label: 'Cache Layers',        color: t.warning },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '1.5rem 1rem', borderRadius: 14, background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, color, marginBottom: '0.3rem' }}>{value}</p>
                <p style={{ fontSize: '0.8rem', color: t.textMuted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', background: t.bgPrimary, textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 14, marginBottom: '1.5rem', background: `${t.accent}14`, border: `1px solid ${t.accent}30` }}>
            <Shield size={22} style={{ color: t.accent }} />
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 700, color: t.textPrimary, marginBottom: '1rem' }}>Ready to secure your perimeter?</h2>
          <p style={{ fontSize: '1rem', color: t.textMuted, marginBottom: '2rem' }}>Create an account and start scanning in minutes. Free to use.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600, color: '#fff', background: t.accent, textDecoration: 'none', boxShadow: `0 4px 20px ${t.accent}40` }}>
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 500, color: t.textSecondary, background: t.cardBg, textDecoration: 'none', border: `1px solid ${t.cardBorder}` }}>
              Sign In
            </Link>
            <button onClick={handleGuest}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 500, color: t.textMuted, background: 'transparent', border: `1px dashed ${t.cardBorder}`, cursor: 'pointer' }}>
              <UserX size={15} /> Continue as Guest
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: t.textMuted, marginTop: '1.25rem' }}>No credit card · Free to use · TLS 1.3 encrypted</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '1.5rem 2rem', borderTop: `1px solid ${t.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: t.bgPrimary }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${t.accent}18`, border: `1px solid ${t.accent}30` }}>
            <Shield size={12} style={{ color: t.accent }} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.825rem', color: t.textPrimary }}>CyberSentinel AI</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: t.textMuted }}>© 2025 CyberSentinel AI. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <Link to="/login"  style={{ fontSize: '0.78rem', color: t.textMuted, textDecoration: 'none' }}>Sign In</Link>
          <Link to="/signup" style={{ fontSize: '0.78rem', color: t.textMuted, textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
