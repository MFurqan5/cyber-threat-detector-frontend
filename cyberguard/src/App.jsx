import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import URLScanner from './pages/URLScanner'
import EmailScanner from './pages/EmailScanner'
import CacheAnalytics from './pages/CacheAnalytics'
import ScanHistory from './pages/ScanHistory'
import Settings from './pages/Settings'

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="url-scanner" element={<URLScanner />} />
          <Route path="email-scanner" element={<EmailScanner />} />
          <Route path="cache" element={<CacheAnalytics />} />
          <Route path="history" element={<ScanHistory />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
