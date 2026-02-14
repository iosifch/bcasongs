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
import PlaylistRepository from './services/PlaylistRepository';
import { useAuth } from './composables/useAuth';

const { initializeAuth } = useAuth();

onMounted(() => {
  initializeAuth();
  SongsRepository.initialize();
  PlaylistRepository.initialize();
});
</script>
