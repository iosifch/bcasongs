<template>
  <v-card 
    :to="{ name: 'SongDetail', params: { id: song.id } }"
    color="surface"
    class="rounded-lg transition-swing"
    hover
  >
    <v-card-text class="d-flex align-center justify-space-between py-3">
      <div class="flex-grow-1 mr-2 min-width-0">
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
      </div>

      <v-btn
        icon
        variant="text"
        density="comfortable"
        @click.prevent="emit('toggle-shortlist', song.id)"
      >
        <v-icon :color="isShortlisted ? 'primary' : 'grey-lighten-1'">
          {{ isShortlisted ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
        </v-icon>
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  song: {
    type: Object,
    required: true
  },
  isShortlisted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-shortlist']);
</script>
