import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Base URL for GitHub Pages (root domain)
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // Enabled by default
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
