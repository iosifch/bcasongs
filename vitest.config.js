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
    setupFiles: ['./src/vitest-setup.ts'],
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,ts,vue}'],
      exclude: ['src/**/*.spec.{js,ts}', 'src/test-utils.ts', 'src/vitest-setup.ts']
    },
  },
  ssr: {
    noExternal: ['vuetify'],
  },
})
