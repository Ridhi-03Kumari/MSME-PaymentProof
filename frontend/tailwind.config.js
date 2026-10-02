/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          700: '#1e3a5f',
          800: '#152d4a',
          900: '#0d1f35',
        },
      },
    },
  },
  plugins: [],
};
