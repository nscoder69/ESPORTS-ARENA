/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FIRE & SHADOW Color Palette
        background: '#0B0B0F',       // Main Background
        secondaryBg: '#111116',      // Secondary Background
        surface: '#17171F',          // Card Background
        card: '#17171F',             // Card Background
        surfaceHighlight: '#20202A', // Elevated Card
        elevated: '#20202A',         // Elevated Card
        inputBg: '#14141B',          // Input Background
        borderColor: '#303039',      // Border Color
        borderDark: '#303039',       // Border Color
        primary: {
          DEFAULT: '#FF5A1F',        // Primary Orange
          hover: '#FF733B',
          dark: '#E0450F',
          light: '#FF8854',
          glow: 'rgba(255, 90, 31, 0.35)',
        },
        secondary: {
          DEFAULT: '#FF2020',        // Secondary Red
          hover: '#FF4747',
          dark: '#D81212',
          light: '#FF6B6B',
          glow: 'rgba(255, 32, 32, 0.35)',
        },
        gold: {
          DEFAULT: '#FFD700',        // Gold Accent
          hover: '#FFE033',
          dark: '#E6C200',
          light: '#FFF080',
          glow: 'rgba(255, 215, 0, 0.35)',
        },
        accent: {
          DEFAULT: '#FF5A1F',        // Orange accent
          hover: '#FF733B',
          red: '#FF2020',
          gold: '#FFD700',
        },
        textPrimary: '#FFFFFF',      // Primary Text
        textSecondary: '#A1A1AA',    // Secondary Text
        fireOrange: '#FF5A1F',
        fireRed: '#FF2020',
        fireGold: '#FFD700',
      },
      boxShadow: {
        'fire-sm': '0 2px 10px rgba(255, 90, 31, 0.2)',
        'fire-md': '0 4px 20px rgba(255, 90, 31, 0.3)',
        'fire-lg': '0 8px 30px rgba(255, 90, 31, 0.45)',
        'red-sm': '0 2px 10px rgba(255, 32, 32, 0.25)',
        'gold-sm': '0 2px 10px rgba(255, 215, 0, 0.25)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 90, 31, 0.35)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 90, 31, 0.65)' },
        }
      }
    },
  },
  plugins: [],
}
