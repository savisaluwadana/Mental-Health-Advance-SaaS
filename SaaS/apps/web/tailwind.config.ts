import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lagoon: '#003b35',
        azure: '#003862',
        reef: '#51b291',
        ember: '#ff6e50',
        porcelain: '#f7f4ed',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(0, 59, 53, 0.16)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Trebuchet MS', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
