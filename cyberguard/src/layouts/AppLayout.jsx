import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/sidebar/Sidebar'
import Navbar from '../components/navbar/Navbar'
import AnimatedBackground from '../components/ui/AnimatedBackground'
import { useTheme } from '../context/ThemeContext'

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, themeId } = useTheme()

  return (
    <motion.div
      className="relative flex h-screen w-full overflow-hidden"
      animate={{ backgroundColor: theme.bgPrimary }}
      transition={{ duration: 0.4 }}
      style={{ color: theme.textPrimary }}
    >
      <AnimatedBackground />
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default AppLayout
