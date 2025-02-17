<template>
  <v-container fluid>
    <v-row>
      <!-- Small Calendar - Date Picker -->
      <v-col cols="12" md="3">
        <div class="small-cal-container">
          <vue-cal
            class="vuecal--date-picker vuecal--blue-theme"
            xsmall
            hide-view-selector
            :time="false"
            :transitions="false"
            active-view="month"
            :disable-views="['years']"
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
            :disable-views="['years']"
            :time-from="6 * 60"
            :time-to="21 * 60"
            :time-step="30"
            active-view="week"
            today-button
            :events="events"
            style="height: 90vh"
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
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      events: [
        {
          start: '2025-02-17 09:00',
          end: '2025-02-17 17:00',
          // You can also define event dates with Javascript Date objects:
          // start: new Date(2018, 11 - 1, 16, 10, 30),
          // end: new Date(2018, 11 - 1, 16, 11, 30),
          title: 'Heating',
          content: '<i class="icon material-icons">device_thermostat</i>',
          class: 'heating'
        }
      ]
    }
  }
}
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
.heating {
  background-color: rgb(225, 170, 170);
  color: rgb(57, 57, 57);
  border-left: 4px solid rgb(228, 102, 102);
  box-shadow: 0 4px 8px rgba(227, 86, 86, 0.4);
  border-radius: 4px;
}

.vuecal__now-line {
  color: black;
}
</style>
