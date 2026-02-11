<template>
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import SongsRepository from './services/SongsRepository';

onMounted(() => {
  SongsRepository.initialize();
});
</script>
