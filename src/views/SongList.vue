<template>
  <v-container fluid class="pa-3">
    <v-row class="mb-2">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          label="Search songs..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          clearable
          density="comfortable"
          rounded="lg"
        ></v-text-field>
      </v-col>
    </v-row>

    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <v-row dense>
        <v-col cols="12" v-for="song in filteredSongs" :key="song.id">
          <v-card 
            :to="{ name: 'SongDetail', params: { id: song.id } }"
            elevation="10"
            class="rounded-lg"
          >
            <v-card-text class="d-flex align-center justify-space-between py-3">
              <div class="font-weight-medium text-body-1 text-truncate mr-2">
                {{ song.title }}
              </div>
              
              <v-sheet
                color="grey-lighten-3"
                class="d-flex align-center justify-center rounded flex-shrink-0"
                height="28"
                width="28"
              >
                <span class="text-caption font-weight-bold">{{ song.originalKey }}</span>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-if="filteredSongs.length === 0" cols="12">
          <div class="text-center text-grey mt-4">
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
