import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f17',
          raised: '#1a1a24',
          overlay: '#22222e',
          muted: '#2a2a38',
        },
        accent: {
          DEFAULT: '#ff7a18',
          hover: '#ff8f3f',
          soft: 'rgba(255, 122, 24, 0.10)',
          glow: 'rgba(255, 122, 24, 0.30)',
        },
        secondary: {
          DEFAULT: '#6c5ce7',
          hover: '#7d6ff0',
          soft: 'rgba(108, 92, 231, 0.10)',
          glow: 'rgba(108, 92, 231, 0.30)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.15)',
        },
        text: {
          primary: '#f0f0f4',
          secondary: '#a0a0b8',
          muted: '#606078',
          inverse: '#0f0f17',
        },
        glass: {
          bg: 'rgba(26, 26, 36, 0.60)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.40), 0 1px 3px rgba(0, 0, 0, 0.30)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.55), 0 2px 6px rgba(0, 0, 0, 0.35)',
        'card-lg': '0 16px 48px rgba(0, 0, 0, 0.50)',
        glow: '0 0 20px rgba(255, 122, 24, 0.20)',
        'glow-accent': '0 0 30px rgba(255, 122, 24, 0.30)',
        'glow-secondary': '0 0 20px rgba(108, 92, 231, 0.25)',
        sidebar: '4px 0 32px rgba(0, 0, 0, 0.50)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.35)',
        'input-focus': '0 0 0 3px rgba(255, 122, 24, 0.20)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 122, 24, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 122, 24, 0.35)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
