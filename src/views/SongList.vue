<template>
  <v-app-bar color="secondary-container" elevation="2" scroll-behavior="hide">
    <v-container class="pa-0 fill-height d-flex align-center px-3">
      <template v-if="isSearchActive">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          density="comfortable"
          rounded="lg"
          class="mr-2"
          @click="closeSearch"
        ></v-btn>

        <v-text-field
          v-model="search"
          placeholder="Search songs..."
          variant="solo"
          bg-color="surface"
          hide-details
          density="comfortable"
          rounded="lg"
          single-line
          flat
          autofocus
          class="flex-grow-1"
        ></v-text-field>
      </template>

      <template v-else>
        <img src="/icon.svg" alt="Logo" height="32" class="mr-3" />

        <v-spacer></v-spacer>

        <v-btn
          icon="mdi-magnify"
          variant="text"
          density="comfortable"
          rounded="lg"
          class="mr-2"
          @click="isSearchActive = true"
        ></v-btn>

        <v-btn
          v-if="isAuthenticated"
          icon
          variant="text"
          density="comfortable"
          rounded="lg"
          to="/playlist"
        >
          <v-badge
            :content="playlistCount"
            :model-value="playlistCount > 0"
            color="primary"
          >
            <v-icon>mdi-playlist-music</v-icon>
          </v-badge>
        </v-btn>

        <UserAuth class="ml-2" />
      </template>
    </v-container>
  </v-app-bar>

  <v-container fluid class="pa-3">
    <div v-if="SongsRepository.loading.value && songs.length === 0" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <!-- Main List -->
      <v-row dense>
        <v-col cols="12" v-for="song in filteredSongs" :key="song.id" class="py-2">
          <SongCard
            :song="song"
            :is-in-playlist="isInPlaylist(song.id)"
            @toggle-playlist="handleTogglePlaylist"
            @share="handleShare"
          />
        </v-col>

        <v-col v-if="filteredSongs.length === 0" cols="12">
          <div class="text-center mt-4">
            No songs found.
          </div>
        </v-col>
      </v-row>
    </div>
    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SongsRepository from '../services/SongsRepository';
import PlaylistRepository from '../services/PlaylistRepository';
import { usePlaylist } from '../composables/usePlaylist';
import { useAuth } from '../composables/useAuth';
import { useShare } from '../composables/useShare';
import SongCard from '../components/SongCard.vue';
import UserAuth from '../components/UserAuth.vue';

const { isAuthenticated } = useAuth();
const songs = SongsRepository.songs;
const search = ref('');
const { playlist, togglePlaylist, isInPlaylist } = usePlaylist();
const { share } = useShare();
const isSearchActive = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');

const playlistCount = computed(() => playlist.value.length);

const closeSearch = () => {
  isSearchActive.value = false;
  search.value = '';
};

const handleTogglePlaylist = (songId) => {
  const wasInPlaylist = isInPlaylist(songId);
  togglePlaylist(songId);
  snackbarText.value = wasInPlaylist ? 'Removed from playlist' : 'Added to playlist';
  snackbar.value = true;
};

const handleShare = async (song) => {
  const url = `${window.location.origin}/song/${song.id}`;
  const result = await share(song.title, url);

  if (result.copied) {
    snackbarText.value = 'Link copied to clipboard';
    snackbar.value = true;
  }
};

const filteredSongs = computed(() => {
  if (!search.value) return songs.value;
  const term = search.value.toLowerCase();
  return songs.value.filter(song =>
    song.title.toLowerCase().includes(term) ||
    song.content.toLowerCase().includes(term)
  );
});

onMounted(() => {
  PlaylistRepository.initialize();
});
</script>
