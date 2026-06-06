import React, { createContext, useContext, useState } from 'react'
import { getCookie, setCookie, eraseCookie } from '../services/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

// ── Keys ──────────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'cg-token'
const USER_KEY  = 'cg-user'
const GUEST_KEY = 'cg-guest'

// ── Helpers ───────────────────────────────────────────────────────────────────
// Token lives in sessionStorage → cleared when the browser/tab closes
// so the app always shows the login page on a fresh start.
const readToken = () => sessionStorage.getItem(TOKEN_KEY)
// FIXED
const saveToken = (t) => { sessionStorage.setItem(TOKEN_KEY, t); setCookie(TOKEN_KEY, t, 1) } // session cookie for api.js interceptor
const clearToken = () => { sessionStorage.removeItem(TOKEN_KEY); eraseCookie(TOKEN_KEY) }

const readUser = () => {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY)) || null } catch { return null }
}

export const isGuest = () => sessionStorage.getItem(GUEST_KEY) === 'true'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => readToken())
  const [user,  setUser]  = useState(() => readUser())
  const [guest, setGuest] = useState(() => isGuest())

  // ── regular login ──────────────────────────────────────────────────────────
  const login = (accessToken, userData) => {
    saveToken(accessToken)
    setToken(accessToken)
    sessionStorage.removeItem(GUEST_KEY)   // clear any previous guest flag
    setGuest(false)
    if (userData) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
    }
  }

  // ── guest login ────────────────────────────────────────────────────────────
  const loginAsGuest = () => {
    sessionStorage.setItem(GUEST_KEY, 'true')
    setGuest(true)
    // no token, no user
  }

  // ── update profile ─────────────────────────────────────────────────────────
  const updateUser = (partial) => {
    const next = { ...user, ...partial }
    sessionStorage.setItem(USER_KEY, JSON.stringify(next))
    setUser(next)
  }

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    clearToken()
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(GUEST_KEY)
    sessionStorage.removeItem('cg-admin')
    setToken(null)
    setUser(null)
    setGuest(false)
  }

  const isLoggedIn = !!token   // true only for real authenticated users

  return (
    <AuthContext.Provider value={{ token, user, guest, login, loginAsGuest, logout, updateUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}