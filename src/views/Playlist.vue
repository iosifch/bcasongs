<template>
  <div>
    <v-container fluid class="pa-3">
      <div v-if="SongsRepository.loading.value && playlistSongs.length === 0" class="d-flex justify-center my-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="playlistSongs.length === 0" class="text-center mt-4 text-medium-emphasis">
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
          class="d-flex align-center mb-3"
        >
          <v-icon class="drag-handle mr-2 cursor-move text-medium-emphasis">drag_indicator</v-icon>
          <SongCard
            :song="song"
            :is-in-playlist="true"
            @toggle-playlist="handleTogglePlaylist"
            @share="handleShare"
            class="flex-grow-1"
          />
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

<script setup>
import { ref, computed } from 'vue';
import SongsRepository from '../services/SongsRepository';
import { usePlaylist } from '../composables/usePlaylist';
import { useShare } from '../composables/useShare';
import SongCard from '../components/SongCard.vue';
import { VueDraggable } from 'vue-draggable-plus';

const songs = SongsRepository.songs;
const { playlist, togglePlaylist, isInPlaylist, reorderPlaylist } = usePlaylist();
const { share } = useShare();
const snackbar = ref(false);
const snackbarText = ref('');

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

const playlistModel = computed({
  get: () => {
    return playlist.value
      .map(id => songs.value.find(s => s.id === id))
      .filter(Boolean);
  },
  set: (val) => {
    reorderPlaylist(val.map(s => s.id));
  }
});

const playlistSongs = computed(() => {
  return playlistModel.value;
});
</script>
