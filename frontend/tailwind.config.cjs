module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
    },
    extend: {
      colors: {
        // semantic palette tokens
        primary: {
          DEFAULT: '#4F46E5',
          600: '#4338CA',
          400: '#7C83FF'
        },
        accent: {
          DEFAULT: '#06B6D4',
          500: '#06B6D4',
          300: '#67E8F9'
        },
        success: '#10B981',
        warning: '#F97316',
        error: '#EF4444',
        surface: {
          DEFAULT: '#F8FAFC',
          dark: '#0B1220'
        },
        text: {
          light: '#0F172A',
          dark: '#E6EEF8'
        },
        border: {
          DEFAULT: '#E6EEF8',
          dark: '#1F2937'
        },
        muted: {
          DEFAULT: '#4B5563',
          dark: '#9CA3AF'
        },
        neutral: {
          900: '#0F172A',
          700: '#334155'
        }
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
