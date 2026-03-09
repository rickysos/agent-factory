/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        forge: {
          50: '#fafaf8',
          100: '#f0efe8',
          200: '#e0ded3',
          300: '#c4c1b0',
          400: '#9a9684',
          500: '#706c5c',
          600: '#56524a',
          700: '#3d3a34',
          800: '#25231f',
          850: '#1a1916',
          900: '#12110f',
          950: '#0a0a08',
        },
        amber: {
          50: '#fff9eb',
          100: '#ffefc2',
          200: '#ffdf85',
          300: '#ffcb3d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        copper: {
          400: '#e8854a',
          500: '#d97046',
          600: '#c05621',
        },
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-pattern': '24px 24px',
      },
    },
  },
  plugins: [],
}
