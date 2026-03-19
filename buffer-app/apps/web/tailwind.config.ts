import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#00C9A7',
          hover:   '#00B496',
          active:  '#00A085',
          subtle:  'rgba(0,201,167,0.12)',
        },
        surface: {
          DEFAULT: '#0F1117',
          raised:  '#1A1F2E',
          overlay: '#22293A',
        },
        border: {
          DEFAULT: '#2A3040',
          subtle:  '#1E2330',
        },
        text: {
          primary:   '#FFFFFF',
          secondary: '#8B9CB6',
          muted:     '#4A5568',
          disabled:  '#3D4A5C',
        },
        chart: {
          future1: '#FF6B6B',
          future2: '#F59E0B',
          future3: '#00C9A7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'bounce-slow': 'bounce 1.4s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
