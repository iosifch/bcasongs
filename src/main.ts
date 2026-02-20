import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import './style.css'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker
registerSW({
  onNeedRefresh() {
    // Handle refresh logic here if needed (e.g., show a toast)
    console.log('New content available, click on reload button to update.')
  },
  onOfflineReady() {
    console.log('App is ready to work offline.')
  },
})

// Roboto Font
import '@fontsource/roboto/100.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';

createApp(App)
  .use(vuetify)
  .use(router)
  .mount('#app')
