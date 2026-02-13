<template>
  <div>
    <v-app-bar color="secondary-container" elevation="2">
      <v-container class="pa-0 fill-height d-flex align-center px-3">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          to="/"
          class="mr-2"
          density="comfortable"
          rounded="lg"
        ></v-btn>

        <v-app-bar-title class="text-h6 font-weight-bold ml-0">
          Your Playlist
        </v-app-bar-title>

        <v-btn
          icon="mdi-share-variant"
          variant="text"
          density="comfortable"
          rounded="lg"
          class="mr-2"
          @click="sharePlaylist"
          title="Share Playlist"
        ></v-btn>

        <UserAuth />
      </v-container>
    </v-app-bar>

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
          <v-icon class="drag-handle mr-2 cursor-move text-medium-emphasis">mdi-drag</v-icon>
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

    <v-dialog v-model="importDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Import Playlist</v-card-title>
        <v-card-text>
          Do you want to replace your current playlist with the shared one?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="importDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="confirmImport">Replace</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongsRepository from '../services/SongsRepository';
import { usePlaylist } from '../composables/usePlaylist';
import { useShare } from '../composables/useShare';
import SongCard from '../components/SongCard.vue';
import UserAuth from '../components/UserAuth.vue';
import { VueDraggable } from 'vue-draggable-plus';

const songs = SongsRepository.songs;
const { playlist, togglePlaylist, isInPlaylist, reorderPlaylist, replacePlaylist } = usePlaylist();
const { share } = useShare();
const route = useRoute();
const router = useRouter();
const snackbar = ref(false);
const snackbarText = ref('');
const importDialog = ref(false);
const pendingPlaylist = ref([]);

const handleTogglePlaylist = (songId) => {
  togglePlaylist(songId);
  const added = isInPlaylist(songId);
  snackbarText.value = added ? 'Added to playlist' : 'Removed from playlist';
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

const sharePlaylist = async () => {
  if (playlist.value.length === 0) {
    snackbarText.value = 'Playlist is empty';
    snackbar.value = true;
    return;
  }

  const url = `${window.location.origin}/playlist?import=${playlist.value.join(',')}`;
  const result = await share('My Playlist', url);

  if (result.copied) {
    snackbarText.value = 'Playlist link copied to clipboard';
    snackbar.value = true;
  }
};

const confirmImport = async () => {
  replacePlaylist(pendingPlaylist.value);
  importDialog.value = false;

  const query = { ...route.query };
  delete query.import;
  router.replace({ query });

  snackbarText.value = 'Playlist imported successfully';
  snackbar.value = true;
};

onMounted(() => {
  SongsRepository.initialize();

  if (route.query.import) {
    const ids = route.query.import.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length > 0) {
      pendingPlaylist.value = ids;
      importDialog.value = true;
    }
  }
});

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
