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
            icon="arrow_back"
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
            v-if="isAuthenticated"
            icon
            variant="text"
            to="/playlist"
            class="mr-2"
            size="large"
            rounded="xl"
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

        <!-- Playlist View Header -->
        <template v-else-if="route.name === 'Playlist'">
          <v-btn
            icon="arrow_back"
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

          <UserAuth size="large" :avatar-size="32" />
        </template>

        <!-- Fallback/Default Header -->
        <template v-else>
           <v-btn
            icon="arrow_back"
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
          <UserAuth size="large" :avatar-size="32" />
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

const route = useRoute();
const { search } = useSearch();
const { playlist } = usePlaylist();
const { isAuthenticated } = useAuth();

const playlistCount = computed(() => playlist.value.length);

onMounted(() => {
  SongsRepository.initialize();
  PlaylistRepository.initialize();
});
</script>
