/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#1a1a1a',
          secondary: '#2a2a2a',
          tertiary: '#3a3a3a',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#666666',
        },
        accent: {
          primary: '#ff6b35',
          secondary: '#ff8c42',
          muted: '#ff6b35',
        },
        border: {
          primary: '#404040',
          secondary: '#505050',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
