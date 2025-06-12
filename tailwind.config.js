/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        light: '#23272f', // texto principal en modo claro
        dark: '#fff', // texto principal en modo oscuro
        background: '#f3f4f6',
        'background-dark': '#181a20',
        card: '#fff',
        'card-dark': '#23272f',
        primary: '#2563eb',
        'primary-dark': '#b6e3ff',
      },
    },
  },
  plugins: [],
};
