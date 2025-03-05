<template>
  <component :is="currentView" />
</template>

<script>
  import  './assets/style.css';
  import Home from './views/Home.vue'
  import WeeklyEvents from './views/WeeklyEvents.vue';

  const routes = {
  '/': Home,
  '/Seminar1': WeeklyEvents,
  '/Seminar2': WeeklyEvents,
  '/Seminar3': WeeklyEvents,
  '/Seminar4': WeeklyEvents,
  '/Foyer': WeeklyEvents,
  '/CraneHall': WeeklyEvents
}

export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || NotFound
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
		  this.currentPath = window.location.hash
		})
  }
}
</script>
