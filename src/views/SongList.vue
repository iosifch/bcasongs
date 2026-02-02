<template>
  <v-app-bar color="secondary-container" elevation="2" scroll-behavior="hide">
    <v-container class="pa-0 fill-height">
      <v-text-field
        v-model="search"
        placeholder="Search songs..."
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        bg-color="surface"
        hide-details
        density="comfortable"
        rounded="lg"
        class="mx-3"
        single-line
        flat
      ></v-text-field>
    </v-container>
  </v-app-bar>

  <v-container fluid class="pa-3">
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <v-row dense>
        <v-col cols="12" v-for="song in filteredSongs" :key="song.id" class="py-2">
          <v-card 
            :to="{ name: 'SongDetail', params: { id: song.id } }"
            color="surface"
            class="rounded-lg transition-swing"
            hover
          >
            <v-card-text class="d-flex align-center justify-space-between py-4">
              <div class="font-weight-regular text-h6 text-truncate mr-2">
                {{ song.title }}
              </div>
              
              <v-chip
                color="secondary-container"
                variant="flat"
                size="small"
                class="font-weight-bold px-2"
                label
              >
                {{ song.originalKey }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-if="filteredSongs.length === 0" cols="12">
          <div class="text-center mt-4">
            No songs found.
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MusicService from '../services/MusicService';

const songs = ref([]);
const search = ref('');
const loading = ref(true);

onMounted(async () => {
  try {
    songs.value = await MusicService.getSongs();
  } finally {
    loading.value = false;
  }
});

const filteredSongs = computed(() => {
  if (!search.value) return songs.value;
  const term = search.value.toLowerCase();
  return songs.value.filter(song => 
    song.title.toLowerCase().includes(term) || 
    song.content.toLowerCase().includes(term)
  );
});
</script>
