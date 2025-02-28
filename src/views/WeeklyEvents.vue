<template>
    <v-container fluid>
        <v-row cols="12" class="titleRow">
          <v-col cols="1" md="1">
            <div>
                <v-icon @click="goBack">mdi-arrow-left</v-icon>
            </div>
          </v-col>
          <v-col cols="11" md="11">
            <div>
              <h1 class="roomTitle">{{ this.$route.query.room }}</h1>
            </div>
          </v-col>
        </v-row>
      <v-row>
        <!-- Big Calendar -->
        <v-col class ="calendar-col" cols="12" md="12">
          <div class="big-cal-container">
            <vue-cal 
              class="vuecal--blue-theme" 
              :disable-views="['years', 'year', 'day', 'month']"
              :time-step="60"
              active-view="week"
              today-button
              hide-view-selector
              :selected-date="selectedDate"
              :events="events"
              @view-change="onViewChange"
              watchRealTime
              @cell-click="handleCellClick"
              :on-event-click="onEventClick"
              style="height: 85vh"
              >
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
                      <td class="t-header">Temperature</td>
                      <td>{{ this.temperature.time }}</td>
                      <td>{{ this.temperature.value }}</td>
                    </tr>
                    <tr>
                      <td class="t-header">Humidity</td>
                      <td>{{ this.humidity.time }}</td>
                      <td>{{ this.humidity.value }}</td>
                    </tr>
                    <tr>
                      <td class="t-header">Carbon dioxide</td>
                      <td>{{ this.co2.time }}</td>
                      <td>{{ this.co2.value }}</td>
                    </tr>
                    <tr>
                      <td class="t-header">Battery status</td>
                      <td>{{ this.battery.time }}</td>
                      <td>{{ this.battery.value }}</td>
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

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

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
        events: [],
        heating: [],
        temperature: {time: "", value: ""},
        humidity: {time: "", value: ""},
        co2: {time: "", value: ""},
        battery: {time: "", value: ""},
      };
    },
    async mounted() {
      this.loadEvents();
    },
    methods: {
      async loadEvents() {
        // Make sure the events list is empty
        this.events = [];

        // Get the start and end date of the current week
        const startDate = new Date(this.selectedDate);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(startDate).addDays(6);
        endDate.setHours(23,59, 59, 999);
  
        const fetchedEvents = await this.getData(startDate, endDate);
        if (fetchedEvents && fetchedEvents.Items) {
          console.log("fetched items: ", fetchedEvents.Items)
          const eventsForCalendar = fetchedEvents.Items.flatMap(event => {
            return event.RoomBooked.flatMap(room => {
              if(room.SpaceDescRoomMapping == this.$route.query.room) {
                console.log("entered if statement")

                const eventStart = new Date(room.StartDate);
                const eventEnd = new Date(room.EndDate);

                // Create the event
                const mainEvent = {
                  start: this.getDateFormatted(eventStart),
                  end: this.getDateFormatted(eventEnd),
                  title: event.EventTitle.it,
                  content: "",
                  class: "event",
                };

                // Create the corresponding heating event
                const heatingEventStart = new Date(eventStart);
                heatingEventStart.setHours(heatingEventStart.getHours() - 1);

                const heatingEvent = {
                  start: this.getDateFormatted(heatingEventStart),
                  end: this.getDateFormatted(eventEnd),
                  class: "heating",
                };
                return [heatingEvent,mainEvent];
              } else {
                return []
              }
            });
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
        // Get the start and end of the currently selected date
        this.selectedDate = date.startDate;
        //Get the right events for this week
        this.loadEvents();
      },
      async getData(startDate, endDate) {

        const baseUrl = "https://tourism.api.opendatahub.com/v1/EventShort/";
  
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
        this.loadSensorData("air-temperature");
        this.loadSensorData("air-humidity");
        this.loadSensorData("co2");
        this.loadSensorData("battery-state");
      },
      onEventClick(event, e) {
        this.selectedSplit = event.split;
        this.showDialog = true;
        this.loadSensorData("air-temperature");
        this.loadSensorData("air-humidity");
        this.loadSensorData("co2");
        this.loadSensorData("battery-state");
      },
      async getSensorData(dataType) {
        const baseUrl = `https://mobility.api.opendatahub.com/v2/flat/IndoorStation/${dataType}/latest`;
  
        const params = new URLSearchParams({
          limit: "1",
          offset: "0",
          where: "sname.eq.NOI:NOI-A1-Floor1-CO2",
          shownull: "false",
          distinct: "true",
          timezone: "+1",
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
      async loadSensorData(dataType) {
        const fetchedData = await this.getSensorData(dataType);
        if (fetchedData) {
          console.log("fetchedData: ", fetchedData)
          const value = fetchedData.data[0].mvalue;
          const time = this.getDateFormatted(fetchedData.data[0]._timestamp)
          if(dataType == "air-humidity") {
            this.humidity.value = value + "%";
            this.humidity.time = time;
          }
          else if(dataType == "air-temperature") {
            this.temperature.value = value + "°C";
            this.temperature.time = time
          }
          else if(dataType == "co2") {
            this.co2.value = value + "ppm";
            this.co2.time = time
          }
          else if(dataType == "battery-state") {
            this.battery.value = value + "%";
            this.battery.time = time;
          }
        } else {
          console.log(`No data found for ${dataType}`);
        }
      },
      goBack() {
      this.$router.back();
    }
  }
}
</script>

<style scoped>
.roomTitle {
    text-align: center;
}

.titleRow {
    justify-content: center;
    justify-items: center;
}

.calendar-col {
  padding:0 !important;
}
</style>