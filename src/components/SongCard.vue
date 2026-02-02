<template>
  <v-card 
    :to="{ name: 'SongDetail', params: { id: song.id } }"
    color="surface"
    class="rounded-lg transition-swing"
    hover
  >
    <v-card-text class="d-flex align-center justify-space-between py-4">
      <div class="font-weight-regular text-h6 text-truncate mr-2 flex-grow-1">
        {{ song.title }}
      </div>
      
      <div class="d-flex align-center">
        <v-chip
          v-if="song.bookNumber"
          color="tertiary"
          variant="outlined"
          size="small"
          class="font-weight-bold px-2 mr-2"
          label
        >
          {{ song.bookNumber }}
        </v-chip>

        <v-chip
          color="secondary"
          variant="outlined"
          size="small"
          class="font-weight-bold px-2 mr-2"
          label
        >
          {{ song.originalKey }}
        </v-chip>

        <v-chip
          :color="isShortlisted ? 'primary' : 'grey'"
          variant="outlined"
          size="small"
          class="px-2"
          label
          @click.prevent="emit('toggle-shortlist', song.id)"
        >
          <v-icon size="small">
            {{ isShortlisted ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
          </v-icon>
        </v-chip>
      </div>
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
