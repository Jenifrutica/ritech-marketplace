import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // Permite compartir el servidor de desarrollo por un túnel rápido de Cloudflare.
  server: { allowedHosts: ['.trycloudflare.com'] },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
