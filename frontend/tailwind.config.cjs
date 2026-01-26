module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
    },
    extend: {
      colors: {
        primary: '#6366F1',
        accent: '#06B6D4',
        success: '#10B981',
        warning: '#F97316',
        surface: '#F8FAFC',
        'neutral-900': '#0F172A'
      },
      boxShadow: {
        card: '0 8px 30px rgba(2,6,23,0.08)',
        'soft-lg': '0 20px 40px rgba(2,6,23,0.06)'
      },
      borderRadius: {
        xl: '1rem'
      }
    },
  },
  plugins: [],
}
