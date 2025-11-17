import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defaultAllowedOrigins, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'landing.html'),
        main: resolve(__dirname, 'index.html'),
        files: resolve(__dirname, 'files.html'),
        search: resolve(__dirname, 'search.html')
      }
    }
  },
  server: { 
    allowedHosts: ['ten-palestinian-generating-decade.trycloudflare.com']
  }
})
