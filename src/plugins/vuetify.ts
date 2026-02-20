// Styles
import 'material-symbols/outlined.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import { h } from 'vue'
import type { IconProps } from 'vuetify'

// Custom icon set for Material Symbols
const materialSymbols = {
  component: (props: IconProps) => {
    const iconName = typeof props.icon === 'string'
      ? props.icon
      : (props.icon as { icon?: string })?.icon || props.icon
    return h(
      'i',
      { class: 'material-symbols-outlined' },
      iconName as string
    )
  },
}


export default createVuetify({
  theme: {
    defaultTheme: 'bcasongs',
    themes: {
      bcasongs: {
        dark: false,
        colors: {
          primary: '#626118',
          'on-primary': '#ffffff',
          'primary-container': '#e8e78f',
          'on-primary-container': '#4a4900',

          secondary: '#616043',
          'on-secondary': '#ffffff',
          'secondary-container': '#e7e4bf',
          'on-secondary-container': '#49482d',

          tertiary: '#3e6656',
          'on-tertiary': '#ffffff',
          'tertiary-container': '#c0ecd8',
          'on-tertiary-container': '#254e3f',

          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a',

          background: '#f1eee0',
          surface: '#fdf9ec',
          'surface-bright': '#fdf9ec',
          'surface-dim': '#dddacd',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f7f4e6',
          'surface-container': '#f1eee0',
          'surface-container-high': '#ece8db',
          'surface-container-highest': `#e6e3d5`,

          'on-surface': '#1c1c14',
          'on-surface-variant': '#48473a',

          outline: '#797869',
          'outline-variant': '#cac7b6',

          'inverse-surface': '#313128',
          'inverse-on-surface': '#f4f1e3',
          'inverse-primary': '#cccb76',

          scrim: '#000000',
          shadow: '#000000',
        }
      },
      light: {
        colors: {
          // Primary (Dark Navy)
          primary: '#1f2a36',
          'primary-lighten-1': '#3A4A5A',
          'primary-lighten-2': '#586C7E',
          'primary-darken-1': '#151D24',
          'primary-darken-2': '#0B0F12',

          // Secondary (Taupe)
          secondary: '#cbb6a2',
          'secondary-lighten-1': '#D9C8B8',
          'secondary-lighten-2': '#E7DACE',
          'secondary-darken-1': '#B09A84',
          'secondary-darken-2': '#947E66',

          // Accent (Dusty Pink)
          accent: '#d7b7c2',
          'accent-lighten-1': '#E1C9D1',
          'accent-lighten-2': '#EBDBE0',
          'accent-darken-1': '#C09AA8',
          'accent-darken-2': '#A87D8E',

          // Info (Ice Blue)
          info: '#c9dce6',
          'info-lighten-1': '#D7E5ED',
          'info-lighten-2': '#E5EFF4',
          'info-darken-1': '#ABC9D8',
          'info-darken-2': '#8DB6CA',

          // Background (Cream)
          background: '#e7dccf',
          surface: '#FFFFFF',

          // Semantic Colors (Standard or Adapted)
          error: '#B00020',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
  defaults: {
    global: {
      style: {
        fontFamily: 'Roboto, sans-serif'
      }
    }
  },
  icons: {
    defaultSet: 'ms',
    sets: {
      ms: materialSymbols,
    },
  },
})
