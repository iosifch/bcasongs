// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
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
  }
})
