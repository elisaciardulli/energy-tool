<template>
  <v-container fluid>
    <v-row>
      <!-- Small Calendar - Date Picker -->
      <v-col cols="12" md="3"> <!-- Adjusted to 3 on medium screens -->
        <div class="small-cal-container">
          <vue-cal
            class="vuecal--date-picker vuecal--blue-theme"
            xsmall
            hide-view-selector
            :time="false"
            :transitions="false"
            active-view="month"
            :disable-views="['week']"
            style="width: 100%; height: auto;">
          </vue-cal>
        </div>
      </v-col>

      <!-- Big Calendar -->
      <v-col cols="12" md="9"> <!-- Adjusted to 9 on medium screens -->
        <div class="big-cal-container">
          <vue-cal 
            class="vuecal--blue-theme" style="height: 80%" 
            :disable-views="['years']">
          </vue-cal>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
</script>

<style scoped>
v-container {
  max-width:none !important;
}
</style>
