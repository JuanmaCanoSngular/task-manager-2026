/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      colors: {
        light: '#23272f',
        dark: '#fff',
        background: '#f3f4f6',
        'background-dark': '#181a20',
        card: '#fff',
        'card-dark': '#23272f',
        primary: '#0d9488',
      },
    },
  },
  plugins: [],
};
