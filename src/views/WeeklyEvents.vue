<template>
    <div>
        <v-icon @click="goBack">mdi-arrow-left</v-icon>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<script>
export default {
  methods: {
    goBack() {
      this.$router.back();
    }
  }
}
</script>