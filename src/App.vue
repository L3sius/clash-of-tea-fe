<template>
  <!-- <Header></Header> -->
  <CompassNavigation v-if="route.name !== 'LiveFeed'" />
  <main class="router-view-container">
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import CompassNavigation from './components/CompassNavigation.vue';

const route = useRoute();
</script>