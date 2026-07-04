import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the site works both at the domain root and under a
  // GitHub Pages project path (username.github.io/repo/).
  base: './',
})
