import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b1120',
        panel: '#111827',
        border: '#1f2a37',
        accent: '#6ee7b7',
        glow: '#a78bfa'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(17, 24, 39, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
