module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '25%, 40%': { opacity: '0' },
          '50%': { opacity: '1' },
          '75%': { opacity: '0'},
        },
      },
      animation: {
        flash: 'flash 2s infinite',
      }
    },
  },
  plugins: [],
}
