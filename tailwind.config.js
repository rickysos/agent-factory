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
          50: '#f5f7f2',
          100: '#eaefe4',
          200: '#d4dccb',
          300: '#b5c0a9',
          400: '#8e9c82',
          500: '#6a7660',
          600: '#4d5643',
          700: '#353c2e',
          800: '#23281e',
          850: '#1a1e16',
          900: '#12150f',
          950: '#0a0c08',
        },
        accent: {
          DEFAULT: '#22c55e',
          hover: '#4ade80',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
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
