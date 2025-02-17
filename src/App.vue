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
            active-view="week"
            :disable-views="['week']"
            today-button
            style="width: 100%; height: auto;">
          </vue-cal>
        </div>
      </v-col>

      <!-- Big Calendar -->
      <v-col cols="12" md="9">
        <div class="big-cal-container">
          <vue-cal 
            class="vuecal--blue-theme" style="height: 80%" 
            :disable-views="['years']"
            :time-from="6 * 60"
            :time-to="21 * 60"
            :time-step="30"
            today-button
            :special-hours="specialHours">
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
      specialHours: {
        // Monday (1)
        1: {
          from: 9 * 60,
          to: 17 * 60,
          class: 'heating',
          label: 'Heating'
        },
        
        // Tuesday (2)
        2: {
          from: 9 * 60,
          to: 17 * 60,
          class: 'heating',
          label: 'Heating'
        },

        // Wednesday (3) - Multiple shifts
        3: [
          {
            from: 9 * 60,
            to: 17 * 60,
            class: 'heating',
            label: 'Heating'
          }
        ],

        // Thursday (4)
        4: {
          from: 9 * 60,
          to: 17 * 60,
          class: 'heating',
          label: 'Heating'
        },

        // Friday (5)
        5: {
          from: 9 * 60,
          to: 17 * 60,
          class: 'heating',
          label: 'Heating'
        },

        // Saturday (6)
        6: {
          from: 9 * 60,
          to: 17 * 60,
          class: 'heating',
          label: 'Heating'
        },

        // Sunday (7)
        7: {
          from: 9 * 60,
          to: 17 * 60,
          class: 'heating',
          label: 'Heating'
        }
      }
    }
  }
}
</script>

<style>
v-container {
  max-width:none !important;
}

/* Style events */
.vuecal__special-hours {
  display: flex;
  padding-block: 0.7rem;
  padding-inline-start: 0.5rem;
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
