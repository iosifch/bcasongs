<template>
  <div>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <div v-else-if="song">

      <div class="song-content px-2 mt-4">
        <div v-for="(paragraph, pIndex) in paragraphs" :key="paragraph.id" class="mb-4">
          <v-card 
            :variant="isEditMode ? 'elevated' : 'text'"
            density="compact"
            :class="[
              { 
                'chorus-style': !isEditMode && paragraph.type === 'chorus',
                'coda-style': !isEditMode && paragraph.type === 'coda'
              }
            ]"
          >
            <v-card-text :class="{ 'py-0': !isEditMode, 'px-2': true }">
              <div 
                v-for="(line, lineIndex) in paragraph.lines" 
                :key="lineIndex"
                class="song-line mb-1"
                :class="{ 'lyrics-mode': !showChords }"
              >
                <div 
                  v-for="(segment, segIndex) in line.segments" 
                  :key="segIndex" 
                  class="song-segment"
                  :class="{ 'mr-1': showChords }"
                >
                  <div v-if="showChords" class="chord font-weight-bold">
                    {{ segment.chord || '&nbsp;' }}
                  </div>
                  <div class="lyrics" :class="fontSizeClass">
                    {{ segment.text }}
                  </div>
                </div>
              </div>
            </v-card-text>

            <v-card-actions v-if="isEditMode" class="pt-0">
              <v-btn-toggle
                v-model="paragraph.type"
                mandatory
                color="primary"
                variant="text"
                density="comfortable"
              >
                <v-btn value="verse" size="small">Strofă</v-btn>
                <v-btn value="chorus" size="small">Refren</v-btn>
                <v-btn value="coda" size="small">Coda</v-btn>
              </v-btn-toggle>
            </v-card-actions>
          </v-card>
        </div>
      </div>
    </div>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error" text="Song not found"></v-alert>
      </v-col>
    </v-row>

    <div class="bottom-actions d-flex justify-center pa-2">
      <v-btn-group variant="outlined" density="comfortable" rounded="lg" divided>


        <v-btn @click="cycleFontSize" title="Change Font Size">
          <v-icon>format_size</v-icon>
        </v-btn>

        <v-btn @click="isEditMode = !isEditMode" :color="isEditMode ? 'primary' : undefined" title="Edit Mode">
          <v-icon>{{ isEditMode ? 'check' : 'edit_document' }}</v-icon>
        </v-btn>

        <v-btn @click="shareSong" title="Share Song">
          <v-icon>share</v-icon>
        </v-btn>

        <v-btn v-if="isAuthenticated" @click="handleTogglePlaylist" :color="songInPlaylist ? 'primary' : undefined" title="Toggle Playlist">
          <v-icon>{{ songInPlaylist ? 'playlist_remove' : 'playlist_add' }}</v-icon>
        </v-btn>
      </v-btn-group>
    </div>

    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import SongsRepository from '../services/SongsRepository';
import ChordProService from '../services/ChordProService';

import { useShare } from '../composables/useShare';
import { usePlaylist } from '../composables/usePlaylist';
import { useAuth } from '../composables/useAuth';
import { useSongSettings } from '../composables/useSongSettings';

const route = useRoute();
const song = ref(null);
const { playlist, togglePlaylist, isInPlaylist } = usePlaylist();
const { isAuthenticated } = useAuth();
const { fontSizeClass, cycleFontSize } = useSongSettings();

const playlistCount = computed(() => playlist.value.length);
const songInPlaylist = computed(() => song.value ? isInPlaylist(song.value.id) : false);
const loading = ref(true);
const paragraphs = ref([]);
const isEditMode = ref(false);
const showChords = ref(false);
const snackbar = ref(false);
const snackbarText = ref('');
const { share } = useShare();

const shareSong = async () => {
  if (!song.value) return;

  const result = await share(song.value.title, window.location.href);
  
  if (result.copied) {
    snackbarText.value = 'Link copied to clipboard';
    snackbar.value = true;
  }
};

const handleTogglePlaylist = () => {
  if (!song.value) return;
  const wasInPlaylist = isInPlaylist(song.value.id);
  togglePlaylist(song.value.id);
  snackbarText.value = wasInPlaylist ? 'Removed from playlist' : 'Added to playlist';
  snackbar.value = true;
};
watch(isEditMode, async (newValue) => {
  if (!newValue && song.value && paragraphs.value.length > 0) {
    try {
      const newContent = ChordProService.serialize(paragraphs.value);
      await SongsRepository.save(song.value.id, newContent);
      snackbarText.value = 'Changes saved to cloud';
      snackbar.value = true;
    } catch (error) {
      console.error('Save failed:', error);
      snackbarText.value = 'Error saving: ' + (error.code === 'permission-denied' ? 'Permission Denied' : error.message);
      snackbar.value = true;
      // Optional: Revert to edit mode or keep user in view mode but warn them
      // keeping them in view mode allows them to copy text if needed, but they are unsaved.
    }
  }
});

const resolveSong = () => {
  const id = route.params.id;
  song.value = SongsRepository.getSong(id);
  if (song.value) {
    paragraphs.value = ChordProService.parseToParagraphs(song.value.content);
  }
  loading.value = false;
};

onMounted(() => {
  // If songs are already loaded, resolve immediately
  if (!SongsRepository.loading.value) {
    resolveSong();
  } else {
    // Wait for songs to finish loading
    const stopWatch = watch(
      () => SongsRepository.loading.value,
      (isLoading) => {
        if (!isLoading) {
          resolveSong();
          stopWatch();
        }
      }
    );
  }
});
</script>

<style scoped>
.lyrics-text-1 {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}

.lyrics-text-2 {
  font-size: 1.25rem; /* 20px */
  line-height: 1.6;
  font-weight: 400;
}

.lyrics-text-3 {
  font-size: 1.375rem; /* 22px */
  line-height: 1.6;
  font-weight: 400;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
}

.song-line {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end; /* Align text to bottom so chords float above */
}

.song-line.lyrics-mode {
  display: block;
}

.song-segment {
  display: flex;
  flex-direction: column;
  /* Ensure chords stay above their text */
}

.song-line.lyrics-mode .song-segment {
  display: inline;
}

.chord {
  min-height: 1.5em; /* Reserve space for chords even if empty (handled by &nbsp;) */
  line-height: 1.5;
}

.lyrics {
  white-space: pre-wrap; /* Preserve spaces in lyrics */
  line-height: 1.5;
}
.song-line.lyrics-mode .lyrics {
  display: inline;
}

.chorus-style {
  font-style: italic;
  padding-left: 16px !important;
}

.coda-style {
  border-left: 2px solid #9E9E9E !important;
  border-radius: 0 !important;
  padding-left: 0 !important;
}

.action-buttons :deep(.v-btn) {
  padding: 0 4px;
  min-width: 32px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-background));
}

.song-content {
  padding-bottom: 64px;
}
</style>
