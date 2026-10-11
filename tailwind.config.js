module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design tokens for the "Instrument Panel" redesign (docs/SPEEDTYPE_REDESIGN_SPEC.md §1)
      colors: {
        bg: '#E8EAED',
        surface: '#FFFFFF',
        'surface-muted': '#F6F7F8',
        'surface-sunken': '#E3E5E9',
        'nav-track': '#DADDE2',
        ink: '#16181D',
        'ink-2': '#3B404A',
        muted: '#5A606C',
        pending: '#6B7180',
        'on-dark-muted': '#A3A9B4',
        border: '#D5D8DD',
        divider: '#ECEEF1',
        'kbd-bg': '#F1F2F4',
        accent: '#FF5A1F',
        'accent-soft': '#FF5A1F1F',
        error: '#C2410C',
        'error-extra': '#9A3412',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,24,29,.06), 0 12px 32px -12px rgba(22,24,29,.12)',
        'caret-before': 'inset 3px 0 0 #FF5A1F',
        'caret-after': 'inset -3px 0 0 #FF5A1F',
      },
      borderRadius: {
        card: '20px',
      },
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
