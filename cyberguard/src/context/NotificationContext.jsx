import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

let toastId = 0

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'danger', title: 'Phishing URL Detected', message: 'https://paypal-secure-verify.ru flagged with 97% confidence', time: '2 min ago', read: false },
    { id: 2, type: 'warning', title: 'Spam Email Blocked', message: 'Email classified as spam with 99% confidence score', time: '8 min ago', read: false },
    { id: 3, type: 'safe', title: 'System Health OK', message: 'All services running normally — PostgreSQL, Redis, MongoDB', time: '15 min ago', read: true },
  ])

  const addToast = useCallback((type, title, message) => {
    const id = ++toastId
    setToasts(p => [...p, { id, type, title, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id))
  }, [])

  const addNotification = useCallback((type, title, message) => {
    const id = Date.now()
    setNotifications(p => [{ id, type, title, message, time: 'just now', read: false }, ...p.slice(0, 19)])
    addToast(type, title, message)
  }, [addToast])

  const markAllRead = useCallback(() => {
    setNotifications(p => p.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ toasts, notifications, addToast, removeToast, addNotification, markAllRead, markRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}
