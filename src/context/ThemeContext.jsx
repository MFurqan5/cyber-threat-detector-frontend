import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themes = {
  dark: {
    id: 'dark',
    name: 'Cyber Dark',
    isDark: true,

    // Backgrounds — anchored to #0e0f11
    bgPrimary:   '#0e0f11',
    bgSecondary: '#13141a',
    bgTertiary:  '#1a1b23',

    // Accents — indigo instead of neon cyan
    accent:     '#6366f1',
    accentRgb:  '99, 102, 241',
    safe:       '#10b981',
    safeRgb:    '16, 185, 129',
    danger:     '#f43f5e',
    dangerRgb:  '244, 63, 94',
    warning:    '#f59e0b',
    warningRgb: '245, 158, 11',

    // Text
    textPrimary:   '#e8e9f0',
    textSecondary: '#9394a5',
    textMuted:     '#4b4d60',

    // Cards — glassmorphism on near-black
    cardBg:     'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.07)',
    cardHover:  'rgba(255, 255, 255, 0.06)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.4)',
    cardBlur:   'blur(20px)',

    // Surface
    surfaceBg:     'rgba(255, 255, 255, 0.025)',
    surfaceBorder: 'rgba(255, 255, 255, 0.05)',

    // Sidebar
    sidebarBg:           'rgba(14, 15, 17, 0.9)',
    sidebarBorder:       'rgba(99, 102, 241, 0.1)',
    sidebarActiveBg:     'rgba(99, 102, 241, 0.12)',
    sidebarActiveBorder: 'rgba(99, 102, 241, 0.25)',

    // Navbar
    navbarBg:     'rgba(14, 15, 17, 0.7)',
    navbarBorder: 'rgba(255, 255, 255, 0.05)',

    // Background orbs
    orb1:      'rgba(99, 102, 241, 0.07)',
    orb2:      'rgba(139, 92, 246, 0.05)',
    orb3:      'rgba(244, 63, 94, 0.04)',
    gridColor: 'rgba(99, 102, 241, 0.04)',

    // Inputs
    inputBg:          'rgba(255,255,255,0.04)',
    inputBorder:      'rgba(99,102,241,0.25)',
    inputFocusBorder: 'rgba(99,102,241,0.6)',
    inputFocusShadow: 'rgba(99,102,241,0.12)',

    // Table
    tableHeaderBg:  'rgba(0,0,0,0.25)',
    tableRowHover:  'rgba(255,255,255,0.025)',
    tableRowBorder: 'rgba(255,255,255,0.03)',

    // Scrollbar
    scrollThumb: 'rgba(99, 102, 241, 0.35)',
  },

  light: {
    id: 'light',
    name: 'Light Mode',
    isDark: false,

    // Backgrounds — white with purple tint
    bgPrimary:   '#fdfcff',
    bgSecondary: '#f0ebff',
    bgTertiary:  '#e8dfff',

    // Accents — purple
    accent:     '#7c3aed',
    accentRgb:  '124, 58, 237',
    safe:       '#059669',
    safeRgb:    '5, 150, 105',
    danger:     '#dc2626',
    dangerRgb:  '220, 38, 38',
    warning:    '#d97706',
    warningRgb: '217, 119, 6',

    // Text
    textPrimary:   '#111827',
    textSecondary: '#374151',
    textMuted:     '#6b7280',

    // Cards — solid, purple-tinted borders, NO glassmorphism
    cardBg:     '#ffffff',
    cardBorder: '#ddd6fe',
    cardHover:  '#f5f0ff',
    cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(124,58,237,0.08)',
    cardBlur:   'none',

    // Surface
    surfaceBg:     '#f0ebff',
    surfaceBorder: '#ddd6fe',

    // Sidebar
    sidebarBg:           '#ffffff',
    sidebarBorder:       '#ddd6fe',
    sidebarActiveBg:     'rgba(124, 58, 237, 0.08)',
    sidebarActiveBorder: 'rgba(124, 58, 237, 0.3)',

    // Navbar
    navbarBg:     'rgba(255, 255, 255, 0.95)',
    navbarBorder: '#ddd6fe',

    // Background orbs
    orb1:      'rgba(124, 58, 237, 0.07)',
    orb2:      'rgba(167, 139, 250, 0.06)',
    orb3:      'rgba(196, 181, 253, 0.05)',
    gridColor: 'rgba(124, 58, 237, 0.05)',

    // Inputs
    inputBg:          '#ffffff',
    inputBorder:      '#c4b5fd',
    inputFocusBorder: '#7c3aed',
    inputFocusShadow: 'rgba(124,58,237,0.1)',

    // Table
    tableHeaderBg:  '#f0ebff',
    tableRowHover:  '#f5f0ff',
    tableRowBorder: '#ede9fe',

    // Scrollbar
    scrollThumb: 'rgba(124, 58, 237, 0.3)',
  },
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() =>
    localStorage.getItem('cyberguard-theme') || 'dark'
  )

  const theme = themes[themeId]

  const toggleTheme = () => {
    const next = themeId === 'dark' ? 'light' : 'dark'
    setThemeId(next)
    localStorage.setItem('cyberguard-theme', next)
  }

  useEffect(() => {
    document.body.style.backgroundColor = theme.bgPrimary
    document.body.style.color = theme.textPrimary
    document.documentElement.style.setProperty('--scrollbar-thumb', theme.scrollThumb)
    document.documentElement.style.setProperty('--accent', theme.accent)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, themeId, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}
