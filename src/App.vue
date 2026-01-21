<script setup lang="ts">
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
</script>

<template>
  <Header></Header>
  <main class="router-view-container">
    <RouterView />
  </main>
</template>
