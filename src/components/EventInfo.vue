<template>
    <v-dialog :value="showDialog" @input="updateShowDialog">
        <v-card>
            <v-card-title>
                <span>{{event.title}}</span>
                <span class="close-btn" icon @click="closeDialog">
                <v-icon>mdi-close</v-icon>
                </span>
            </v-card-title>
            <v-card-text>
                <p>{{ eventStart }} - {{ eventEnd }}</p>
                <div class="line"></div>
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
    </v-dialog>

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
    showDialog: Boolean,
  },
  data() {
    return {
        eventStart: '--:--',
        eventEnd: '--:--'
    }
  },
  watch: {
    // Watch for changes to event prop and reformat the dates when the event changes
    'event.start': 'formatEventStart',
    'event.end': 'formatEventEnd',
  },
  methods: {
    // Emit an event to update showDialog in the parent
    updateShowDialog(value) {
      this.$emit('update:showDialog', value);
    },

    // Close the dialog and notify the parent
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
  },
};
</script>