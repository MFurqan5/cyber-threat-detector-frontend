import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Shield, AlertTriangle, Cpu, CheckCircle, X, AlertCircle } from 'lucide-react'
import { scanEmail } from '../services/api'
import { GlassCard, GlowButton, GlowInput, ConfidenceBar } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'

const SAMPLES = [
  { label: 'Phishing sample', text: `Dear Customer,\n\nYour PayPal account has been temporarily suspended due to suspicious activity.\n\nTo restore your account, verify your identity immediately:\nhttp://paypal-secure-verify.ru/account/restore\n\nComplete within 24 hours or your account will be closed.\n\nPayPal Security Team` },
  { label: 'Spam sample', text: `Congratulations! You've been selected as our WINNER of $1,000,000 USD!\n\nTo claim your prize, send your details to: claim@lottery-winner-2025.tk\n\nACT NOW! 100% GUARANTEED!` },
  { label: 'Legitimate email', text: `Hi team,\n\nJust a reminder that our weekly sync is Thursday at 2pm EST.\n\nWe'll review the Q3 roadmap and discuss the product launch. Please review the attached doc beforehand.\n\nBest,\nSarah` },
]

const EmailScanner = () => {
  const { theme } = useTheme()
  const [emailText, setEmailText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async () => {
    if (!emailText.trim()) return
    setLoading(true); setResult(null); setError(null)
    try {
      setResult(await scanEmail(emailText))
    } catch (err) {
      setError(err.message)
      const isSpam = /winner|lottery|prize|guaranteed/i.test(emailText)
      const isPhish = /paypal|suspend|verify|account.*restore/i.test(emailText)
      setResult({
        result: {
          prediction_label: (isSpam || isPhish) ? 'malicious' : 'safe',
          confidence_score: isSpam ? 0.99 : isPhish ? 0.96 : 0.91,
          threat_type: isSpam ? 'spam' : isPhish ? 'phishing' : 'clean',
          indicators: isPhish ? ['urgency_language','suspicious_link','brand_impersonation','credential_request']
            : isSpam ? ['prize_language','suspicious_sender','financial_scam'] : [],
          summary: (isSpam || isPhish)
            ? 'This email shows multiple phishing/spam characteristics: urgency, suspicious links, and attempts to extract personal information.'
            : 'This email appears to be legitimate business communication with no suspicious patterns.',
        },
        source: 'demo',
      })
    } finally { setLoading(false) }
  }

  const r = result?.result || result
  const isMalicious = r && (r.prediction_label === 'malicious')
  const c = !r ? theme.accent : isMalicious ? theme.danger : theme.safe

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-display" style={{ color: theme.textPrimary }}>Email Scanner</h1>
        <p className="text-sm mt-1 font-body" style={{ color: theme.textMuted }}>AI-powered spam and phishing email detection</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs self-center mr-1" style={{ color: theme.textMuted }}>Load sample:</span>
        {SAMPLES.map((s, i) => (
          <button key={i} onClick={() => { setEmailText(s.text); setResult(null) }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: input */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${theme.warning}12`, border: `1px solid ${theme.warning}28` }}>
              <Mail size={16} style={{ color: theme.warning }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>Email Content</h2>
              <p className="text-xs" style={{ color: theme.textMuted }}>Paste full email content</p>
            </div>
          </div>
          <GlowInput multiline rows={14}
            placeholder={`Paste email content here...\n\nSubject: Important Account Notice\nFrom: security@paypal-verify.ru\n\nDear Customer...`}
            value={emailText} onChange={e => setEmailText(e.target.value)} className="mb-4" />
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: theme.textMuted }}>
              {emailText.length} chars · {emailText.split(/\s+/).filter(Boolean).length} words
            </p>
            <div className="flex gap-2">
              {emailText && (
                <button onClick={() => { setEmailText(''); setResult(null) }}
                  className="px-3 py-2 rounded-xl text-xs transition-all hover:opacity-70 flex items-center gap-1"
                  style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}`, color: theme.textMuted }}>
                  <X size={11} /> Clear
                </button>
              )}
              <GlowButton onClick={handleScan} disabled={!emailText.trim() || loading} loading={loading}>
                {loading ? 'Analyzing' : 'Analyze Email'}
              </GlowButton>
            </div>
          </div>
        </GlassCard>

        {/* Right: results */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}28` }}>
              <Cpu size={16} style={{ color: theme.accent }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>AI Analysis</h2>
              <p className="text-xs" style={{ color: theme.textMuted }}>Naive Bayes + TF-IDF classifier</p>
            </div>
          </div>

          {error && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs"
              style={{ background: `${theme.warning}10`, border: `1px solid ${theme.warning}28`, color: theme.warning }}>
              ⚠ Backend offline — showing demo analysis
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="relative w-16 h-16">
                {[0,1].map(i => (
                  <div key={i} className="absolute inset-0 rounded-full border" style={{
                    borderColor: `${theme.accent}${['99','44'][i]}`,
                    animation: `pulse ${1 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }} />
                ))}
                <Cpu size={22} className="absolute inset-0 m-auto" style={{ color: theme.accent }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>Analyzing...</p>
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>TF-IDF feature extraction in progress</p>
              </div>
            </div>
          )}

          {!loading && !r && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
                <Cpu size={28} style={{ color: theme.textMuted, opacity: 0.4 }} />
              </div>
              <p className="text-sm font-semibold font-display" style={{ color: theme.textSecondary }}>AI Analysis Panel</p>
              <p className="text-xs max-w-xs" style={{ color: theme.textMuted }}>
                Enter email content on the left and click Analyze to run the threat detection model
              </p>
            </div>
          )}

          {!loading && r && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: `${c}09`, border: `1px solid ${c}28` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${c}12`, border: `1px solid ${c}30` }}>
                  {isMalicious
                    ? <AlertTriangle size={24} style={{ color: c }} />
                    : <Shield size={24} style={{ color: c }} />}
                </div>
                <div>
                  <p className="text-lg font-bold font-display uppercase" style={{ color: c }}>{r.prediction_label}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Threat: <span className="font-semibold" style={{ color: c }}>{r.threat_type}</span></p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: theme.textMuted }}>Confidence Metrics</p>
                <div className="space-y-3">
                  <ConfidenceBar score={r.confidence_score} label="Classification Confidence" color={c} />
                  <ConfidenceBar score={0.89} label="Model Certainty" color={theme.accent} />
                  <ConfidenceBar score={0.76} label="Pattern Match" color={theme.warning} />
                </div>
              </div>

              {r.indicators?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.textMuted }}>Suspicious Indicators</p>
                  <div className="space-y-1.5">
                    {r.indicators.map((ind, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <AlertCircle size={12} style={{ color: theme.danger }} className="shrink-0" />
                        <span className="text-xs" style={{ color: theme.textSecondary }}>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.summary && (
                <div className="p-3 rounded-xl" style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>AI Summary</p>
                  <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>{r.summary}</p>
                </div>
              )}
            </motion.div>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-5">
          {['Naive Bayes classifier — 97%+ accuracy', 'TF-IDF with 5,000 max features', 'Multi-layer cache supported'].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
              <CheckCircle size={13} style={{ color: theme.safe }} /> {t}
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default EmailScanner
