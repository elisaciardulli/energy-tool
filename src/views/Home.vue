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
  
<script>
import EventInfo from "../components/EventInfo.vue"

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
      this.splitHeaderClick();
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

        const fetchedEvents = await this.getData(startDate, endDate);

        if (fetchedEvents && fetchedEvents.Items) {
          const eventsForCalendar = fetchedEvents.Items.forEach(event => {
            return event.RoomBooked.forEach(room => {

              // get the start and end of the current event
              const eventStart = new Date(room.StartDate);
              const eventEnd = new Date(room.EndDate);

              // Check special case Seminar 1+2
              if (room.SpaceDescRoomMapping == "Seminar 1+2") {
                const event1 = this.createEvent(eventStart, eventEnd, event, room, "Seminar 1");
                this.events.push(event1);
                const event2 = this.createEvent(eventStart, eventEnd, event, room, "Seminar 2");
                this.events.push(event2);
              } else {
                const roomName = this.mapStatus(room.SpaceDesc);
                // Create the main event
                const mainEvent = this.createEvent(eventStart, eventEnd, event, room, roomName);
                this.events.push(mainEvent)
              }
            });
          });
          this.events = this.events.flat();
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
      splitHeaderClick() {
        const headers = document.querySelectorAll('.day-split-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const room = header.innerText;
                this.goToWeeklyEvents(room);
            });
        });
      },
      goToWeeklyEvents(room) {
        this.$router.push({ path: '/weeklyEvents', query: { room } })
      },
      createEvent(start, end, event, room, roomName) {
        //create the main event
        const mainEvent = {
          start: this.getDateFormatted(start),
          end: this.getDateFormatted(end),
          title: event.EventTitle.it,
          content: "",
          class: "event",
          split: roomName,
        };

        const heatingEventStart = new Date(start);
        heatingEventStart.setMinutes(heatingEventStart.getMinutes() - 60);

        // create the corresponding heating event
        const heatingEvent = {
          start: this.getDateFormatted(heatingEventStart),
          end: this.getDateFormatted(end),
          title:"",
          content: "",
          class: "heating",
          split: roomName,
        };
        return [mainEvent, heatingEvent];
      },
    },
  }
</script>
