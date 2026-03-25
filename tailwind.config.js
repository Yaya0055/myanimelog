/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#c8d6e5',
          100: '#a4b4c8',
          200: '#8295ab',
          300: '#627a90',
          400: '#465f78',
          500: '#334d66',
          600: '#253a4f',
          700: '#1c2e42',
          800: '#142333',
          900: '#0e1a28',
          950: '#0a1220',
        },
        accent: {
          DEFAULT: '#7c6ef0',
          light: '#a397f7',
          dark: '#5b4dd4',
        },
        ocean: {
          DEFAULT: '#2d8cf0',
          light: '#5ba8f5',
          dark: '#1a6fc2',
          glow: '#2d8cf020',
        },
        neon: {
          pink: '#e879a8',
          blue: '#5ba8f5',
          green: '#4cd9a0',
          orange: '#f0a050',
          red: '#e86070',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
