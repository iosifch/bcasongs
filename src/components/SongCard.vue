<template>
  <v-card
    :to="{ name: 'SongDetail', params: { id: song.id } }"
    color="surface"
    class="rounded-lg transition-swing"
    hover
  >
    <v-card-text class="py-3">
      <v-row no-gutters align="center" class="flex-nowrap">
        <v-col class="overflow-hidden mr-2">
          <div class="font-weight-regular text-h6 text-truncate">
            {{ song.title }}
          </div>

          <div class="d-flex align-center mt-1">
            <v-chip
              color="secondary"
              variant="tonal"
              size="x-small"
              class="font-weight-bold px-2"
              label
            >
              {{ song.originalKey }}
            </v-chip>

            <span v-if="song.bookNumber" class="text-caption text-medium-emphasis ml-2">
              #{{ song.bookNumber }}
            </span>
          </div>
        </v-col>

        <v-col cols="auto">
          <div class="d-flex align-center">
            <v-btn
              v-if="isAuthenticated"
              icon
              variant="text"
              density="comfortable"
              rounded="lg"
              @click.prevent="emit('toggle-playlist', song.id)"
            >
              <v-icon :color="isInPlaylist ? 'primary' : 'grey-lighten-1'">
                {{ isInPlaylist ? 'playlist_remove' : 'playlist_add' }}
              </v-icon>
            </v-btn>

            <v-btn
              icon
              variant="text"
              density="comfortable"
              rounded="lg"
              @click.prevent="emit('share', song)"
            >
              <v-icon color="grey-lighten-1">share</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
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
