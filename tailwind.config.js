/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          950: '#07090a',
          900: '#0a0f11',
          850: '#0e1416',
          800: '#121a1d',
          700: '#1a2427',
          600: '#253236',
          500: '#3a4a4f',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(16 185 129 / 0.25), 0 8px 32px -8px rgb(16 185 129 / 0.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
        pulseBar: { '0%,100%': { transform: 'scaleY(0.35)' }, '50%': { transform: 'scaleY(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .25s ease-out both',
        'pulse-bar': 'pulseBar 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
