/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#FFFDD0',
        mint: '#A7F3D0',
        pink: '#FBCFE8',
        lavender: '#E9D5FF',
        brutal: '#111827',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(17,24,39,1)',
        'brutal-lg': '6px 6px 0px 0px rgba(17,24,39,1)',
      },
      borderRadius: {
        'brutal': '14px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
