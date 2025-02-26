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
            :time-step="60"
            active-view="day"
            today-button
            hide-view-selector
            :split-days="daySplits"
            sticky-split-labels
            :selected-date="selectedDate"
            :events="events"
            @view-change="onViewChange"
            watchRealTime
            @cell-click="handleCellClick"
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
          <!--Dialog window-->
          <v-dialog v-model="showDialog">
            <v-card>
              <v-card-title>
                <span>{{ selectedSplit }}</span>
                <!--Close Button-->
                <span class="close-btn" icon @click="showDialog = false">
                  <v-icon>mdi-close</v-icon>
                </span>
              </v-card-title>
              <v-card-text>
                <table>
                  <tr>
                    <td></td>
                    <td class="t-header">Timestamp</td>
                    <td class="t-header">Value</td>
                  </tr>
                  <tr>
                    <td class="t-header">Temperature (°C)</td>
                    <td>get data</td>
                    <td>get data</td>
                  </tr>
                  <tr>
                    <td class="t-header">Humidity (%)</td>
                    <td>get data</td>
                    <td>get data</td>
                  </tr>
                  <tr>
                    <td class="t-header">Carbon dioxide (ppm)</td>
                    <td>get data</td>
                    <td>get data</td>
                  </tr>
                  <tr>
                    <td class="t-header">Battery status (%)	</td>
                    <td>get data</td>
                    <td>get data</td>
                  </tr>
                </table>
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
      showDialog: false,
      selectedSplit: {},
      selectedEvent: {},
      showDialog: false,
      currDate: new Date(),
      selectedDate: new Date(),
      daySplits: [
        {id:"Seminar 1", label: 'Seminar 1'},
        {id:"Seminar 2", label:'Seminar 2'},
        {id:"Seminar 3", label: 'Seminar 3'},
        {id:"Seminar 4", label: 'Seminar 4'},
        {id:"Seminar Area", label: 'Seminar Area'},
        {id:"Foyer", label: 'Foyer'},
        {id:"Crane Hall", label: 'Crane Hall'}
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
      
      //get the  start and end of the currently selected date
      const startDate = new Date(this.selectedDate);
      startDate.setHours(0,0,0,0);
      const endDate = new Date(this.selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const fetchedEvents = await this.getData(startDate, endDate);
      if (fetchedEvents && fetchedEvents.Items) {
        console.log("fetched items: ", fetchedEvents)
        const eventsForCalendar = fetchedEvents.Items.flatMap(event => {
          return event.RoomBooked.map(room => ({
            start: this.getDateFormatted(room.StartDate),
            end: this.getDateFormatted(room.EndDate),
            title: event.EventTitle.it,
            content: "",
            class: "event",
            split: this.mapStatus(room.SpaceDesc),
          }));
        });

        this.events = eventsForCalendar;
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
    async onViewChange(date) {
      this.selectedDate = date.startDate;
      this.loadEvents();
    },
    async getData(startDate, endDate) {
      const baseUrl = "https://tourism.api.opendatahub.com/v1/EventShort";

      console.log("startDate: ", this.getDateFormatted(startDate))
      console.log("endDate: ", this.getDateFormatted(endDate))

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
        return json; // Return the data
      } catch (error) {
        console.error(error.message);
      }
    },
    handleCellClick(event, e) {
      this.selectedSplit = event.split
      this.showDialog = true;
    },
    onEventClick(event, e) {
      this.selectedSplit = event.split;
      this.showDialog = true;
    }
  }
};
</script>

<style>

v-container {
  max-width:none !important;
}

.vuecal__cell:hover, .day-split-header {
  cursor:pointer;
}

.day-split-header:hover {
  text-decoration:underline ;
}

/* Style events */
.vuecal__event-title {
  /* position: absolute; */
  font-size: 1rem;
  font-weight: 100;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
.event {
  background-color: rgb(200, 230, 250);
  padding: 0.5rem;
  color: rgb(57, 57, 57);
  border-left: 4px solid rgb(110, 170, 215);
  border-radius: 5px;
}
.vuecal__event-time {
  display: none;
}

.vuecal__no-event {
  display: none;
}

/*Style dialog window */
.v-card-title {
  font-weight: bold;
  padding-bottom: 0 !important;
  padding-top: 1rem;
  text-align: center;
  padding-top: 1rem;
  font-size: 1.7rem !important;
}

.close-btn {
  position: absolute; 
  right: 1rem; 
  top: 1rem;
}

.close-btn:hover {
  cursor: pointer;
}

/*Style Table*/
table {
  justify-content: center;
  width: 100%;
  border: 1px solid rgb(63, 63, 63) !important;
  border-collapse:collapse !important; 
}

th, td {
  border: 1px solid rgb(63, 63, 63) !important;
  padding: 8px !important;
  text-align: center;
}

.t-header {
  font-weight: bold;
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
