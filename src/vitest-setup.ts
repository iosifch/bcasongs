import { vi, afterEach } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { config } from '@vue/test-utils'

// 1. Mock ResizeObserver (Standard solution for JSDOM/Happy-DOM)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 2. Mock visualViewport (Required for Vuetify Overlays like Dialogs)
globalThis.visualViewport = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  width: 1024,
  height: 768,
} as unknown as VisualViewport

// 3. Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
})

// 4. Globalize the plugin (Standard Vue Test Utils pattern)
config.global.plugins = [vuetify]

// 5. Cleanup manual DOM after each test (Standard for Teleport/Overlays)
afterEach(() => {
  document.body.innerHTML = ''
})

export { vuetify }
