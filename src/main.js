import { createApp } from 'vue'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vue-cal
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

// Components
import App from './App.vue'

const vuetify = createVuetify({
  directives,
  components: {
    ...components
  },
  icons: {
    iconfont: 'mdi',
  },
})

createApp(App).use(vuetify).mount('#app')