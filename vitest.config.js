import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/vitest-setup.js'],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
  },
  ssr: {
    noExternal: ['vuetify'],
  },
})
