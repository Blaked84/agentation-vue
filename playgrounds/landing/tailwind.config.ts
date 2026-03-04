import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    fontFamily: {
      display: ['"Instrument Serif"', 'Georgia', 'serif'],
      body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
    extend: {
      colors: {
        cream: {
          50: '#fefdfb',
          100: '#faf8f5',
          200: '#f0ece6',
          300: '#e4dfd7',
        },
        ink: {
          300: '#a8a29e',
          500: '#6b6560',
          700: '#3d3833',
          900: '#1a1816',
        },
        ember: {
          50: '#f0faf5',
          100: '#d1f2e3',
          400: '#5cc996',
          500: '#42b883',
          600: '#3aa876',
        },
      },
      borderRadius: {
        'va': '6px',
        'va-lg': '8px',
        'va-pill': '999px',
      },
      boxShadow: {
        'va': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'va-hover': '0 6px 16px rgba(0, 0, 0, 0.2)',
        'va-deep': '0 10px 24px rgba(0, 0, 0, 0.32), 0 2px 6px rgba(0, 0, 0, 0.28)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'toolbar': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'popup-enter': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'cursor-move': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'typing': 'blink 1s step-end infinite',
        'marker-pop': 'markerPop 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        markerPop: {
          from: { transform: 'translate(-50%, -50%) scale(0)', opacity: '0' },
          to: { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
        },
      },
      maxWidth: {
        'landing': '1120px',
      },
      spacing: {
        'section': '6rem',
      },
    },
  },
  plugins: [],
} satisfies Config
