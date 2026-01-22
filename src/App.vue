<template>
  <!-- <Header></Header> -->
  <CompassNavigation></CompassNavigation>
  <main class="router-view-container">
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
import CompassNavigation from './components/CompassNavigation.vue';
</script>
