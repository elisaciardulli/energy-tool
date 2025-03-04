<template>
    <v-container fluid>
      <!--Room name and back arrow-->
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
              :humidity="humidity" v-model="showDialog">
            </EventInfo>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<script>
import EventInfo from "../components/EventInfo.vue"

  export default {
    components: {
      EventInfo
    },
    data() {
      return {
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
      this.loadRoomEvents();
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
  
        const fetchedEvents = await this.getData(startDate, endDate);
        if (fetchedEvents && fetchedEvents.Items) {
          console.log("fetched items: ", fetchedEvents.Items)
          fetchedEvents.Items.forEach(event => {
            event.RoomBooked.forEach(room => {
              const roomName = room.SpaceDescRoomMapping;

              console.log("room name: ", roomName)

              //filter only the correct room
              if(roomName == this.$route.query.room) {

                const eventStart = new Date(room.StartDate);
                const eventEnd = new Date(room.EndDate);

                //check special case Seminar 1+2
                if(roomName == "Seminar 1+2") {
                  if(this.$route.query.room == "Seminar 1") {
                    const event1 = this.createRoomEvent(eventStart, eventEnd, event, room);
                    this.events.push(event1);
                  }
                  else if (this.$route.query.room == "Seminar 2"){
                    const event2 = this.createRoomEvent(eventStart, eventEnd, event, room);
                    this.events.push(event2);
                  }
                } else {
                  const mainEvent = this.createRoomEvent(eventStart, eventEnd, event, room, room)
                  this.events.push(mainEvent);
                };
              };
            });
          });
        }
        this.events = this.events.flat();
        console.log("events: ", this.events)
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
        this.loadRoomEvents();
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
      onEventClick(event, e) {
        this.selectedEvent = event;
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
      },
      createRoomEvent(start, end, event, room) {
        //create the main event
        const mainEvent = {
          start: this.getDateFormatted(start),
          end: this.getDateFormatted(end),
          title: event.EventTitle.it,
          content: "",
          class: "event"
        };

        const heatingEventStart = new Date(start);
        heatingEventStart.setMinutes(heatingEventStart.getMinutes() - 60);

        // create the corresponding heating event
        const heatingEvent = {
          start: this.getDateFormatted(heatingEventStart),
          end: this.getDateFormatted(end),
          title:"",
          content: "",
          class: "heating"
        };
        return [mainEvent, heatingEvent];
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