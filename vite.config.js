import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// GitHub Pages отдаёт проект из подпути /qazExpo/, локальный dev — из корня.
const GH_PAGES_BASE = '/qazExpo/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? GH_PAGES_BASE : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: '/design-system',
  },
}))
