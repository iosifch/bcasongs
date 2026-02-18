<template>
  <v-app-bar flat color="background" :elevation="0" scroll-behavior="hide" scroll-threshold="150">
    <v-container class="pa-0 fill-height d-flex align-center px-3">
      <v-text-field
        v-model="localSearch"
        placeholder="Search songs..."
        variant="solo"
        bg-color="surface"
        hide-details
        density="comfortable"
        rounded="xl"
        single-line
        prepend-inner-icon="search"
        class="flex-grow-1"
        @update:model-value="debouncedUpdateSearch"
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
          <v-icon size="25" icon="queue_music"></v-icon>
        </v-badge>
      </v-btn>

      <UserAuth size="large" :avatar-size="32" class="ml-2" />
    </v-container>
  </v-app-bar>

  <v-container fluid class="py-1 px-2 h-100 d-flex flex-column">
    <div v-if="loading && songs.length === 0" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else class="flex-grow-1" style="min-height: 0;">
      <v-virtual-scroll
        v-if="songs.length > 0"
        :items="songs"
        height="100%"
        item-height="100"
      >
        <template v-slot:default="{ item }">
          <div class="pb-2 px-1">
            <SongCard
              :song="item"
              :is-in-playlist="isInPlaylist(item.id)"
              @toggle-playlist="handleTogglePlaylist"
              @share="handleShare"
            />
          </div>
        </template>
      </v-virtual-scroll>

      <div v-else class="text-center mt-4 text-medium-emphasis">
        No songs found.
      </div>
    </div>

    <v-btn
      v-if="isAuthenticated"
      color="primary"
      icon="add"
      size="large"
      position="fixed"
      location="bottom right"
      class="ma-4 mb-8"
      to="/song/new"
      elevation="4"
      style="z-index: 100;"
    ></v-btn>

    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
defineOptions({ name: 'SongList' });

import { ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { usePlaylist } from '../composables/usePlaylist';
import { useSongActions } from '../composables/useSongActions';
import { useSongs } from '../composables/useSongs';
import SongCard from '../components/SongCard.vue';
import UserAuth from '../components/UserAuth.vue';

const { isAuthenticated, isAuthenticating } = useAuth();
const { songs, search, loading } = useSongs();
const { isInPlaylist, playlistCount } = usePlaylist();
const { snackbar, snackbarText, handleTogglePlaylist, handleShare } = useSongActions();

// Debounced Search Implementation
const localSearch = ref(search.value);

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const updateSearch = (value) => {
  search.value = value;
};

const debouncedUpdateSearch = debounce(updateSearch, 300);

// Sync localSearch if search changes externally (e.g. cleared)
watch(search, (newValue) => {
  if (localSearch.value !== newValue) {
    localSearch.value = newValue;
  }
});
</script>
