<script setup lang="ts">
import TravelPlanBox from "../components/TravelPlanBox.vue";

import travelPlanData from '../assets/TravelPlan.json'
</script>

<template>
  <travel-plan-box :travel-plan="travelPlanData" />
</template>

<style scoped>

</style>