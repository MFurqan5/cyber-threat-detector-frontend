import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Globe, Mail, Search, RefreshCw,
  ChevronDown, Filter, Download, FileText,
  FileSpreadsheet, Calendar, X,
} from 'lucide-react'
import { getHistory } from '../services/api'
import { GlassCard, StatusPill, SecondaryButton } from '../components/ui/UIComponents'
import { useTheme } from '../context/ThemeContext'

// ─── Export utilities ─────────────────────────────────────────────────────────
const exportToPDF = async (rows) => {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  // Header
  doc.setFillColor(7, 17, 31)
  doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F')
  doc.setTextColor(76, 201, 240)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CyberGuard AI — Scan History Report', 40, 32)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString()}  ·  Total records: ${rows.length}`, 40, 44)

  autoTable(doc, {
    startY: 60,
    head: [['Timestamp', 'Type', 'Status', 'Threat Type', 'Confidence', 'Input']],
    body: rows.map(r => [
      r.timestamp,
      r.input_type?.toUpperCase(),
      r.status?.toUpperCase(),
      r.threat_type,
      `${Math.round(r.confidence_score * 100)}%`,
      r.input_value?.slice(0, 60) + (r.input_value?.length > 60 ? '…' : ''),
    ]),
    headStyles: { fillColor: [11, 16, 32], textColor: [76, 201, 240], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 247, 255] },
    columnStyles: {
      0: { cellWidth: 120 }, 1: { cellWidth: 55 }, 2: { cellWidth: 75 },
      3: { cellWidth: 80 }, 4: { cellWidth: 70 }, 5: { cellWidth: 'auto' },
    },
    styles: { cellPadding: 5, lineColor: [229, 231, 235], lineWidth: 0.5 },
    margin: { left: 40, right: 40 },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Page ${i} of ${pageCount}  ·  CyberGuard AI Threat Detector`, 40, doc.internal.pageSize.height - 20)
  }

  doc.save(`cyberguard-scan-history-${Date.now()}.pdf`)
}

const exportToExcel = async (rows) => {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows.map(r => ({
    Timestamp: r.timestamp,
    'Input Type': r.input_type?.toUpperCase(),
    Status: r.status?.toUpperCase(),
    'Threat Type': r.threat_type,
    'Confidence Score': `${Math.round(r.confidence_score * 100)}%`,
    Input: r.input_value,
  })))

  // Column widths
  ws['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 50 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Scan History')
  XLSX.writeFile(wb, `cyberguard-scan-history-${Date.now()}.xlsx`)
}

// ─── Date range picker ────────────────────────────────────────────────────────
const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange, onClear, theme }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="flex items-center gap-2">
      <Calendar size={14} style={{ color: theme.textMuted }} />
      <span className="text-xs font-medium" style={{ color: theme.textMuted }}>From:</span>
      <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)}
        className="text-xs px-3 py-1.5 rounded-lg border outline-none"
        style={{
          background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
          color: theme.textPrimary, colorScheme: theme.isDark ? 'dark' : 'light',
        }} />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: theme.textMuted }}>To:</span>
      <input type="date" value={endDate} onChange={e => onEndChange(e.target.value)}
        className="text-xs px-3 py-1.5 rounded-lg border outline-none"
        style={{
          background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
          color: theme.textPrimary, colorScheme: theme.isDark ? 'dark' : 'light',
        }} />
    </div>
    {(startDate || endDate) && (
      <button onClick={onClear}
        className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-opacity hover:opacity-70"
        style={{ color: theme.textMuted, background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}` }}>
        <X size={11} /> Clear
      </button>
    )}
  </div>
)

// ─── Generate fallback data ───────────────────────────────────────────────────
const generateFallback = () => {
  const types = ['url', 'email']
  const statuses = ['safe', 'malicious', 'malicious', 'safe', 'safe']
  const threatByStatus = { safe: 'clean', malicious: 'phishing' }
  const emailThreats = ['spam', 'phishing', 'clean', 'clean', 'spam']
  const now = new Date()

  return Array.from({ length: 40 }, (_, i) => {
    const type = types[i % 2]
    const status = statuses[i % 5]
    const d = new Date(now - i * 9 * 60000)
    return {
      id: i + 1,
      timestamp: d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      _date: d,
      input_type: type,
      status,
      threat_type: type === 'url' ? threatByStatus[status] : emailThreats[i % 5],
      confidence_score: 0.72 + Math.random() * 0.27,
      input_value: type === 'url'
        ? (status === 'malicious' ? `https://suspicious-${['login','verify','secure'][i % 3]}-${i}.${['ru','tk','xyz'][i % 3]}/` : `https://legitimate-site-${i}.com/`)
        : `Email body sample #${i + 1}`,
    }
  })
}

const FILTERS = ['All', 'URL', 'Email', 'Safe', 'Malicious']
const PER_PAGE = 15

// ─── Main component ───────────────────────────────────────────────────────────
const ScanHistory = () => {
  const { theme } = useTheme()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exporting, setExporting] = useState(null) // 'pdf' | 'excel' | null

  const load = async () => {
    setLoading(true)
    try {
      const data = await getHistory(100, 0)
      setRecords((data.records || data).map(r => ({ ...r, _date: new Date(r.timestamp) })))
    } catch (err) {
      setError(err.message)
      setRecords(generateFallback())
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Filtered + sorted records
  const filtered = useMemo(() => {
    return records
      .filter(r => {
        if (activeFilter === 'URL') return r.input_type === 'url'
        if (activeFilter === 'Email') return r.input_type === 'email'
        if (activeFilter === 'Safe') return r.status === 'safe'
        if (activeFilter === 'Malicious') return r.status === 'malicious'
        return true
      })
      .filter(r => {
        if (!search) return true
        const s = search.toLowerCase()
        return r.input_value?.toLowerCase().includes(s) ||
          r.status?.toLowerCase().includes(s) ||
          r.threat_type?.toLowerCase().includes(s) ||
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
      .sort((a, b) => sortOrder === 'desc' ? b.id - a.id : a.id - b.id)
  }, [records, activeFilter, search, startDate, endDate, sortOrder])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = useMemo(() => ({
    total: records.length,
    safe: records.filter(r => r.status === 'safe').length,
    malicious: records.filter(r => r.status === 'malicious').length,
    urls: records.filter(r => r.input_type === 'url').length,
    emails: records.filter(r => r.input_type === 'email').length,
  }), [records])

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
              ⚠ Backend offline — showing demo data
            </div>
          )}
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-70"
          style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary,
            boxShadow: theme.cardShadow }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Scans', value: stats.total, color: theme.accent },
          { label: 'Safe', value: stats.safe, color: theme.safe },
          { label: 'Malicious', value: stats.malicious, color: theme.danger },
          { label: 'URL Scans', value: stats.urls, color: theme.accent },
          { label: 'Email Scans', value: stats.emails, color: theme.warning },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-3 text-center"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
            <p className="text-lg font-bold font-display" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Export + Date Range panel */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3">
          {/* Row 1: Date range */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}28` }}>
                <Calendar size={13} style={{ color: theme.accent }} />
              </div>
              <span className="text-sm font-semibold font-display" style={{ color: theme.textPrimary }}>
                Export Records
              </span>
              {(startDate || endDate) && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${theme.accent}12`, color: theme.accent, border: `1px solid ${theme.accent}28` }}>
                  {filtered.length} matching
                </span>
              )}
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleExportPDF}
                disabled={exporting === 'pdf' || filtered.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: theme.isDark ? `${theme.danger}14` : '#fff1f2',
                  border: `1px solid ${theme.isDark ? `${theme.danger}35` : '#fecaca'}`,
                  color: theme.danger,
                  boxShadow: theme.isDark ? `0 0 16px ${theme.danger}12` : '0 1px 4px rgba(220,38,38,0.1)',
                }}>
                {exporting === 'pdf'
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent"
                      style={{ borderTopColor: theme.danger, animation: 'spin 0.8s linear infinite' }} />
                  : <FileText size={15} />}
                Export PDF
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleExportExcel}
                disabled={exporting === 'excel' || filtered.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: theme.isDark ? `${theme.safe}12` : '#f0fdf4',
                  border: `1px solid ${theme.isDark ? `${theme.safe}30` : '#bbf7d0'}`,
                  color: theme.safe,
                  boxShadow: theme.isDark ? `0 0 16px ${theme.safe}10` : '0 1px 4px rgba(5,150,105,0.1)',
                }}>
                {exporting === 'excel'
                  ? <div className="w-4 h-4 rounded-full border-2 border-transparent"
                      style={{ borderTopColor: theme.safe, animation: 'spin 0.8s linear infinite' }} />
                  : <FileSpreadsheet size={15} />}
                Export Excel
              </motion.button>
            </div>
          </div>

          {/* Row 2: Date pickers */}
          <DateRangePicker
            startDate={startDate} endDate={endDate}
            onStartChange={(v) => { setStartDate(v); setPage(1) }}
            onEndChange={(v) => { setEndDate(v); setPage(1) }}
            onClear={() => { setStartDate(''); setEndDate(''); setPage(1) }}
            theme={theme}
          />

          {(startDate || endDate) && (
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Showing <span className="font-semibold" style={{ color: theme.accent }}>{filtered.length}</span> records in selected range.
              Export will include only these records.
            </p>
          )}
        </div>
      </GlassCard>

      {/* Filter + Search bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
            <input type="text" placeholder="Search by URL, status, threat type..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-8 pr-4 py-2 rounded-xl text-xs outline-none"
              style={{
                background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                color: theme.textPrimary,
              }} />
          </div>

          <button onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-70 shrink-0"
            style={{ background: theme.surfaceBg, border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
            <ChevronDown size={13} style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
          <span>Input</span>
        </div>

        {/* Rows */}
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
              <p className="text-sm">No records found</p>
            </div>
          ) : (
            <AnimatePresence>
              {paged.map((record, i) => (
                <motion.div key={record.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.025 }}
                  className="grid gap-4 px-5 py-3.5 items-center group cursor-default"
                  style={{
                    gridTemplateColumns: '155px 75px 105px 120px 95px 1fr',
                    borderBottom: `1px solid ${theme.tableRowBorder}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.tableRowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>{record.timestamp}</span>

                  <div className="flex items-center gap-1.5">
                    {record.input_type === 'url'
                      ? <Globe size={12} style={{ color: theme.accent }} />
                      : <Mail size={12} style={{ color: theme.warning }} />}
                    <span className="text-xs uppercase" style={{ color: theme.textSecondary }}>{record.input_type}</span>
                  </div>

                  <StatusPill status={record.status} />

                  <span className="text-xs capitalize" style={{ color: theme.textSecondary }}>{record.threat_type}</span>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${theme.cardBorder}` }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(record.confidence_score * 100)}%`,
                          background: record.status === 'malicious' ? theme.danger : theme.safe,
                        }} />
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
