import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// GitHub Pages отдаёт проект из подпути /qazExpo/, локальный dev — из корня.
const GH_PAGES_BASE = '/qazExpo/'

export default defineConfig(({ command, isSsrBuild }) => ({
  base: command === 'build' ? GH_PAGES_BASE : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    /* Только для клиентской сборки: в SSR react и recharts внешние,
       и разбивать их на чанки нельзя */
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            /* recharts тянет d3 — держим его отдельным чанком, чтобы код
               приложения не перестраивался вместе с библиотекой графиков */
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              charts: ['recharts'],
            },
          },
        },
  },
  server: {
    /* 5173 на рабочей машине занят системным исключением портов Windows
       (netsh interface ipv4 show excludedportrange) — берём соседний */
    port: 5180,
    host: '127.0.0.1',
    open: '/dashboard',
  },
}))
