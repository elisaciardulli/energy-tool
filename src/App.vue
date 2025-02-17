<template>
  <div class="container">
    <v-sheet
      class="d-flex"
      height="54"
      tile
    >
      <v-select
        v-model="type"
        :items="types"
        class="ma-2"
        density="compact"
        label="View Mode"
        variant="outlined"
        hide-details
      ></v-select>
    </v-sheet>
    <v-sheet>
      <v-calendar
        ref="calendar"
        v-model="value"
        :events="events"
        :view-mode="type"
        :weekdays="weekday"
        :first-day-of-week="1"
      ></v-calendar>
    </v-sheet>
  </div>
</template>
<script>

  import { useDate } from 'vuetify'

  export default {
    data: () => ({
      type: 'week',
      types: ['month', 'week', 'day'],
      weekday: [0, 1, 2, 3, 4, 5, 6],
      weekdays: [
        { title: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
        { title: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
        { title: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
        { title: 'Mon, Wed, Fri', value: [1, 3, 5] },
      ],
      value: [new Date()],
      events: [],
      colors: ['red', 'blue'],
      titles: ['Heating', 'Event'],
    }),
    mounted () {
      const adapter = useDate()
      this.getEvents({ start: adapter.startOfDay(adapter.startOfMonth(new Date())), end: adapter.endOfDay(adapter.endOfMonth(new Date())) })
    },
    methods: {
      getEvents({start, end}) {
        const events = []
        
        for(let i = 0; i <= 20; i++) {
          const currentDate = new Date(start)
          currentDate.setDate(currentDate.getDate() + i)
          currentDate.setHours(9,30,0,0)

          const startEvent = new Date(currentDate)
          const endEvent = new Date(currentDate)
          endEvent.setHours(17,0,0,0)

          events.push({
            title: 'HEAT',
            start: startEvent,
            end: endEvent,
            color: 'red',
            allDay: false
          })
        }

        for(let i = 0; i <= 20; i++) {
          const currentDate = new Date(start)
          currentDate.setDate(currentDate.getDate() + i)
          currentDate.setHours(9,0,0,0)

          const startEvent = new Date(currentDate)
          const endEvent = new Date(currentDate)
          endEvent.setHours(17,0,0,0)

          events.push({
            title: 'HEAT',
            start: startEvent,
            end: endEvent,
            color: 'red',
            allDay: false
          })
        }

        this.events = events
      }
    },
  }
</script>

<style scoped>
  .container {
    padding-inline: 2rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>