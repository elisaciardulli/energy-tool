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
            :on-event-click="onEventClick"
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
          <v-dialog v-model="showDialog">
            <!--Dialog window-->
            <v-card>
              <v-card-title>
                <span>{{ selectedEvent.title }}</span>
              </v-card-title>
              <v-card-text>
                <p>This is where the table will go</p>
              </v-card-text>
            </v-card>
          </v-dialog>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      selectedEvent: {},
      showDialog: false,
      currDate: new Date(),
      selectedDate: new Date(),
      daySplits: [
        {id:"Seminar 1", label: 'Seminar 1', class: 'seminar1' },
        {id:"Seminar 2", label:'Seminar 2', class: 'seminar2' },
        {id:"Seminar 3", label: 'Seminar 3', class: 'seminar3' },
        {id:"Seminar 4", label: 'Seminar 4', class: 'seminar4' },
        {id:"Seminar Area", label: 'Seminar Area', class: 'seminarArea' },
        {id:"Foyer", label: 'Foyer', class: 'foyer' },
        {id:"Crane Hall", label: 'Crane Hall', class: 'cranehall' }
      ],
      events: []
    };
  },
  async mounted() {
    this.loadEvents()
  },
  methods: {
    async loadEvents() {
      //Make sure the events list is empty
      this.events = [];
      // Fetch data when the component is mounted
      console.log("selectedDate: ", this.selectedDate);
      const startDate = new Date(this.selectedDate);
      startDate.setHours(0,0,0,0);
      console.log("startDate: ", startDate);
      const endDate = new Date(this.selectedDate);
      endDate.setHours(23, 59, 59, 999);
      console.log("endDate: ", endDate);

      const fetchedEvents = await this.getData(startDate, endDate);
      if (fetchedEvents && fetchedEvents.Items) {
        const eventsForCalendar = fetchedEvents.Items.map(event => {
          for(const i = 0; i <= event.RoomBooked.length; i++) {
            return {
            start: this.getDateFormatted(event.RoomBooked[i].StartDate),
            end: this.getDateFormatted(event.RoomBooked[i].EndDate),
            title: event.EventTitle.it,
            content: "",
            class: "event",
            split: this.mapStatus(event.RoomBooked[i].SpaceDesc),
            };
          }
        });
        this.events = eventsForCalendar;
        console.log("events: ", this.events);
      } 
    },
    mapStatus(string) {
      const roomList = [
        "Seminar 1",
        "Seminar 2",
        "Seminar 3",
        "Seminar 4",
        "Seminar Area",
        "Foyer",
        "Crane Hall",
      ];
      for (let i = 0; i < roomList.length; i++) {
        let roomRegex = new RegExp(".*" + roomList[i] + ".*", "i");
        if (roomRegex.test(string)) {
          return roomList[i];
        }
      }
      return "NO MATCH";
    },
    getDateFormatted(dateString) {
      const date = new Date(dateString);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    onEventClick(event, e) {
      this.selectedEvent;
      this.showDialog = true;

      // Prevent navigating to narrower view (default vue-cal behavior).
      e.stopPropagation()
    },

    async onViewChange() {
      this.loadEvents();
    },
    async getData(startDate, endDate) {
      const baseUrl = "https://tourism.api.opendatahub.com/v1/EventShort";
      console.log("start date in getDate: ", this.getDateFormatted(startDate));
      console.log("end date in getDate: ", this.getDateFormatted(endDate));

      const params = new URLSearchParams({
        pagenumber: "1",
        startdate: this.getDateFormatted(startDate),
        enddate: this.getDateFormatted(endDate),
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
  font-size: 1rem;
  font-weight: 100;
  padding: 0.5rem;
}
.event {
  background-color: rgb(200, 230, 250);
  color: rgb(57, 57, 57);
  border-left: 4px solid rgb(110, 170, 215);
}
.vuecal__event-time {
  display: none;
}

.vuecal__no-event {
  display: none;
}

/* Style heating events */
.heating {
  background-color: rgb(240, 190, 190);
  color: rgb(57, 57, 57);
  border-left: 4px solid rgb(230, 100, 100);
  box-shadow: 0 4px 8px rgba(230, 80, 80);
  border-radius: 4px;
}

.vuecal__now-line {
  color: rgb(63, 63, 63);
}

/*Style split columns*/
.vuecal .day-split-header {
  font-size: 0.8rem;
}
</style>
