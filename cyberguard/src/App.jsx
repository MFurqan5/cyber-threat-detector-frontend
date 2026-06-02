import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import AppLayout from './layouts/AppLayout'
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

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const App = () => (
  <ThemeProvider>
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            {/* Auth pages */}
            <Route path="/login"  element={<Login />}  />
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
              <Route path="url-scanner"     element={<URLScanner />}     />
              <Route path="email-scanner"   element={<EmailScanner />}   />
              <Route path="malware-scanner" element={<MalwareScanner />} />
              <Route path="cache"           element={<CacheAnalytics />} />
              <Route path="history"         element={<ScanHistory />}    />
              <Route path="settings"        element={<Settings />}       />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  </ThemeProvider>
)

export default App
