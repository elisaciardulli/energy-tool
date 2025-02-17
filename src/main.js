import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VCalendar } from 'vuetify/labs/VCalendar'
/* import { it } from 'vuetify/locale' */

// Components
import App from './App.vue'

const vuetify = createVuetify({
  directives,
  components: {
    VCalendar,
    ...components
  },
  icons: {
    iconfont: 'mdi',
  },/* 
  locale: {
    current: 'it',
  }, */
})

createApp(App).use(vuetify).mount('#app')