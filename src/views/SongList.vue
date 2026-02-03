<template>
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    width="400"
    color="background"
  >
    <v-toolbar color="secondary-container" elevation="2">
      <v-toolbar-title class="text-h6 font-weight-bold">Your Shortlist</v-toolbar-title>
      <template v-slot:append>
        <v-btn 
          icon="mdi-share-variant" 
          variant="text" 
          density="comfortable" 
          rounded="lg" 
          class="mr-2"
          @click="shareShortlist"
          title="Share Shortlist"
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
      <div v-if="shortlistedSongs.length === 0" class="text-center mt-4 text-medium-emphasis">
        No songs in shortlist.
      </div>
      
      <VueDraggable
        v-else
        v-model="shortlistModel"
        :animation="150"
        handle=".drag-handle"
      >
        <div 
          v-for="song in shortlistModel" 
          :key="song.id" 
          class="d-flex align-center mb-3"
        >
          <v-icon class="drag-handle mr-2 cursor-move text-medium-emphasis">mdi-drag</v-icon>
          <SongCard 
            :song="song" 
            :is-shortlisted="true"
            @toggle-shortlist="toggleShortlist"
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
            :content="shortlistedSongs.length"
            :model-value="shortlistedSongs.length > 0"
            color="primary"
          >
            <v-icon>mdi-bookmark-multiple</v-icon>
          </v-badge>
        </v-btn>
      </template>
    </v-container>
  </v-app-bar>

  <v-container fluid class="pa-3">
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else>
      <!-- Main List -->
      <v-row dense>
        <v-col cols="12" v-for="song in filteredSongs" :key="song.id" class="py-2">
          <SongCard 
            :song="song" 
            :is-shortlisted="isInShortlist(song.id)"
            @toggle-shortlist="toggleShortlist"
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
        <v-card-title class="text-h6">Import Shortlist</v-card-title>
        <v-card-text>
          Do you want to replace your current shortlist with the shared one?
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
import MusicService from '../services/MusicService';
import { useShortlist } from '../composables/useShortlist';
import { useShare } from '../composables/useShare';
import SongCard from '../components/SongCard.vue';
import { VueDraggable } from 'vue-draggable-plus';

const songs = ref([]);
const search = ref('');
const loading = ref(true);
const { shortlist, toggleShortlist, isInShortlist, reorderShortlist, replaceShortlist } = useShortlist();
const { share } = useShare();
const route = useRoute();
const router = useRouter();
const drawer = ref(false);
const isSearchActive = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const importDialog = ref(false);
const pendingShortlist = ref([]);

const closeSearch = () => {
  isSearchActive.value = false;
  search.value = '';
};

const handleShare = async (song) => {
  // Construct the URL for the song detail page
  const url = `${window.location.origin}/song/${song.id}`;
  const result = await share(song.title, url);
  
  if (result.copied) {
    snackbarText.value = 'Link copied to clipboard';
    snackbar.value = true;
  }
};

const shareShortlist = async () => {
  if (shortlist.value.length === 0) {
    snackbarText.value = 'Shortlist is empty';
    snackbar.value = true;
    return;
  }
  
  const url = `${window.location.origin}/?shortlist=${shortlist.value.join(',')}`;
  const result = await share('My Song Shortlist', url);
  
  if (result.copied) {
    snackbarText.value = 'Shortlist link copied to clipboard';
    snackbar.value = true;
  }
};

const confirmImport = async () => {
  replaceShortlist(pendingShortlist.value);
  importDialog.value = false;
  
  // Clear the shortlist query parameter from URL
  const query = { ...route.query };
  delete query.shortlist;
  router.replace({ query });
  
  snackbarText.value = 'Shortlist imported successfully';
  snackbar.value = true;
  
  // Open drawer after dialog has closed (nextTick + short delay for dialog transition)
  await nextTick();
  setTimeout(() => { drawer.value = true; }, 150);
};

onMounted(async () => {
  try {
    songs.value = await MusicService.getSongs();
    
    // Check for shortlist in query params (IDs are strings to match song.id from JSON)
    if (route.query.shortlist) {
      const ids = route.query.shortlist.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        pendingShortlist.value = ids;
        importDialog.value = true;
      }
    }
  } finally {
    loading.value = false;
  }
});

const shortlistModel = computed({
  get: () => {
    // Map IDs to song objects, maintaining order
    return shortlist.value
      .map(id => songs.value.find(s => s.id === id))
      .filter(Boolean); // Filter out any undefined if ID not found
  },
  set: (val) => {
    reorderShortlist(val.map(s => s.id));
  }
});

const shortlistedSongs = computed(() => {
  // Keep this for read-only usage if needed, or replace usage with shortlistModel
  return shortlistModel.value; 
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
