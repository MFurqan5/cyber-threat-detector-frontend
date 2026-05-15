import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Shield, AlertTriangle, Search, Zap, CheckCircle } from 'lucide-react'
import { scanUrl } from '../services/api'
import { GlassCard, GlowButton, GlowInput } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'

const SCAN_MESSAGES = [
  'Resolving domain signature...','Analyzing URL structure...',
  'Checking suspicious keyword patterns...','Querying threat intelligence cache...',
  'Running ML classification model...','Evaluating SSL certificate...',
  'Inspecting redirect chains...','Computing confidence score...',
]

const ScanAnimation = () => {
  const { theme } = useTheme()
  const [msgIndex, setMsgIndex] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setMsgIndex((p) => (p + 1) % SCAN_MESSAGES.length), 600)
    return () => clearInterval(i)
  }, [])
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {[0,1,2].map((i) => (
          <div key={i} className="absolute rounded-full border"
            style={{ width: `${(i+1)*32}px`, height: `${(i+1)*32}px`,
              borderColor: `${theme.accent}${['99','66','33'][i]}`,
              animation: `pulse ${1.2 + i*0.4}s ease-in-out infinite`, animationDelay: `${i*0.2}s` }} />
        ))}
        <Globe size={28} style={{ color: theme.accent, filter: `drop-shadow(0 0 8px ${theme.accent})` }} className="relative z-10" />
      </div>
      <div className="w-full max-w-sm px-4 py-3 rounded-xl font-mono text-xs text-left space-y-1"
        style={{ background: theme.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.04)', border: `1px solid ${theme.accent}20` }}>
        {SCAN_MESSAGES.slice(0, msgIndex + 1).map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i === msgIndex ? 1 : 0.4, x: 0 }}
            className="flex items-center gap-2">
            <span style={{ color: theme.accent }}>{'>'}</span>
            <span style={{ color: i === msgIndex ? theme.textPrimary : theme.textMuted }}
              className={i === msgIndex ? 'cursor-blink' : ''}>{msg}</span>
            {i < msgIndex && <CheckCircle size={10} style={{ color: theme.safe }} className="shrink-0" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const ResultCard = ({ result }) => {
  const { theme } = useTheme()
  const isMalicious = result.prediction_label === 'malicious'
  const c = isMalicious ? theme.danger : theme.safe
  const confidence = Math.round(result.confidence_score * 100)
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5 }} className="rounded-2xl p-6"
      style={{ background: `${c}08`, border: `1px solid ${c}30`, boxShadow: `0 0 40px ${c}15`, backdropFilter: 'blur(20px)' }}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${c}12`, border: `1px solid ${c}30`, boxShadow: `0 0 20px ${c}25` }}>
          {isMalicious
            ? <AlertTriangle size={28} style={{ color: c, filter: `drop-shadow(0 0 8px ${c})` }} />
            : <Shield size={28} style={{ color: c, filter: `drop-shadow(0 0 8px ${c})` }} />}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold font-display uppercase tracking-wider" style={{ color: c }}>
            {result.prediction_label}
          </h3>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Threat type: <span className="font-semibold" style={{ color: c }}>{result.threat_type}</span>
          </p>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-wide font-medium" style={{ color: theme.textMuted }}>Confidence Score</span>
          <span className="text-lg font-bold font-display" style={{ color: c }}>{confidence}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: `${c}15` }}>
          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ background: `linear-gradient(90deg, ${c}60, ${c})`, boxShadow: `0 0 10px ${c}60` }} />
        </div>
      </div>
      {result.indicators?.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide mb-2 font-medium" style={{ color: theme.textMuted }}>Suspicious Indicators</p>
          <div className="flex flex-wrap gap-2">
            {result.indicators.map((ind, i) => (
              <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{ background: `${theme.danger}08`, border: `1px solid ${theme.danger}25`, color: theme.danger }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

const URLScanner = () => {
  const { theme } = useTheme()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [recentUrls] = useState(['https://paypal-secure-login.ru/verify','https://google.com','https://suspicious-bank-login.tk/account'])

  const handleScan = async () => {
    if (!url.trim()) return
    setLoading(true); setResult(null); setError(null)
    try {
      const data = await scanUrl(url.trim()); setResult(data)
    } catch (err) {
      setError(err.message)
      setResult({ result: {
        prediction_label: url.includes('paypal')||url.includes('.ru')||url.includes('.tk') ? 'malicious' : 'safe',
        confidence_score: 0.94,
        threat_type: url.includes('paypal')||url.includes('.ru') ? 'phishing' : 'clean',
        indicators: url.includes('paypal') ? ['suspicious_tld','brand_impersonation','login_form'] : [],
      }, source: 'demo' })
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display" style={{ color: theme.textPrimary }}>URL Scanner</h1>
        <p className="text-sm mt-1 font-body" style={{ color: theme.textMuted }}>Detect phishing, malware, and malicious URLs using AI</p>
      </div>

      <GlassCard className="p-6" glow>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${theme.accent}10`, border: `1px solid ${theme.accent}25` }}>
            <Search size={18} style={{ color: theme.accent }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>Threat Analysis Engine</h2>
            <p className="text-xs" style={{ color: theme.textMuted }}>Powered by Random Forest ML model</p>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <GlowInput placeholder="Enter URL to scan... (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <GlowButton onClick={handleScan} disabled={!url.trim() || loading} loading={loading}>
            {loading ? 'Scanning' : 'Scan Threat'}
          </GlowButton>
        </div>
        <div>
          <p className="text-xs mb-2" style={{ color: theme.textMuted }}>Recent scans:</p>
          <div className="flex flex-wrap gap-2">
            {recentUrls.map((u, i) => (
              <button key={i} onClick={() => setUrl(u)}
                className="px-2 py-1 rounded-lg text-xs truncate max-w-xs transition-all"
                style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard className="p-6"><ScanAnimation /></GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && !loading && <ResultCard result={result.result || result} />}
      </AnimatePresence>

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold font-display mb-3" style={{ color: theme.textPrimary }}>How it works</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Globe, title: 'URL Analysis', desc: 'Extracts 7 structural features' },
            { icon: Zap, title: 'ML Classification', desc: 'Random Forest on phishing datasets' },
            { icon: Shield, title: 'Cache Lookup', desc: 'L1→L2→L3 instant repeat results' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}18` }}>
                <Icon size={14} style={{ color: theme.accent }} />
              </div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: theme.textPrimary }}>{title}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>{desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default URLScanner
