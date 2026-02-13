<template>
  <v-app>
    <v-app-bar flat color="transparent" :elevation="0">
      <v-container class="pa-0 fill-height d-flex align-center px-3">
        <!-- SongList View Header -->
        <template v-if="route.name === 'SongList' || route.path === '/'">
          <img src="/icon.svg" alt="Logo" height="36" class="mr-3" />

          <v-text-field
            v-model="search"
            placeholder="Search songs..."
            variant="solo"
            bg-color="surface"
            hide-details
            density="comfortable"
            rounded="xl"
            single-line
            class="flex-grow-1 mr-2"
          ></v-text-field>

          <v-btn
            v-if="isAuthenticated"
            icon
            variant="text"
            rounded="xl"
            to="/playlist"
            class="mr-2"
            size="large"
          >
            <v-badge
              :content="playlistCount"
              :model-value="playlistCount > 0"
              color="primary"
            >
              <v-icon size="large">queue_music</v-icon>
            </v-badge>
          </v-btn>

          <UserAuth size="large" :avatar-size="32" />
        </template>

        <!-- SongDetail View Header -->
        <template v-else-if="route.name === 'SongDetail'">
          <v-btn
            icon
            variant="text"
            to="/"
            class="mr-2"
            density="comfortable"
            rounded="xl"
            size="large"
          >
             <v-icon size="large">arrow_back</v-icon>
          </v-btn>

          <v-spacer></v-spacer>
          
          <v-btn
            variant="tonal"
            color="surface-variant"
            @click="cycleFontSize"
            title="Change Font Size"
            class="mr-1"
            density="comfortable"
            min-width="40"
            width="40"
            height="40"
            rounded="lg"
            :ripple="false"
            style="padding: 0;"
          >
            <v-icon>format_size</v-icon>
          </v-btn>

          <v-btn
            variant="tonal"
            color="surface-variant"
            @click="shareSong"
            title="Share Song"
            class="mr-1"
            density="comfortable"
            min-width="40"
            width="40"
            height="40"
            rounded="lg"
            :ripple="false"
            style="padding: 0;"
          >
            <v-icon>share</v-icon>
          </v-btn>

          <v-btn
            v-if="isAuthenticated"
            variant="tonal"
            :color="isEditMode ? 'primary' : 'surface-variant'"
            @click="toggleEditMode"
            title="Edit Mode"
            class="mr-1"
            density="comfortable"
            min-width="40"
            width="40"
            height="40"
            rounded="lg"
            :ripple="false"
            style="padding: 0;"
          >
             <v-icon>{{ isEditMode ? 'check' : 'edit_document' }}</v-icon>
          </v-btn>

          <v-btn
            v-if="isAuthenticated"
            variant="tonal"
            :color="songInPlaylist ? 'primary' : 'surface-variant'"
            @click="handleTogglePlaylist"
            class="mr-2"
            title="Toggle Playlist"
            density="comfortable"
            min-width="40"
            width="40"
            height="40"
            rounded="lg"
            :ripple="false"
            style="padding: 0;"
          >
             <v-icon>{{ songInPlaylist ? 'playlist_remove' : 'playlist_add' }}</v-icon>
          </v-btn>
        </template>

        <!-- Playlist View Header -->
        <template v-else-if="route.name === 'Playlist'">
          <v-btn
            icon
            variant="text"
            to="/"
            class="mr-2"
            density="comfortable"
            rounded="xl"
            size="large"
          >
            <v-icon size="large">arrow_back</v-icon>
          </v-btn>

          <v-spacer></v-spacer>
        </template>

        <!-- Fallback/Default Header -->
        <template v-else>
           <v-btn
            icon
            variant="text"
            to="/"
            class="mr-2"
            density="comfortable"
            rounded="xl"
            size="large"
          >
             <v-icon size="large">arrow_back</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
        </template>
      </v-container>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import SongsRepository from './services/SongsRepository';
import PlaylistRepository from './services/PlaylistRepository';
import UserAuth from './components/UserAuth.vue';
import { useSearch } from './composables/useSearch';
import { usePlaylist } from './composables/usePlaylist';
import { useAuth } from './composables/useAuth';
import { useSongSettings } from './composables/useSongSettings';
import { useCurrentSong } from './composables/useCurrentSong';
import { useShare } from './composables/useShare';

const route = useRoute();
const { search } = useSearch();
const { playlist, togglePlaylist, isInPlaylist } = usePlaylist();
const { isAuthenticated } = useAuth();
const { cycleFontSize } = useSongSettings();
const { currentSong, isEditMode, toggleEditMode } = useCurrentSong();
const { share } = useShare();

const playlistCount = computed(() => playlist.value.length);
const songInPlaylist = computed(() => currentSong.value ? isInPlaylist(currentSong.value.id) : false);

const handleTogglePlaylist = () => {
  if (!currentSong.value) return;
  togglePlaylist(currentSong.value.id);
};

const shareSong = async () => {
    if (!currentSong.value) return;
    await share(currentSong.value.title, window.location.href);
};

onMounted(() => {
  SongsRepository.initialize();
  PlaylistRepository.initialize();
});
</script>
