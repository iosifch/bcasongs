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
        ></v-text-field>
      </v-col>
    </v-row>

    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-card v-else variant="flat" class="border">
      <v-list lines="two" class="pa-0">
        <template v-for="(song, index) in filteredSongs" :key="song.id">
          <v-list-item
            :to="{ name: 'SongDetail', params: { id: song.id } }"
          >
            <v-list-item-title class="font-weight-bold text-left">
              {{ song.title }}
            </v-list-item-title>
            
            <template v-slot:append>
              <v-sheet
                color="grey-lighten-3"
                class="d-flex align-center justify-center ml-3 rounded"
                height="26"
                width="26"
              >
                <span class="text-caption">{{ song.originalKey }}</span>
              </v-sheet>
            </template>
          </v-list-item>
          <v-divider v-if="index < filteredSongs.length - 1"></v-divider>
        </template>

        <v-list-item v-if="filteredSongs.length === 0">
          <v-list-item-title class="text-center text-grey">
            No songs found.
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
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
