<template>
  <v-app-bar flat color="background" class="px-2">
      <v-btn
        icon="chevron_left"
        variant="tonal"
        color="surface-variant"
        @click="goBack"
        class="mr-2"
        density="comfortable"
        rounded="lg"
      >
      </v-btn>

      <v-app-bar-title class="text-h7 font-weight-regular text-truncate ml-0 pl-0">
        Playlist
      </v-app-bar-title>
  </v-app-bar>

  <div>
    <v-container fluid class="pa-0 d-flex flex-column flex-grow-1">
      <div v-if="loading && playlistModel.length === 0" class="d-flex justify-center my-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="playlistModel.length === 0" class="text-center mt-4 text-medium-emphasis">
        No songs in playlist.
      </div>

      <VueDraggable
        v-else
        v-model="playlistModel"
        :animation="150"
        handle=".drag-handle"
      >
        <div
          v-for="song in playlistModel"
          :key="song.id"
          class="d-flex align-center"
        >
          <SongCard
            :song="song"
            :is-in-playlist="true"
            @toggle-playlist="handleTogglePlaylist"
            @share="handleShare"
            class="flex-grow-1"
          />
          <v-icon class="drag-handle cursor-move text-medium-emphasis mr-2" icon="drag_indicator"></v-icon>
        </div>
      </VueDraggable>
    </v-container>

    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useSongActions } from '../composables/useSongActions';
import { usePlaylistSongs } from '../composables/usePlaylistSongs';
import { useAppNavigation } from '../composables/useAppNavigation';
import SongCard from '../components/SongCard.vue';
import { VueDraggable } from 'vue-draggable-plus';

const { snackbar, snackbarText, handleTogglePlaylist, handleShare } = useSongActions();
const { playlistModel, loading } = usePlaylistSongs();
const { goBack } = useAppNavigation();
</script>
