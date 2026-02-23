import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { VLayout } from 'vuetify/components'
import type { Component } from 'vue'

interface MountWithLayoutOptions {
  props?: Record<string, unknown>;
  global?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Standard helper to wrap components in VLayout for Vuetify 3 layout injection.
 * Use this for all component tests that need Vuetify layout context.
 */
export function mountWithLayout(component: Component, options: MountWithLayoutOptions = {}) {
  const RootComponent = defineComponent({
    render() {
      return h(VLayout, null, {
        default: () => h(component as Component, {
          ...options.props,
          onUpdateModelValue: (val: unknown) => {
             if (options.props?.['onUpdate:modelValue']) {
               (options.props['onUpdate:modelValue'] as (val: unknown) => void)(val)
             }
          }
        })
      })
    }
  })

  return mount(RootComponent, {
    ...options,
  }).findComponent(component as Component)
}

/**
 * Helper to find a snackbar's text content from the teleported DOM.
 * Vuetify teleports snackbars to document.body, so we query the DOM directly
 * via a data-testid attribute instead of using document.body.innerHTML.
 */
export function getSnackbarText(): string {
  const snackbar = document.querySelector('[data-testid="snackbar"]');
  return snackbar?.textContent?.trim() ?? '';
}
