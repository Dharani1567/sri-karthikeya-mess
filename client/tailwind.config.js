/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C62828',
          'red-hover': '#B71C1C',
          gold: '#F9A825',
          green: '#2E7D32',
          orange: '#F88C00',
          dark: '#1F2937',
          muted: '#485563',
          cream: '#FFFBE1',
          'cream-light': '#FFFDF5',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
