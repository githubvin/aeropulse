/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#050811',
          900: '#080c17',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155'
        },
        cyber: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
          amber: '#f59e0b',
          crimson: '#ef4444',
          purple: '#8b5cf6',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
