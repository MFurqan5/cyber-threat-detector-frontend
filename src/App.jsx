import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import URLScanner from './pages/URLScanner'
import EmailScanner from './pages/EmailScanner'
import CacheAnalytics from './pages/CacheAnalytics'
import ScanHistory from './pages/ScanHistory'
import Settings from './pages/Settings'
import MalwareScanner from './pages/MalwareScanner'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ToastContainer from './components/ui/ToastContainer'

/** Allow through if authenticated OR in guest mode */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, guest } = useAuth()
  return (isLoggedIn || guest) ? children : <Navigate to="/login" replace />
}

/** Block guests from scan history */
const AuthOnlyRoute = ({ children }) => {
  const { isLoggedIn, guest } = useAuth()
  if (guest) return <Navigate to="/dashboard" replace />
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const App = () => (
  <ThemeProvider>
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            {/* Landing page — first thing user sees */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin — completely separate, no sidebar */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Main app */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="url-scanner" element={<URLScanner />} />
              <Route path="email-scanner" element={<EmailScanner />} />
              <Route path="malware-scanner" element={<MalwareScanner />} />
              <Route path="cache" element={<CacheAnalytics />} />
              <Route path="settings" element={<Settings />} />
              {/* Scan History: authenticated users only, guests are redirected */}
              <Route path="history" element={
                <ProtectedRoute><ScanHistory /></ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  </ThemeProvider>
)

export default App