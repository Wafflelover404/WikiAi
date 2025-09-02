import { fileURLToPath, URL } from 'node:url'

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
  server: { 
    allowedHosts: ['ten-palestinian-generating-decade.trycloudflare.com']
  }
})
