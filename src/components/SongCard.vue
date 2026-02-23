<template>
  <v-card
    :to="{ name: 'SongDetail', params: { id: song.id } }"
    color="surface"
    class="rounded-lg transition-swing mx-3 mt-3"
    hover
  >
    <v-card-text class="py-3 px-3">
      <div class="font-weight-regular text-h6 text-truncate mb-1">
        {{ song.title }}
      </div>

      <div class="d-flex align-center">
        <v-chip
          v-if="song.originalKey"
          color="outline"
          variant="outlined"
          size="small"
          class="mr-2 font-weight-bold text-on-surface-variant text-none"
        >
          {{ song.originalKey }}
        </v-chip>

        <v-chip
          v-if="song.bookNumber"
          color="outline"
          variant="outlined"
          size="small"
          class="font-weight-bold text-on-surface-variant"
        >
          #{{ song.bookNumber }}
        </v-chip>

        <v-spacer></v-spacer>

        <v-btn
          v-if="isAuthenticated"
          :icon="isInPlaylist ? 'playlist_remove' : 'playlist_add'"
          variant="tonal"
          :color="isInPlaylist ? 'primary' : 'inherit'"
          density="comfortable"
          rounded="lg"
          size="small"
          class="mr-2"
          @click.prevent="emit('toggle-playlist', song.id)"
        >
        </v-btn>

        <v-btn
          icon="share"
          variant="tonal"
          color="surface-variant"
          density="comfortable"
          rounded="lg"
          size="small"
          @click.prevent="emit('share', song)"
        >
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
import type { Song } from '../services/SongsRepository';

const { isAuthenticated } = useAuth();

defineProps<{
  song: Song;
  isInPlaylist?: boolean;
}>();

const emit = defineEmits<{
  'toggle-playlist': [id: string];
  'share': [song: Song];
}>();
</script>
