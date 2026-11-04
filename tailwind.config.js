/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080C',
          900: '#0A0C13',
          850: '#0E111B',
          800: '#141724',
          700: '#1C2133',
          600: '#2A3048',
          500: '#434C6E',
        },
        luxe: {
          gold: '#E5C07B',
          cyan: '#00F0FF',
          blue: '#3B82F6',
          violet: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
