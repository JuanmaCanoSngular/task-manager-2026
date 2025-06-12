/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        light: '#23272f',
        dark: '#fff',
        background: '#f3f4f6',
        'background-dark': '#181a20',
        card: '#fff',
        'card-dark': '#23272f',
        primary: '#2563eb',
      },
    },
  },
  plugins: [],
};
