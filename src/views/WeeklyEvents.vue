<template>
    <v-container fluid>
      <v-row>
        <v-col cols="0" md="1">
            <div>
                <v-icon @click="goBack">mdi-arrow-left</v-icon>
            </div>
        </v-col>
        <!-- Big Calendar -->
        <v-col cols="12" md="11">
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
  methods: {
    goBack() {
      this.$router.back();
    }
  }
}
</script>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>