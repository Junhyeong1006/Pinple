/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // 'class' strategy for dark mode toggles
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8B5CF6',
          hover: '#A78BFA',
          dark: '#7C3AED',
        },
        complaint: { DEFAULT: '#F43F5E', bg: 'rgba(244,63,94,0.08)' },
        suggestion: { DEFAULT: '#0EA5E9', bg: 'rgba(14,165,233,0.08)' },
        info: { DEFAULT: '#10B981', bg: 'rgba(16,185,129,0.08)' },
        surface: {
          light: '#FAFAFA',
          dark: '#0B0F19',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 200ms ease-out',
        'bounce-in': 'bounceIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'translateY(-20px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
