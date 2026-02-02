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
      <!-- Main List -->
      <v-row dense class="mb-16"> <!-- Add margin bottom to prevent overlap with fixed footer -->
        <v-col cols="12" v-for="song in filteredSongs" :key="song.id" class="py-2">
          <SongCard 
            :song="song" 
            :is-shortlisted="isInShortlist(song.id)"
            @toggle-shortlist="toggleShortlist"
          />
        </v-col>

        <v-col v-if="filteredSongs.length === 0" cols="12">
          <div class="text-center mt-4">
            No songs found.
          </div>
        </v-col>
      </v-row>

      <!-- Sticky Bottom Shortlist -->
      <div class="shortlist-bottom-container" v-if="shortlistedSongs.length > 0">
        <v-expand-transition>
          <div v-show="isShortlistExpanded" class="shortlist-content bg-secondary-container rounded-t-xl">
            <v-container fluid class="pa-3" style="max-height: 50vh; overflow-y: auto;">
              <v-row dense>
                <v-col cols="12" v-for="song in shortlistedSongs" :key="song.id" class="py-2">
                  <SongCard 
                    :song="song" 
                    :is-shortlisted="true"
                    @toggle-shortlist="toggleShortlist"
                  />
                </v-col>
              </v-row>
            </v-container>
          </div>
        </v-expand-transition>

        <v-sheet 
          elevation="4" 
          color="secondary-container" 
          class="d-flex align-center px-4 py-3 cursor-pointer transition-swing"
          :class="isShortlistExpanded ? 'rounded-0' : 'rounded-t-xl'"
          @click="isShortlistExpanded = !isShortlistExpanded"
        >
          <v-icon :icon="isShortlistExpanded ? 'mdi-chevron-down' : 'mdi-chevron-up'" class="mr-2"></v-icon>
          <v-icon icon="mdi-bookmark" class="mr-2"></v-icon>
          <span class="font-weight-bold">Shortlist ({{ shortlistedSongs.length }})</span>
        </v-sheet>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MusicService from '../services/MusicService';
import { useShortlist } from '../composables/useShortlist';
import SongCard from '../components/SongCard.vue';

const songs = ref([]);
const search = ref('');
const loading = ref(true);
const { shortlist, toggleShortlist, isInShortlist } = useShortlist();
const isShortlistExpanded = ref(false);

onMounted(async () => {
  try {
    songs.value = await MusicService.getSongs();
  } finally {
    loading.value = false;
  }
});

const shortlistedSongs = computed(() => {
  return songs.value.filter(song => isInShortlist(song.id));
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

<style scoped>
.shortlist-bottom-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.shortlist-content {
  /* background-color removed here as it's handled by utility class */
  /* border-top removed */
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

/* shortlist-header class removed as it's handled dynamically */
</style>
