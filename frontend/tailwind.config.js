/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#292923',
        muted: '#85847c',
        paper: '#faf8f4',
        gold: '#aa8b50',
        'gold-light': '#f4efe3',
        line: '#eeece6',
        forest: '#3e4a3c',
      },
      boxShadow: {
        card: '0 2px 14px rgba(39, 37, 28, 0.035)',
      },
    },
  },
  plugins: [],
}
