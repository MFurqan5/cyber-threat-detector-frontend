import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
  const { themeId, toggleTheme, theme } = useTheme()
  const isDark = themeId === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.93 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl select-none"
      style={{
        background: theme.isDark ? 'rgba(255,255,255,0.05)' : '#f0ebff',
        border: `1px solid ${theme.cardBorder}`,
        transition: 'background 0.4s, border-color 0.4s',
      }}
    >
      {/* Track */}
      <div
        className="relative w-11 h-6 rounded-full flex items-center"
        style={{
          // dark: indigo-toned track matching new accent; light: purple gradient
          background: isDark
            ? 'linear-gradient(135deg, #1e1f2e, #2d2f4a)'
            : 'linear-gradient(135deg, #c4b5fd, #8b5cf6)',
          border: `1px solid ${isDark ? 'rgba(99,102,241,0.4)' : '#a78bfa'}`,
          boxShadow: isDark
            ? 'inset 0 1px 4px rgba(0,0,0,0.6)'
            : 'inset 0 1px 4px rgba(124,58,237,0.2)',
          transition: 'background 0.4s, border-color 0.4s',
        }}
      >
        {/* Thumb */}
        <motion.div
          animate={{ x: isDark ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className="absolute w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: isDark ? '#c7c8e0' : '#ffffff',
            boxShadow: isDark
              ? `0 1px 4px rgba(0,0,0,0.5), 0 0 6px rgba(99,102,241,0.3)`
              : '0 1px 6px rgba(124,58,237,0.3)',
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div key="moon"
                initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
                transition={{ duration: 0.2 }}>
                <Moon size={11} style={{ color: '#6366f1' }} />
              </motion.div>
            ) : (
              <motion.div key="sun"
                initial={{ opacity: 0, rotate: 30, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -30, scale: 0.5 }}
                transition={{ duration: 0.2 }}>
                <Sun size={11} style={{ color: '#7c3aed' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={themeId}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs font-medium hidden sm:block w-10"
          style={{ color: theme.textSecondary }}
        >
          {isDark ? 'Dark' : 'Light'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

export default ThemeToggle
