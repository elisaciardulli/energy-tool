<template>
    <v-card>
        <v-card-title>
            <span>{{event.title}}</span>
            <span class="close-btn" icon @click="showDialog = false">
            <v-icon>mdi-close</v-icon>
            </span>
        </v-card-title>
        <v-card-text>
            <table>
            <tr>
                <td></td>
                <td class="t-header">Timestamp</td>
                <td class="t-header">Value</td>
            </tr>
            <tr>
                <td class="t-header">Temperature</td>
                <td>{{ temperature.time }}</td>
                <td>{{ temperature.value }}</td>
            </tr>
            <tr>
                <td class="t-header">Humidity</td>
                <td>{{ humidity.time }}</td>
                <td>{{ humidity.value }}</td>
            </tr>
            <tr>
                <td class="t-header">Carbon dioxide</td>
                <td>{{ co2.time }}</td>
                <td>{{ co2.value }}</td>
            </tr>
            <tr>
                <td class="t-header">Battery status</td>
                <td>{{ battery.time }}</td>
                <td>{{ battery.value }}</td>
            </tr>
            </table>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
  name: 'EventInfo',
  props: {
    event: Object,
    temperature: Object,
    humidity: Object,
    co2: Object,
    battery: Object,
  },
  watch: {
    showDialog(newVal) {
      this.$emit('update:showDialog', newVal);
    }
  }
};
</script>