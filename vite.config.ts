import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fully client-side SPA. base is relative so it works under any subpath
// (e.g. a GitHub Pages project path) without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
})
