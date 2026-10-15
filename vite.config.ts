import path from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;\n`
      }
    }
  }
})
