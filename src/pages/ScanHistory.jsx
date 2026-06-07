import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Globe, Mail, Search, RefreshCw,
  ChevronDown, Filter, FileText, FileSpreadsheet,
  Calendar, X, Package, UserX,
} from 'lucide-react'
import { getHistory, getMyHistory, getDashboardStats } from '../services/api'
import { GlassCard, StatusPill } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useGuestScan } from '../context/GuestScanContext'

// ─── PDF Export — light theme style ──────────────────────────────────────────
const exportToPDF = async (rows) => {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.width
  const H = doc.internal.pageSize.height

  // ── Header bar — white with purple left accent ──
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, 56, 'F')

  // Purple left accent strip
  doc.setFillColor(124, 58, 237)
  doc.rect(0, 0, 5, 56, 'F')

  // Logo area — purple circle
  doc.setFillColor(237, 233, 254)
  doc.roundedRect(18, 10, 36, 36, 6, 6, 'F')
  doc.setTextColor(124, 58, 237)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CG', 36, 33, { align: 'center' })

  // Title
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('CyberSentinel AI — Scan History Report', 64, 26)

  doc.setTextColor(107, 114, 128)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString()}   ·   Total records: ${rows.length}`, 64, 40)

  // Thin purple divider under header
  doc.setDrawColor(221, 214, 254)
  doc.setLineWidth(0.5)
  doc.line(0, 56, W, 56)

  // ── Summary pills ──
  const stats = {
    safe:      rows.filter(r => r.status === 'safe').length,
    malicious: rows.filter(r => r.status === 'malicious').length,
    urls:      rows.filter(r => r.input_type === 'url').length,
    emails:    rows.filter(r => r.input_type === 'email').length,
    apps:      rows.filter(r => r.input_type === 'app').length,
  }

  const pills = [
    { label: 'Total',     value: rows.length,       fill: [240, 235, 255], text: [124, 58, 237]  },
    { label: 'Safe',      value: stats.safe,         fill: [240, 253, 244], text: [5,  150, 105]  },
    { label: 'Malicious', value: stats.malicious,    fill: [255, 241, 242], text: [220, 38,  38]  },
    { label: 'URLs',      value: stats.urls,         fill: [239, 246, 255], text: [59,  130, 246] },
    { label: 'Emails',    value: stats.emails,       fill: [255, 251, 235], text: [217, 119, 6]   },
    { label: 'Apps',      value: stats.apps,         fill: [240, 235, 255], text: [124, 58, 237]  },
  ]

  let px = 18
  pills.forEach(({ label, value, fill, text }) => {
    const w = 68
    doc.setFillColor(...fill)
    doc.roundedRect(px, 64, w, 22, 4, 4, 'F')
    doc.setTextColor(...text)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(`${value}`, px + w / 2, 73, { align: 'center' })
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.text(label, px + w / 2, 81, { align: 'center' })
    px += w + 6
  })

  // ── Table ──
  autoTable(doc, {
    startY: 94,
    head: [['Timestamp', 'Type', 'Status', 'Threat Type', 'Confidence', 'Input / Value']],
    body: rows.map(r => [
      r.timestamp,
      r.input_type?.toUpperCase(),
      r.status?.toUpperCase(),
      r.threat_type || '—',
      `${Math.round(r.confidence_score * 100)}%`,
      (r.input_value || '').slice(0, 65) + ((r.input_value || '').length > 65 ? '…' : ''),
    ]),
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 6, bottom: 6, left: 6, right: 4 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81],
      cellPadding: { top: 5, bottom: 5, left: 6, right: 4 },
    },
    alternateRowStyles: { fillColor: [250, 248, 255] },
    columnStyles: {
      0: { cellWidth: 108 },
      1: { cellWidth: 48, halign: 'center' },
      2: { cellWidth: 68, halign: 'center' },
      3: { cellWidth: 80 },
      4: { cellWidth: 62, halign: 'center' },
      5: { cellWidth: 'auto' },
    },
    styles: {
      lineColor: [237, 233, 254],
      lineWidth: 0.4,
      font: 'helvetica',
    },
    margin: { left: 18, right: 18 },
    // Color Status column cells
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const val = data.cell.raw?.toString().toLowerCase()
        if (val === 'safe')      { data.cell.styles.textColor = [5, 150, 105];  data.cell.styles.fontStyle = 'bold' }
        if (val === 'malicious') { data.cell.styles.textColor = [220, 38, 38];  data.cell.styles.fontStyle = 'bold' }
        if (val === 'spam')      { data.cell.styles.textColor = [217, 119, 6];  data.cell.styles.fontStyle = 'bold' }
      }
    },
  })

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(221, 214, 254)
    doc.setLineWidth(0.4)
    doc.line(18, H - 28, W - 18, H - 28)
    doc.setFontSize(7.5)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.text('CyberSentinel AI Threat Detection Platform', 18, H - 16)
    doc.text(`Page ${i} of ${pageCount}`, W - 18, H - 16, { align: 'right' })
  }

  doc.save(`cybersentinel-scan-history-${Date.now()}.pdf`)
}

// ─── Excel Export ─────────────────────────────────────────────────────────────
const exportToExcel = async (rows) => {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows.map(r => ({
    Timestamp:        r.timestamp,
    'Input Type':     r.input_type?.toUpperCase(),
    Status:           r.status?.toUpperCase(),
    'Threat Type':    r.threat_type || '—',
    'Confidence Score': `${Math.round(r.confidence_score * 100)}%`,
    Input:            r.input_value,
  })))
  ws['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 55 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Scan History')
  XLSX.writeFile(wb, `cybersentinel-scan-history-${Date.now()}.xlsx`)
}

// ─── Date range picker ────────────────────────────────────────────────────────
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange, onClear, theme }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="flex items-center gap-2">
      <Calendar size={14} style={{ color: theme.textMuted }} />
      <span className="text-xs font-medium" style={{ color: theme.textMuted }}>From:</span>
      <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)}
        className="text-xs px-3 py-1.5 rounded-lg outline-none"
        style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary, colorScheme: theme.isDark ? 'dark' : 'light' }} />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: theme.textMuted }}>To:</span>
      <input type="date" value={endDate} onChange={e => onEndChange(e.target.value)}
        className="text-xs px-3 py-1.5 rounded-lg outline-none"
        style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary, colorScheme: theme.isDark ? 'dark' : 'light' }} />
    </div>
    {(startDate || endDate) && (
      <button onClick={onClear}
        className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg hover:opacity-70 transition-opacity"
        style={{ color: theme.textMuted, background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
        <X size={11} /> Clear
      </button>
    )}
  </div>
)

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'URL', 'Email', 'App', 'Safe', 'Malicious']
const PER_PAGE = 15

// ─── Type icon helper ─────────────────────────────────────────────────────────
const TypeIcon = ({ type, theme }) => {
  if (type === 'url')   return <Globe   size={12} style={{ color: theme.accent   }} />
  if (type === 'email') return <Mail    size={12} style={{ color: theme.warning  }} />
  if (type === 'app')   return <Package size={12} style={{ color: '#a78bfa'       }} />
  return null
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ScanHistory = () => {
  const { theme } = useTheme()
  const { user, guest } = useAuth()
  const { guestScans } = useGuestScan()
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('desc')   // 'desc' = newest first
  const [page, setPage]           = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [exporting, setExporting] = useState(null)
  const [serverStats, setServerStats] = useState(null)

  const load = async () => {
    setLoading(true)

    // Guest mode: use only scans performed in this session — no API call
    if (guest) {
      const mapped = guestScans.map((s, i) => ({
        id: s.id || i,
        timestamp: s.timestamp || '',
        _date: s.timestamp ? new Date(s.timestamp) : new Date(),
        input_type: s.type || 'url',
        status: s.status || 'safe',
        threat_type: s.threat_type || 'clean',
        confidence_score: s.confidence_score ?? 0,
        input_value: s.input_value || '',
      }))
      setRecords(mapped)
      setError(null)
      setLoading(false)
      return
    }

    // Authenticated users: fetch from API using JWT token
    try {
      const [historyData, statsData] = await Promise.all([
        getMyHistory(100, 0),
        getDashboardStats(720)
      ]).catch(err => { throw err })
      
      const rawRecords = historyData.records || historyData.scans || (Array.isArray(historyData) ? historyData : [])
      const mappedRecords = rawRecords.map(r => ({
        id: r.id,
        timestamp: r.timestamp || '',
        _date: r.timestamp ? new Date(r.timestamp) : new Date(),
        input_type: r.type || r.input_type || 'url',
        status: r.prediction || r.status || 'safe',
        threat_type: r.threat_type || 'clean',
        confidence_score: r.confidence !== undefined ? r.confidence : (r.confidence_score !== undefined ? r.confidence_score : 0),
        input_value: r.input || r.input_value || '',
      }))
      setRecords(mappedRecords)
      
      // Update true stats using the dashboard summary
      const sData = statsData.data || statsData
      if (sData) {
        setServerStats(sData)
      } else {
        // Fallback to the true total if the summary endpoint failed
        setServerStats({ total_scans: historyData.total || mappedRecords.length })
      }
      setError(null)
    } catch (err) {
      setError(err.message)
      setRecords([])  // empty — no fake fallback data
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user, guest, guestScans])

  const filtered = useMemo(() => {
    return records
      .filter(r => {
        if (activeFilter === 'URL')       return r.input_type === 'url'
        if (activeFilter === 'Email')     return r.input_type === 'email'
        if (activeFilter === 'App')       return r.input_type === 'app'
        if (activeFilter === 'Safe')      return r.status === 'safe'
        if (activeFilter === 'Malicious') return r.status === 'malicious'
        return true
      })
      .filter(r => {
        if (!search) return true
        const s = search.toLowerCase()
        return r.input_value?.toLowerCase().includes(s)  ||
               r.status?.toLowerCase().includes(s)       ||
               r.threat_type?.toLowerCase().includes(s)  ||
               r.input_type?.toLowerCase().includes(s)
      })
      .filter(r => {
        if (startDate) {
          const sd = new Date(startDate); sd.setHours(0, 0, 0, 0)
          if (r._date < sd) return false
        }
        if (endDate) {
          const ed = new Date(endDate); ed.setHours(23, 59, 59, 999)
          if (r._date > ed) return false
        }
        return true
      })
      // Sort by real timestamp (_date), not by id
      .sort((a, b) => sortOrder === 'desc' ? b._date - a._date : a._date - b._date)
  }, [records, activeFilter, search, startDate, endDate, sortOrder])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = useMemo(() => {
    if (serverStats && !guest) {
      return {
        total:     serverStats.total_scans || records.length,
        safe:      serverStats.safe_requests || records.filter(r => r.status === 'safe').length,
        malicious: serverStats.malicious_total || records.filter(r => r.status === 'malicious').length,
        urls:      serverStats.by_type?.url || records.filter(r => r.input_type === 'url').length,
        emails:    serverStats.by_type?.email || records.filter(r => r.input_type === 'email').length,
        apps:      serverStats.by_type?.app || records.filter(r => r.input_type === 'app').length,
      }
    }
    return {
      total:     records.length,
      safe:      records.filter(r => r.status === 'safe').length,
      malicious: records.filter(r => r.status === 'malicious').length,
      urls:      records.filter(r => r.input_type === 'url').length,
      emails:    records.filter(r => r.input_type === 'email').length,
      apps:      records.filter(r => r.input_type === 'app').length,
    }
  }, [records, serverStats, guest])

  const handleExportPDF = async () => {
    setExporting('pdf')
    try { await exportToPDF(filtered) } catch (e) { console.error(e) } finally { setExporting(null) }
  }

  const handleExportExcel = async () => {
    setExporting('excel')
    try { await exportToExcel(filtered) } catch (e) { console.error(e) } finally { setExporting(null) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: theme.textPrimary }}>Scan History</h1>
          <p className="text-sm mt-1 font-body" style={{ color: theme.textMuted }}>
            Complete audit trail of all threat detection scans
          </p>
          {error && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: `${theme.warning}10`, border: `1px solid ${theme.warning}28`, color: theme.warning }}>
              ⚠ Backend offline — showing empty history
            </div>
          )}
          {guest && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: `${theme.accent}10`, border: `1px solid ${theme.accent}28`, color: theme.accent }}>
              <UserX size={12} /> Guest mode — only your session scans are shown
            </div>
          )}
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-70"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary, boxShadow: theme.cardShadow }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Quick stats — now includes Apps */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total Scans',  value: stats.total,     color: theme.accent   },
          { label: 'Safe',         value: stats.safe,      color: theme.safe     },
          { label: 'Malicious',    value: stats.malicious, color: theme.danger   },
          { label: 'URL Scans',    value: stats.urls,      color: theme.accent   },
          { label: 'Email Scans',  value: stats.emails,    color: theme.warning  },
          { label: 'App Checks',   value: stats.apps,      color: '#a78bfa'      },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl p-3 text-center"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
            <p className="text-lg font-bold font-display" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Export + Date Range */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}28` }}>
                <Calendar size={13} style={{ color: theme.accent }} />
              </div>
              <span className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>Export Records</span>
              {(startDate || endDate) && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}28` }}>
                  {filtered.length} matching
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleExportPDF}
                disabled={exporting === 'pdf' || filtered.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: theme.isDark ? `${theme.danger}14` : '#fff1f2', border: `1px solid ${theme.isDark ? `${theme.danger}35` : '#fecaca'}`, color: theme.danger }}>
                {exporting === 'pdf'
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor: theme.danger, animation: 'spin 0.8s linear infinite' }} />
                  : <FileText size={15} />}
                Export PDF
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleExportExcel}
                disabled={exporting === 'excel' || filtered.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: theme.isDark ? `${theme.safe}12` : '#f0fdf4', border: `1px solid ${theme.isDark ? `${theme.safe}30` : '#bbf7d0'}`, color: theme.safe }}>
                {exporting === 'excel'
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent" style={{ borderTopColor: theme.safe, animation: 'spin 0.8s linear infinite' }} />
                  : <FileSpreadsheet size={15} />}
                Export Excel
              </motion.button>
            </div>
          </div>

          <DateRangePicker
            startDate={startDate} endDate={endDate}
            onStartChange={v => { setStartDate(v); setPage(1) }}
            onEndChange={v => { setEndDate(v); setPage(1) }}
            onClear={() => { setStartDate(''); setEndDate(''); setPage(1) }}
            theme={theme}
          />

          {(startDate || endDate) && (
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Showing <span className="font-semibold" style={{ color: theme.accent }}>{filtered.length}</span> records in range. Export includes only these.
            </p>
          )}
        </div>
      </GlassCard>

      {/* Filter + Search + Sort */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Filter pills — includes App */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={13} style={{ color: theme.textMuted }} className="shrink-0" />
            {FILTERS.map(f => (
              <button key={f} onClick={() => { setActiveFilter(f); setPage(1) }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: activeFilter === f ? `${theme.accent}15` : theme.surfaceBg,
                  border: `1px solid ${activeFilter === f ? `${theme.accent}45` : theme.cardBorder}`,
                  color: activeFilter === f ? theme.accent : theme.textMuted,
                }}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
            <input type="text" placeholder="Search by input, status, threat type, app name..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-4 py-2 rounded-xl text-xs outline-none"
              style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.textPrimary }} />
          </div>

          {/* Sort by timestamp */}
          <button onClick={() => { setSortOrder(p => p === 'desc' ? 'asc' : 'desc'); setPage(1) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-70 shrink-0"
            style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
            <ChevronDown size={13}
              style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {/* Sticky header */}
        <div className="grid gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider sticky top-0 z-10"
          style={{
            gridTemplateColumns: '155px 75px 105px 120px 95px 1fr',
            borderBottom: `1px solid ${theme.cardBorder}`,
            background: theme.tableHeaderBg,
            color: theme.textMuted,
          }}>
          <span>Timestamp</span>
          <span>Type</span>
          <span>Status</span>
          <span>Threat Type</span>
          <span>Confidence</span>
          <span>Input / App Name</span>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full border-2 border-transparent mx-auto mb-3"
                  style={{ borderTopColor: theme.accent, animation: 'spin 0.8s linear infinite' }} />
                <p className="text-xs" style={{ color: theme.textMuted }}>Loading scan history...</p>
              </div>
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16" style={{ color: theme.textMuted }}>
              <History size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                {guest ? 'No scans yet this session' : 'No records found'}
              </p>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                {guest ? 'Run a scan and your history will appear here.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {paged.map((record, i) => (
                <motion.div key={record.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="grid gap-4 px-5 py-3.5 items-center cursor-default"
                  style={{ gridTemplateColumns: '155px 75px 105px 120px 95px 1fr', borderBottom: `1px solid ${theme.tableRowBorder}` }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.tableRowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>{record.timestamp}</span>

                  <div className="flex items-center gap-1.5">
                    <TypeIcon type={record.input_type} theme={theme} />
                    <span className="text-xs uppercase" style={{ color: theme.textSecondary }}>{record.input_type}</span>
                  </div>

                  <StatusPill status={record.status} />

                  <span className="text-xs capitalize" style={{ color: theme.textSecondary }}>{record.threat_type}</span>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: theme.cardBorder }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.round(record.confidence_score * 100)}%`, background: record.status === 'malicious' ? theme.danger : theme.safe }} />
                    </div>
                    <span className="text-xs tabular-nums w-8 text-right" style={{ color: theme.textSecondary }}>
                      {Math.round(record.confidence_score * 100)}%
                    </span>
                  </div>

                  <span className="text-xs font-mono truncate" style={{ color: theme.textMuted }}>{record.input_value}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </GlassCard>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: theme.textMuted }}>
            Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: page === p ? `${theme.accent}15` : theme.cardBg,
                  border: `1px solid ${page === p ? `${theme.accent}40` : theme.cardBorder}`,
                  color: page === p ? theme.accent : theme.textMuted,
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ScanHistory
