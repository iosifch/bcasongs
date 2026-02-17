import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { VLayout } from 'vuetify/components'

/**
 * Standard helper to wrap components in VLayout for Vuetify 3 layout injection.
 */
export function mountWithLayout(component, options = {}) {
  // We wrap the component in another component that provides the layout context
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
    // We must ensure the component itself is accessible for findComponent
  }).findComponent(component)
}
