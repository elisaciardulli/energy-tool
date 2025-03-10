<template>
    <v-dialog :value="showDialog" @input="updateShowDialog">
        <v-card>
            <v-card-title>
                <span class="event-info-title">{{event.title}}</span>
                <span class="close-btn" icon @click="closeDialog">
                <v-icon>mdi-close</v-icon>
                </span>
            </v-card-title>
            <div class="line"></div>
            <v-card-text>
              <div class="event-info">
                <div class="time-info">
                  <p><strong>Start time:</strong> {{ eventStart }}</p>
                  <p><strong>End time:</strong> {{ eventEnd }}</p>
                </div>
                <div class="organiser-info">
                  <p><strong>Organiser:</strong> {{ this.event.company }}</p>
                </div>
                <div class="contact-info" v-if="this.event.contactName || this.event.contactPhone || this.event.contactCell || this.event.contactEmail">
                  <p><strong>Contact:</strong></p>
                  <p v-if="this.event.contactFirstName || this.event.contactLastName">{{ this.event.contactFirstName}} {{ this.event.contactLastName}}</p>
                  <p v-if="this.event.contactPhone"><strong>Phone number:</strong> {{ this.event.contactPhone }}</p>
                  <p v-if="this.event.contactCell"><strong>Cell number:</strong> {{ this.event.contactCell }}</p>
                  <p v-if="this.event.contactEmail"><strong>E-Mail:</strong> {{ this.event.contactEmail }}</p>
                </div>
              </div>
              <div class="line"></div>
              <div class="sensor-info">
                <table>
                  <tr>
                      <td class="t-header top">Temperature</td>
                      <td>{{ temperature }}</td>
                  </tr>
                  <tr>
                      <td class="t-header">Humidity</td>
                      <td>{{ humidity }}</td>
                  </tr>
                  <tr>
                      <td class="t-header">Carbon dioxide</td>
                      <td>{{ co2 }}</td>
                  </tr>
                  <tr>
                      <td class="t-header bottom">Battery status</td>
                      <td>{{ battery }}</td>
                  </tr>
                </table>
                <p class="small-info">Last updated: {{ battery }}</p>
              </div>
            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<script>
import methods from "../assets/methods.js"
import parameters from "../assets/parameters.json"

export default {
  name: 'EventInfo',
  props: {
    event: Object,
    showDialog: Boolean,
  },
  data() {
    return {
        eventRoom: "room not found",
        eventStart: '--:--',
        eventEnd: '--:--',
        temperature: "not found",
        humidity: "not found",
        co2: "not found",
        battery: "not found",
        timestamp: "unknown"
    }
  },
  watch: {
    'event.split': 'updateRoom',
    'event.start': 'formatEventStart',
    'event.end': 'formatEventEnd',
  },
  mounted() {
    console.log("event: ", this.event)
    console.log("event contact: ", this.event.contactFirstName)
    console.log("showdialog: ", this.showDialog)
    this.loadSensorData("air-humidity", parameters[`${this.event.split}`]);
    this.loadSensorData("air-temperature", parameters[`${this.event.split}`]);
    this.loadSensorData("co2" , parameters[`${this.event.split}`]);
    this.loadSensorData("battery-state", parameters[`${this.event.split}`]);
  },
  methods: {
    updateShowDialog(value) {
      this.$emit('update:showDialog', value);
    },
    closeDialog() {
      this.$emit('update:showDialog', false);
    },
    formatEventStart() {
        this.eventStart = this.formatDate(this.event.start)
    },
    formatEventEnd() {
        this.eventEnd = this.formatDate(this.event.end)
    },
    formatDate(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    async loadSensorData(dataType, roomName) {
        const fetchedData = await methods.getSensorData(dataType, roomName);
        if (fetchedData.length > 0) {
          const value = fetchedData.data[0].mvalue;
          const time = methods.getReadableDate(fetchedData.data[0]._timestamp)
          if(dataType == "air-humidity") {
            this.humidity = value + " %";
          }
          else if(dataType == "air-temperature") {
            this.temperature = value + " °C";
          }
          else if(dataType == "co2") {
            this.co2 = value + " ppm";
          }
          else if(dataType == "battery-state") {
            this.battery = value + " %";
          }
          this.timestamp = time;
        } else {
          console.log(`No data found for ${dataType}`);
        }
    },
    updateRoom() {
      this.eventRoom = this.event.split;
    }
  },
};
</script>