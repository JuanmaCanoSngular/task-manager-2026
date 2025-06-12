/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#f3f4f6',
          dark: '#181a20',
        },
        sidebar: {
          DEFAULT: '#fff',
          dark: '#23272f',
        },
        card: {
          DEFAULT: '#fff',
          dark: '#23272f',
        },
        primary: {
          DEFAULT: '#2563eb',
          dark: '#b6e3ff',
        },
        text: {
          DEFAULT: '#23272f',
          dark: '#fff',
        },
      },
    },
  },
  plugins: [],
};
