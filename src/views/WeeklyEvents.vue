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
              @ready="onReady"
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
                    <v-btn v-on="on" class="custom-today">
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
              v-model="showDialog"
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
  
        const fetchedEvents = await methods.getData(this.startDate, this.endDate);
        if (fetchedEvents && fetchedEvents.Items) {
          fetchedEvents.Items.forEach(event => {
            event.RoomBooked.forEach(room => {
              const roomName = room.SpaceDescRoomMapping

              //filter only the events for the current room
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
                  this.events.push(mainEvent);
                };
              };
            });
          });
        }
        this.events = this.events.flat();
      },
      async onReady(data) {
        //set the start and end date of the current week
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        console.log("startDate: ", this.startDate)
        console.log("endDate: ", this.endDate)
      },
      async onViewChange(data) {
        //set the start and end date of the current week
        console.log("startDate: ", this.startDate)
        console.log("endDate: ", this.endDate)
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        // Get the start and end of the currently selected date
        this.selectedDate = data.startDate;
        //Get the right events for this week
        this.loadRoomEvents();
      },
      onEventClick(event, e) {
        this.selectedEvent = event;
        this.showDialog = true;
      },
      createRoomHeatingEvents() {
        const eventsByDay = methods.sortEventsByDay()
        
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