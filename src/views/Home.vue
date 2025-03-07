<template>
    <v-container fluid>
      <v-row>
        <!-- Small Calendar - Date Picker -->
        <v-col cols="12" md="3">
          <div class="small-cal-container">
            <vue-cal
              class="vuecal--date-picker"
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
              class="" 
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
              overlapsPerTimeStep
              style="height: 90vh"
              >
              <!--Room Labels-->
              <template #split-label="{ split }">
                <strong><a :href="'#/' + split.label.replace(/ /g, '')">{{ split.label }}</a></strong>
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
            <!-- <a href="#/room">Go to room</a> -->
            <!--Dialog window-->
            <EventInfo 
              :showDialog="showDialog"
              :event="selectedEvent" 
              :battery="battery" 
              :temperature="temperature"
              :co2="co2"
              :humidity="humidity" v-model="showDialog"
              @update:showDialog="showDialog = $event">
            </EventInfo>
          </div>
        </v-col>
      </v-row>
    </v-container>
</template>
  
<script>
import EventInfo from "../components/EventInfo.vue"
import methods from "../assets/methods.js"
import parameters from "../assets/parameters.json"

  export default {
    components: {
      EventInfo
    },
    data() {
      return {
        showDialog: false,
        selectedEvent: {},
        currDate: new Date(),
        selectedDate: new Date(),
        daySplits: [
          {id:"Seminar 1", label: 'Seminar 1'},
          {id:"Seminar 2", label:'Seminar 2'},
          {id:"Seminar 3", label: 'Seminar 3'},
          {id:"Seminar 4", label: 'Seminar 4'},
          {id:"Foyer", label: 'Foyer'},
          {id:"Crane Hall", label: 'Crane Hall'}
        ],
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
      methods.scrollToCurrentTime();
    },
    methods: {
      async loadEvents() {
        // Make sure the events list is empty
        this.events = [];

        // Get the start and end of the currently selected date
        const startDate = new Date(this.selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(this.selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const fetchedEvents = await methods.getData(startDate, endDate);

        if (fetchedEvents && fetchedEvents.Items) {
          const eventsForCalendar = fetchedEvents.Items.forEach(event => {
            return event.RoomBooked.forEach(room => {

              // get the start and end of the current event
              const eventStart = new Date(room.StartDate);
              const eventEnd = new Date(room.EndDate);

              // Check special case Seminar 1+2
              if (room.SpaceDescRoomMapping == "Seminar 1+2") {
                const event1 = methods.createEvent(eventStart, eventEnd, event, "Seminar 1");
                this.events.push(event1);
                const event2 = methods.createEvent(eventStart, eventEnd, event, "Seminar 2");
                this.events.push(event2);
              } else {
                const roomName = methods.mapStatus(room.SpaceDesc);
                // Create the main event
                const mainEvent = methods.createEvent(eventStart, eventEnd, event, roomName);
                this.events.push(mainEvent)
              }
            });
          });
          this.events = this.events.flat();
        }
      },
      async onViewChange(date) {
        this.selectedDate = date.startDate;
        this.loadEvents();
      },
      onEventClick(event, e) {
        this.selectedEvent = event;
        this.showDialog = true;
        this.loadSensorData("air-temperature", parameters["Seminar 1"]);
        this.loadSensorData("air-humidity", parameters["Seminar 1"]);
        this.loadSensorData("co2", parameters["Seminar 1"]);
        this.loadSensorData("battery-state", parameters["Seminar 1"]);
      },
      async loadSensorData(dataType, sensorName) {
        const fetchedData = await methods.getSensorData(dataType, sensorName);
        if (fetchedData) {
          console.log("fetched Data: ", fetchedData)
          const value = fetchedData.data[0].mvalue;
          const time = methods.getReadableDate(fetchedData.data[0]._timestamp)
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
    },
  }
</script>
