import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Base URL for GitHub Pages (root domain)
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // Enabled by default
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'BCA Songs',
        short_name: 'BCASongs',
        description: 'Songbook application for BCA',
        theme_color: '#f1eee0',
        background_color: '#f1eee0',
        display: 'standalone',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
