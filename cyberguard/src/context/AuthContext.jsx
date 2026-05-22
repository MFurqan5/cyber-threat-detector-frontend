import React, { createContext, useContext, useState } from 'react'
import { getCookie, setCookie, eraseCookie } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getCookie('cg-token'))

  const login = (accessToken) => {
    setCookie('cg-token', accessToken, 7) // expires in 7 days
    setToken(accessToken)
  }

  const logout = () => {
    eraseCookie('cg-token')
    setToken(null)
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}