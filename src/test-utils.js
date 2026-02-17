import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { VLayout } from 'vuetify/components'

/**
 * Standard helper to wrap components in VLayout for Vuetify 3 layout injection.
 * Use this for all component tests that need Vuetify layout context.
 */
export function mountWithLayout(component, options = {}) {
  const RootComponent = defineComponent({
    render() {
      return h(VLayout, null, {
        default: () => h(component, {
          ...options.props,
          onUpdateModelValue: (val) => {
             if (options.props?.['onUpdate:modelValue']) {
               options.props['onUpdate:modelValue'](val)
             }
          }
        })
      })
    }
  })

  return mount(RootComponent, {
    ...options,
  }).findComponent(component)
}

/**
 * Helper to find a snackbar's text content from the teleported DOM.
 * Vuetify teleports snackbars to document.body, so we query the DOM directly
 * via a data-testid attribute instead of using document.body.innerHTML.
 */
export function getSnackbarText() {
  const snackbar = document.querySelector('[data-testid="snackbar"]');
  return snackbar?.textContent?.trim() ?? '';
}
