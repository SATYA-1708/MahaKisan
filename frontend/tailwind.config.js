/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maha: {
          green: '#15803d',
          darkgreen: '#166534',
          lightgreen: '#dcfce7',
          orange: '#ea580c',
          gold: '#ca8a04',
          bg: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
