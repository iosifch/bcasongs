<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="400"
    color="background"
  >
    <v-toolbar color="secondary-container" elevation="2">
      <v-toolbar-title class="text-h6 font-weight-bold">Your Playlist</v-toolbar-title>
      <template v-slot:append>
        <v-btn
          icon="mdi-share-variant"
          variant="text"
          density="comfortable"
          rounded="lg"
          class="mr-2"
          @click="sharePlaylist"
          title="Share Playlist"
        ></v-btn>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          rounded="lg"
          @click="drawer = false"
        ></v-btn>
      </template>
    </v-toolbar>

    <div class="pa-3">
      <div v-if="playlistSongs.length === 0" class="text-center mt-4 text-medium-emphasis">
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
    </div>
  </v-navigation-drawer>

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
          icon
          variant="text"
          density="comfortable"
          rounded="lg"
          @click="drawer = !drawer"
        >
          <v-badge
            :content="playlistSongs.length"
            :model-value="playlistSongs.length > 0"
            color="primary"
          >
            <v-icon>mdi-bookmark-multiple</v-icon>
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongsRepository from '../services/SongsRepository';
import { usePlaylist } from '../composables/usePlaylist';
import { useShare } from '../composables/useShare';
import SongCard from '../components/SongCard.vue';
import UserAuth from '../components/UserAuth.vue';
import { VueDraggable } from 'vue-draggable-plus';

const songs = SongsRepository.songs;
const search = ref('');
const { playlist, togglePlaylist, isInPlaylist, reorderPlaylist, replacePlaylist } = usePlaylist();
const { share } = useShare();
const route = useRoute();
const router = useRouter();
const drawer = ref(false);
const isSearchActive = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const importDialog = ref(false);
const pendingPlaylist = ref([]);

const closeSearch = () => {
  isSearchActive.value = false;
  search.value = '';
};

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

  const url = `${window.location.origin}/?playlist=${playlist.value.join(',')}`;
  const result = await share('My Playlist', url);

  if (result.copied) {
    snackbarText.value = 'Playlist link copied to clipboard';
    snackbar.value = true;
  }
};

const confirmImport = async () => {
  replacePlaylist(pendingPlaylist.value);
  importDialog.value = false;

  // Clear the playlist query parameter from URL
  const query = { ...route.query };
  delete query.playlist;
  router.replace({ query });

  snackbarText.value = 'Playlist imported successfully';
  snackbar.value = true;

  // Open drawer after dialog has closed (nextTick + short delay for dialog transition)
  await nextTick();
  setTimeout(() => { drawer.value = true; }, 150);
};

onMounted(async () => {
  // Check for playlist in query params (IDs are strings to match song.id from JSON)
  if (route.query.playlist) {
    const ids = route.query.playlist.split(',').map(id => id.trim()).filter(Boolean);
    if (ids.length > 0) {
      pendingPlaylist.value = ids;
      importDialog.value = true;
    }
  }
});

const playlistModel = computed({
  get: () => {
    // Map IDs to song objects, maintaining order
    return playlist.value
      .map(id => songs.value.find(s => s.id === id))
      .filter(Boolean); // Filter out any undefined if ID not found
  },
  set: (val) => {
    reorderPlaylist(val.map(s => s.id));
  }
});

const playlistSongs = computed(() => {
  return playlistModel.value;
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
/* No custom styles needed for drawer */
</style>
