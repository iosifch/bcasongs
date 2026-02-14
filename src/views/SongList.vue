<template>
  <v-app-bar flat color="background" :elevation="0" scroll-behavior="hide" scroll-threshold="150">
    <v-container class="pa-0 fill-height d-flex align-center px-3">
      <v-text-field
        v-model="search"
        placeholder="Search songs..."
        variant="solo"
        bg-color="surface"
        hide-details
        density="comfortable"
        rounded="xl"
        single-line
        prepend-inner-icon="search"
        class="flex-grow-1"
      ></v-text-field>

      <v-btn
        v-if="!isAuthenticating && isAuthenticated"
        icon
        variant="tonal"
        color="surface-variant"
        rounded="lg"
        to="/playlist"
        class="ml-2"
        size="large"
        density="comfortable"
        style="width: 40px; height: 40px; min-width: 40px;"
      >
        <v-badge
          :content="playlistCount"
          :model-value="playlistCount > 0"
          color="primary"
        >
          <v-icon size="25">queue_music</v-icon>
        </v-badge>
      </v-btn>

      <UserAuth size="large" :avatar-size="32" class="ml-2" />
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
import { ref, computed } from 'vue';
import SongsRepository from '../services/SongsRepository';
import { usePlaylist } from '../composables/usePlaylist';
import { useAuth } from '../composables/useAuth';
import { useShare } from '../composables/useShare';
import { useSearch } from '../composables/useSearch';
import SongCard from '../components/SongCard.vue';
import UserAuth from '../components/UserAuth.vue';

const { isAuthenticated, isAuthenticating } = useAuth();
const songs = SongsRepository.songs;
const { search } = useSearch();
const { playlist, togglePlaylist, isInPlaylist } = usePlaylist();
const { share } = useShare();
const snackbar = ref(false);
const snackbarText = ref('');

const playlistCount = computed(() => playlist.value.length);

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
</script>
