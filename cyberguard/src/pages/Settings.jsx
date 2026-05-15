import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Server, Database, Zap, Shield, Save, AlertCircle } from 'lucide-react'
import { GlassCard, GlowButton } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'

const Toggle = ({ value, onChange, label, description }) => {
  const { theme } = useTheme()
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all duration-200 shrink-0"
        style={{
          background: value ? `${theme.accent}28` : theme.isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
          border: `1px solid ${value ? `${theme.accent}50` : theme.cardBorder}`,
          boxShadow: value && theme.isDark ? `0 0 10px ${theme.accent}30` : 'none',
        }}
      >
        <motion.div
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full"
          style={{
            background: value ? theme.accent : theme.isDark ? '#475569' : '#9ca3af',
            boxShadow: value && theme.isDark ? `0 0 6px ${theme.accent}` : 'none',
          }}
        />
      </button>
    </div>
  )
}

const TextSetting = ({ label, value, onChange, placeholder, hint }) => {
  const { theme } = useTheme()
  return (
    <div className="py-3">
      <p className="text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>{label}</p>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none"
        style={{
          background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
          color: theme.textPrimary,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = theme.inputFocusBorder; e.target.style.boxShadow = `0 0 0 3px ${theme.inputFocusShadow}` }}
        onBlur={e => { e.target.style.borderColor = theme.inputBorder; e.target.style.boxShadow = 'none' }}
      />
      {hint && <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{hint}</p>}
    </div>
  )
}

const Divider = () => {
  const { theme } = useTheme()
  return <div style={{ borderTop: `1px solid ${theme.cardBorder}` }} />
}

const SectionCard = ({ icon: Icon, iconColor, title, subtitle, children }) => {
  const { theme } = useTheme()
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${iconColor}12`, border: `1px solid ${iconColor}28` }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>{title}</h2>
          <p className="text-xs" style={{ color: theme.textMuted }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </GlassCard>
  )
}

const SettingsPage = () => {
  const { theme } = useTheme()
  const [s, setS] = useState({
    backendUrl: 'http://localhost:8000',
    l1Enabled: true, l2Enabled: true, l3Enabled: true,
    l1MaxSize: '500', l2TTL: '3600', l3TTL: '86400',
    urlModelEnabled: true, emailModelEnabled: true,
    confidenceThreshold: '0.7',
    autoRefresh: true, refreshInterval: '30', showDemoData: true,
  })
  const set = key => val => setS(p => ({ ...p, [key]: val }))
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display" style={{ color: theme.textPrimary }}>Settings</h1>
        <p className="text-sm mt-1 font-body" style={{ color: theme.textMuted }}>Configure the platform and API connections</p>
      </div>

      <SectionCard icon={Server} iconColor={theme.accent} title="API Configuration" subtitle="FastAPI backend connection settings">
        <TextSetting label="Backend URL" value={s.backendUrl} onChange={set('backendUrl')}
          placeholder="http://localhost:8000" hint="Base URL of your FastAPI backend." />
        <Divider />
        <TextSetting label="Confidence Threshold" value={s.confidenceThreshold} onChange={set('confidenceThreshold')}
          placeholder="0.7" hint="Minimum confidence to classify a scan as malicious (0.0–1.0)" />
      </SectionCard>

      <SectionCard icon={Database} iconColor={theme.safe} title="Cache Configuration" subtitle="Multi-layer caching system settings">
        <Toggle label="L1 Cache (Memory)" description="In-process Python dictionary — fastest layer" value={s.l1Enabled} onChange={set('l1Enabled')} />
        <Divider />
        <TextSetting label="L1 Max Size" value={s.l1MaxSize} onChange={set('l1MaxSize')} hint="Maximum entries before LRU eviction" />
        <Divider />
        <Toggle label="L2 Cache (Redis)" description="Redis in-memory store with TTL expiry" value={s.l2Enabled} onChange={set('l2Enabled')} />
        <Divider />
        <TextSetting label="L2 TTL (seconds)" value={s.l2TTL} onChange={set('l2TTL')} hint="Default: 3600 (1 hour)" />
        <Divider />
        <Toggle label="L3 Cache (MongoDB)" description="Persistent document store with long TTL" value={s.l3Enabled} onChange={set('l3Enabled')} />
        <Divider />
        <TextSetting label="L3 TTL (seconds)" value={s.l3TTL} onChange={set('l3TTL')} hint="Default: 86400 (24 hours)" />
      </SectionCard>

      <SectionCard icon={Zap} iconColor={theme.danger} title="ML Model Settings" subtitle="Threat detection model configuration">
        <Toggle label="URL Threat Model" description="Random Forest classifier — phishing/malware detection" value={s.urlModelEnabled} onChange={set('urlModelEnabled')} />
        <Divider />
        <Toggle label="Email Spam Model" description="Naive Bayes + TF-IDF — spam/phishing detection" value={s.emailModelEnabled} onChange={set('emailModelEnabled')} />
      </SectionCard>

      <SectionCard icon={Shield} iconColor={theme.warning} title="Dashboard Settings" subtitle="UI and display preferences">
        <Toggle label="Auto-refresh Dashboard" description="Automatically reload stats from the API" value={s.autoRefresh} onChange={set('autoRefresh')} />
        <Divider />
        <TextSetting label="Refresh Interval (seconds)" value={s.refreshInterval} onChange={set('refreshInterval')} hint="How often to poll the /stats endpoint" />
        <Divider />
        <Toggle label="Show Demo Data on Error" description="Display fallback data when the backend is offline" value={s.showDemoData} onChange={set('showDemoData')} />
      </SectionCard>

      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
          <AlertCircle size={12} />
          Changes require a page reload to take full effect
        </div>
        <GlowButton onClick={handleSave}>
          {saved ? '✓ Saved!' : <><Save size={14} className="inline mr-1.5" />Save Settings</>}
        </GlowButton>
      </div>
    </motion.div>
  )
}

export default SettingsPage
