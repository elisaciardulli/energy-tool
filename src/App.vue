<template>
  <v-container fluid>
    <v-row>
      <!-- Small Calendar - Date Picker -->
      <v-col cols="12" md="3">
        <div class="small-cal-container">
          <vue-cal
            class="vuecal--date-picker vuecal--blue-theme"
            xsmall
            :time="false"
            hide-view-selector
            active-view="month"
            :disable-views="['years', 'year', 'week', 'day']"
            @cell-focus="selectedDate = $event"
            today-button
            style="width: 100%; height: auto;">
          </vue-cal>
        </div>
      </v-col>

      <!-- Big Calendar -->
      <v-col cols="12" md="9">
        <div class="big-cal-container">
          <vue-cal 
            class="vuecal--blue-theme" 
            :disable-views="['years', 'year', 'week', 'month']"
            :time-step="30"
            active-view="day"
            today-button
            hide-view-selector
            :split-days="daySplits"
            sticky-split-labels
            :selected-date="selectedDate"
            :events="events"
            @view-change="onViewChange"
            style="height: 90vh"
            >
            <template #split-label="{ split }">
              <strong>{{ split.label }}</strong>
            </template>
            <!-- Custom Today Button -->
            <template #today-button>
              <v-tooltip>
                <template #activator="{ on }">
                  <v-btn v-on="on">
                    <span>Today</span>
                  </v-btn>
                </template>
              </v-tooltip>
            </template>
          </vue-cal>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      currDate: new Date(),
      selectedDate: new Date(),
      daySplits: [
        {label: 'Seminar 1', class: 'seminar1' },
        {label: 'Seminar 2', class: 'seminar2' },
        {label: 'Seminar 3', class: 'seminar3' },
        {label: 'Seminar 4', class: 'seminar4' },
        {label: 'Seminar Area', class: 'seminarArea' },
        {label: 'Foyer', class: 'foyer' },
        {label: 'Crane Hall', class: 'cranehall' }
      ],
      events: []
    };
  },
  async mounted() {
    // Fetch data when the component is mounted
    const startDate = new Date(this.selectedDate);
    startDate.setUTCHours(0,0,0,0);
    const endDate = new Date(this.selectedDate);
    endDate.setUTCHours(23, 59, 59, 999);

    const fetchedEvents = await this.getData(startDate, endDate);
    if (fetchedEvents && fetchedEvents.Items) {
      console.log("fetched events: ", fetchedEvents + " fetchedEventsItem: ", fetchedEvents.Items);
      const eventsForCalendar = fetchedEvents.Items.map(event => {

        return {
          start: this.getDateFormatted(event.RoomBooked[0].StartDate),
          end: this.getDateFormatted(event.RoomBooked[0].EndDate),
          title: event.EventTitle.it,
          content: "",
          class: "event",
          split: event.RoomBooked[0].Space,
        };
      });
      this.events = eventsForCalendar;
      console.log("events: ", this.events);
    }
  },
  methods: {
    getDateFormatted(dateString) {
      const date = new Date(dateString);
      
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    async onViewChange(newDate) {
      this.selectedDate = newDate.startDate;
      
      const startDate = new Date(this.selectedDateDate);
      startDate.setHours(0,0,0,0);
      const endDate = new Date(this.selectedDate);
      endDate.setHours(23, 59, 59, 999);

      // fecth data on view change
      const fetchedEvents = await this.getData(startDate.toISOString(), endDate.toISOString());
      if (fetchedEvents && fetchedEvents.Items) {
        this.events = fetchedEvents.Items; // Update the events array with fetched data
      }
    },
    async getData(startDate, endDate) {
      const baseUrl = "https://tourism.api.opendatahub.com/v1/EventShort";

      const params = new URLSearchParams({
        pagenumber: "1",
        startdate: startDate.toISOString().split('T')[0],
        enddate: endDate.toISOString().split('T')[0],
        eventlocation: "NOI",
        active: "true",
        sortorder: "ASC",
        optimizedates: "true",
        removenullvalues: "true",
      });

      const url = `${baseUrl}?${params.toString()}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log('Fetched JSON:', json);
        return json; // Return the data
      } catch (error) {
        console.error(error.message);
      }
    }
  }
};
</script>


<style>
v-container {
  max-width:none !important;
}

/* Style events */
.vuecal__event-title {
  font-size: 1.2rem;
  font-weight: bold;
  padding-top: 0.5rem;
}

.vuecal__event-time {
  display: none;
}

.vuecal__event-content {
}

/* Style heating events */
.event {
  background-color: rgb(225, 170, 170);
  color: rgb(57, 57, 57);
  border-left: 4px solid rgb(228, 102, 102);
  box-shadow: 0 4px 8px rgba(227, 86, 86, 0.4);
  border-radius: 4px;
}

.vuecal__now-line {
  color: black;
}

/*Style split columns*/
.vuecal .day-split-header {
  font-size: 0.8rem;
}
.vuecal__body {
}

.vuecal__no-event {
  display: none;
}
</style>
