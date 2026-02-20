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
          icon
          variant="tonal"
          color="surface-variant"
          density="comfortable"
          rounded="lg"
          style="width: 32px; height: 32px; min-width: 32px;"
          class="mr-2"
          @click.prevent="emit('toggle-playlist', song.id)"
        >
          <v-icon :color="isInPlaylist ? 'primary' : 'inherit'" size="20">
            {{ isInPlaylist ? 'playlist_remove' : 'playlist_add' }}
          </v-icon>
        </v-btn>

        <v-btn
          icon
          variant="tonal"
          color="surface-variant"
          density="comfortable"
          rounded="lg"
          style="width: 32px; height: 32px; min-width: 32px;"
          @click.prevent="emit('share', song)"
        >
          <v-icon size="20">share</v-icon>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';

const { isAuthenticated } = useAuth();

defineProps({
  song: {
    type: Object,
    required: true
  },
  isInPlaylist: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-playlist', 'share']);
</script>
