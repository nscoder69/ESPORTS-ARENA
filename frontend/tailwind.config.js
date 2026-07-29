/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B', // Very deep gray/black
        surface: '#18181B',    // Slightly lighter for cards
        surfaceHighlight: '#27272A', // Hover states
        primary: {
          DEFAULT: '#6366F1', // Indigo/Purple professional
          hover: '#4F46E5'
        },
        secondary: {
          DEFAULT: '#EF4444', // Competitive Red
          hover: '#DC2626'
        },
        accent: {
          DEFAULT: '#10B981', // Success/Live Green
        },
        textPrimary: '#FAFAFA',
        textSecondary: '#A1A1AA'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
