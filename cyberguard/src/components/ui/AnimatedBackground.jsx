import React from 'react'
import { useTheme } from '../../context/ThemeContext'

const AnimatedBackground = () => {
  const { theme } = useTheme()

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0" style={{ background: theme.bgPrimary, transition: 'background 0.5s' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        transition: 'opacity 0.5s',
        opacity: theme.isDark ? 0.8 : 0.5,
      }} />
      {/* Orbs — subtle in both themes */}
      {[
        { w: 600, h: 600, left: '-150px', top: '10%', color: theme.orb1, dur: '12s' },
        { w: 500, h: 500, right: '-100px', top: '30%', color: theme.orb2, dur: '15s', delay: '-5s' },
        { w: 400, h: 400, left: '40%', bottom: '10%', color: theme.orb3, dur: '10s', delay: '-3s' },
      ].map((orb, i) => (
        <div key={i} className="absolute orb-animate" style={{
          width: orb.w, height: orb.h,
          left: orb.left, right: orb.right, top: orb.top, bottom: orb.bottom,
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          borderRadius: '50%', animationDuration: orb.dur, animationDelay: orb.delay || '0s',
          transition: 'background 0.6s',
        }} />
      ))}
    </div>
  )
}

export default AnimatedBackground
