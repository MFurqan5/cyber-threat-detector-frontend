/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#07111f',
          bg2: '#0b1020',
          bg3: '#111827',
          accent: '#4cc9f0',
          safe: '#00ffae',
          danger: '#ff4d6d',
          warning: '#ffd166',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(76,201,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #4cc9f0, 0 0 10px #4cc9f0' },
          '100%': { boxShadow: '0 0 20px #4cc9f0, 0 0 40px #4cc9f0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(76, 201, 240, 0.15)',
        'cyber-strong': '0 0 40px rgba(76, 201, 240, 0.3)',
        'danger': '0 0 20px rgba(255, 77, 109, 0.3)',
        'safe': '0 0 20px rgba(0, 255, 174, 0.3)',
      }
    },
  },
  plugins: [],
}
