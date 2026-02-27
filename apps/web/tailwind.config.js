export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { cream: '#FFFDD0', mint: '#A7F3D0', pink: '#FBCFE8', brutal: '#111827' },
      boxShadow: { 'brutal': '4px 4px 0px 0px rgba(17,24,39,1)' },
      borderRadius: { 'brutal': '14px' }
    }
  },
  plugins: [],
}
