import { createMemoryHistory, createRouter } from 'vue-router'

import WeeklyEvents from '../views/WeeklyEvents.vue'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/weeklyEvents', component: WeeklyEvents },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router