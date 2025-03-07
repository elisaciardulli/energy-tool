<template>
    <v-container fluid>
      <!--Room name-->
      <v-row class="title-row">
        <div>
          <h1 class="roomTitle">{{ roomName }}</h1>
        </div>
      </v-row>
      <v-row>
        <!-- Big Calendar -->
        <v-col class ="calendar-col" cols="12" md="12">
          <div class="big-cal-container">
            <vue-cal 
              class="" 
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
              overlapsPerTimeStep
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

  export default {
    components: {
      EventInfo
    },
    data() {
      return {
        roomName: {},
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
      this.roomName = (window.location.hash).replace('#/', '')
      this.roomName = methods.formatRoomName(this.roomName)
      this.loadRoomEvents();
      methods.scrollToCurrentTime();
    },
    methods: {
      async loadRoomEvents() {
        // Make sure the events list is empty
        this.events = [];

        // Get the start and end date of the current week
        const startDate = new Date(this.selectedDate);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(startDate).addDays(6);
        endDate.setHours(23,59, 59, 999);
  
        const fetchedEvents = await methods.getData(startDate, endDate);
        if (fetchedEvents && fetchedEvents.Items) {
          fetchedEvents.Items.forEach(event => {
            event.RoomBooked.forEach(room => {
              const roomName = room.SpaceDescRoomMapping
              console.log("roomName: ", roomName)
              console.log("this roomName: ", this.roomName)

              //filter only the correct room
              if(roomName == this.roomName) {

                const eventStart = new Date(room.StartDate);
                const eventEnd = new Date(room.EndDate);

                //check special case Seminar 1+2
                if(roomName == "Seminar 1+2") {
                  if(this.roomName == "Seminar 1") {
                    const event1 = methods.createEvent(eventStart, eventEnd, event, room);
                    this.events.push(event1);
                  }
                  else if (this.roomName == "Seminar 2"){
                    const event2 = methods.createEvent(eventStart, eventEnd, event, room);
                    this.events.push(event2);
                  }
                } else {
                  const mainEvent = methods.createEvent(eventStart, eventEnd, event, roomName)
                  console.log("main event, ", mainEvent)
                  this.events.push(mainEvent);
                };
              };
            });
          });
        }
        this.events = this.events.flat();
        console.log("events: ", this.events)
      },
      async onViewChange(date) {
        // Get the start and end of the currently selected date
        this.selectedDate = date.startDate;
        //Get the right events for this week
        this.loadRoomEvents();
      },
      onEventClick(event, e) {
        this.selectedEvent = event;
        this.showDialog = true;
        this.loadSensorData("air-temperature");
        this.loadSensorData("air-humidity");
        this.loadSensorData("co2");
        this.loadSensorData("battery-state");
      },
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