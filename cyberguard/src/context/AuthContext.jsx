import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cg-token'))

  const login = (accessToken) => {
    localStorage.setItem('cg-token', accessToken)
    setToken(accessToken)
  }

  const logout = () => {
    localStorage.removeItem('cg-token')
    setToken(null)
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}