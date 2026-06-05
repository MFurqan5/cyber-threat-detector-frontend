import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'

const GuestScanContext = createContext()
export const useGuestScan = () => useContext(GuestScanContext)

// ── Constants ──────────────────────────────────────────────────────────────────
export const GUEST_SCAN_LIMIT = 5

// ── Provider ───────────────────────────────────────────────────────────────────
export const GuestScanProvider = ({ children }) => {
  const [guestScans, setGuestScans] = useState([])

  // ── Add a scan result ────────────────────────────────────────────────────────
  const addGuestScan = useCallback((scanResult) => {
    setGuestScans(prev => {
      if (prev.length >= GUEST_SCAN_LIMIT) return prev
      const entry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
        type: scanResult.type || 'url',
        status: scanResult.prediction_label || scanResult.verdict || 'safe',
        threat_type: scanResult.threat_type || 'clean',
        confidence_score: scanResult.confidence_score ?? scanResult.confidence ?? 0.9,
        from_cache: scanResult.from_cache || 'none',
        cache_records: scanResult.cache_records || 0,
      }
      return [...prev, entry]
    })
  }, [])

  const canScan = guestScans.length < GUEST_SCAN_LIMIT
  const remainingScans = GUEST_SCAN_LIMIT - guestScans.length

  // ── Derive dashboard stats from actual guest scans ───────────────────────────
  const guestStats = useMemo(() => {
    const total = guestScans.length
    if (total === 0) return null // signals "empty state" to Dashboard

    const threats = guestScans.filter(s =>
      s.status === 'malicious' || s.status === 'spam' || s.status === 'phishing'
    ).length
    const safe = total - threats

    // Build scan_activity from timestamps (group by hour)
    const hourMap = {}
    guestScans.forEach(s => {
      const hour = s.timestamp.split(' ')[1]?.substring(0, 5) || '00:00'
      if (!hourMap[hour]) hourMap[hour] = { hour, scans: 0, threats: 0 }
      hourMap[hour].scans += 1
      if (s.status === 'malicious' || s.status === 'spam' || s.status === 'phishing') {
        hourMap[hour].threats += 1
      }
    })
    const scan_activity = Object.values(hourMap).sort((a, b) => a.hour.localeCompare(b.hour))

    // Threat distribution
    const distMap = {}
    guestScans.forEach(s => {
      const name = (s.threat_type || 'clean').charAt(0).toUpperCase() + (s.threat_type || 'clean').slice(1)
      distMap[name] = (distMap[name] || 0) + 1
    })
    const threat_distribution = Object.entries(distMap).map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
    }))

    // Cache performance (derive from scan from_cache fields)
    const cacheHits = { l1: 0, l2: 0, l3: 0 }
    const cacheMisses = { l1: 0, l2: 0, l3: 0 }
    guestScans.forEach(s => {
      if (s.from_cache === 'L1') cacheHits.l1++
      else cacheMisses.l1++
      if (s.from_cache === 'L2') cacheHits.l2++
      else cacheMisses.l2++
      if (s.from_cache === 'L3') cacheHits.l3++
      else cacheMisses.l3++
    })
    const cacheRate = (h, m) => (h + m) > 0 ? h / (h + m) : 0
    const totalCacheRecords = guestScans.reduce((sum, s) => sum + (s.cache_records || 0), 0)

    return {
      total_scans: total,
      threats_detected: threats,
      safe_requests: safe,
      cache_entries_analyzed: totalCacheRecords,
      cache_hit_rate: cacheRate(
        cacheHits.l1 + cacheHits.l2 + cacheHits.l3,
        cacheMisses.l1 + cacheMisses.l2 + cacheMisses.l3
      ),
      scan_activity,
      threat_distribution,
      cache: {
        l1: { hit_rate: cacheRate(cacheHits.l1, cacheMisses.l1), hits: cacheHits.l1, misses: cacheMisses.l1 },
        l2: { hit_rate: cacheRate(cacheHits.l2, cacheMisses.l2), hits: cacheHits.l2, misses: cacheMisses.l2 },
        l3: { hit_rate: cacheRate(cacheHits.l3, cacheMisses.l3), hits: cacheHits.l3, misses: cacheMisses.l3 },
      },
      recent_scans: [...guestScans].reverse().slice(0, 5),
    }
  }, [guestScans])

  return (
    <GuestScanContext.Provider value={{
      guestScans,
      guestStats,
      addGuestScan,
      canScan,
      remainingScans,
      scanCount: guestScans.length,
    }}>
      {children}
    </GuestScanContext.Provider>
  )
}
