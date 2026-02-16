<template>
  <v-app-bar flat color="background" :elevation="0" scroll-behavior="hide" scroll-threshold="150">
    <v-container class="pa-0 fill-height d-flex align-center px-3">
      <v-btn
        icon
        variant="tonal"
        color="surface-variant"
        @click="goBack"
        class="mr-2"
        density="comfortable"
        rounded="lg"
        style="width: 40px; height: 40px; min-width: 40px;"
      >
        <v-icon size="25">arrow_back</v-icon>
      </v-btn>

      <v-chip
        v-if="song?.bookNumber"
        color="outline"
        variant="outlined"
        size="small"
        class="ml-1 font-weight-bold text-on-surface-variant"
      >
        #{{ song.bookNumber }}
      </v-chip>

      <template v-if="!isAuthenticating">
        <v-chip
          v-if="song?.originalKey && !isAuthenticated"
          data-testid="key-chip"
          color="outline"
          variant="outlined"
          size="small"
          class="ml-2 font-weight-bold text-on-surface-variant text-none"
        >
          {{ song.originalKey }}
        </v-chip>

        <v-btn
          v-else-if="song?.originalKey && isAuthenticated"
          data-testid="key-btn"
          variant="tonal"
          color="surface-variant"
          class="ml-2 font-weight-bold text-none"
          density="comfortable"
          min-width="40"
          height="40"
          rounded="lg"
          @click="openKeyDialog"
        >
          {{ song.originalKey }}
        </v-btn>
      </template>

      <v-spacer></v-spacer>
      
      <v-btn
        variant="tonal"
        color="surface-variant"
        @click="cycleFontSize"
        title="Change Font Size"
        class="ml-2"
        density="comfortable"
        min-width="40"
        width="40"
        height="40"
        rounded="lg"
        :ripple="false"
        :disabled="isEditMode"
        data-testid="font-size-btn"
        style="padding: 0;"
      >
        <v-icon size="25">format_size</v-icon>
      </v-btn>

      <v-btn
        variant="tonal"
        color="surface-variant"
        @click="handleShare"
        title="Share Song"
        class="ml-2"
        density="comfortable"
        min-width="40"
        width="40"
        height="40"
        rounded="lg"
        :ripple="false"
        style="padding: 0;"
      >
        <v-icon size="25">share</v-icon>
      </v-btn>

      <v-btn
        v-if="isAuthenticated"
        data-testid="edit-btn"
        variant="tonal"
        :color="isEditMode ? 'primary' : 'surface-variant'"
        @click="toggleEditMode"
        :disabled="isSaving"
        :loading="isSaving"
        title="Edit Mode"
        class="ml-2"
        density="comfortable"
        min-width="40"
        width="40"
        height="40"
        rounded="lg"
        :ripple="false"
        style="padding: 0;"
      >
        <v-icon size="25">{{ isEditMode ? 'check' : 'edit_document' }}</v-icon>
      </v-btn>

      <v-btn
        v-if="isAuthenticated"
        variant="tonal"
        :color="songInPlaylist ? 'primary' : 'surface-variant'"
        @click="handleTogglePlaylist"
        class="ml-2"
        title="Toggle Playlist"
        density="comfortable"
        min-width="40"
        width="40"
        height="40"
        rounded="lg"
        :ripple="false"
        style="padding: 0;"
      >
        <v-icon size="25">{{ songInPlaylist ? 'playlist_remove' : 'playlist_add' }}</v-icon>
      </v-btn>
    </v-container>
  </v-app-bar>

  <div>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <div v-else-if="song">
      <div class="song-content px-3 mt-4">
        <v-text-field
          v-if="isEditMode"
          v-model="editTitle"
          hide-details
          density="compact"
          class="mb-4"
          data-testid="title-input"
        ></v-text-field>

        <div v-for="(paragraph, pIndex) in paragraphs" :key="paragraph.id" class="mb-6">
          <div class="mb-2 d-flex align-center">
            <template v-if="isEditMode">
              <v-btn-toggle
                v-model="paragraph.type"
                mandatory
                density="compact"
                color="primary"
                variant="outlined"
                divided
                rounded="lg"
              >
                <v-btn value="verse" size="small" class="text-uppercase">Verse</v-btn>
                <v-btn value="chorus" size="small" class="text-uppercase">Chorus</v-btn>
                <v-btn value="coda" size="small" class="text-uppercase">Coda</v-btn>
              </v-btn-toggle>

              <v-spacer></v-spacer>

              <v-btn-group
                variant="outlined"
                density="compact"
                divided
                rounded="lg"
                class="ml-2"
              >
                <v-btn
                  size="small"
                  title="Add Above"
                  @click="addParagraph(pIndex, 'above')"
                  data-testid="add-above-btn"
                >
                  <v-icon>add_row_above</v-icon>
                </v-btn>
                <v-btn
                  size="small"
                  title="Add Below"
                  @click="addParagraph(pIndex, 'below')"
                  data-testid="add-below-btn"
                >
                  <v-icon>add_row_below</v-icon>
                </v-btn>
                <v-btn
                  size="small"
                  title="Delete Paragraph"
                  :disabled="paragraphs.length <= 1"
                  @click="removeParagraph(pIndex)"
                  data-testid="delete-paragraph-btn"
                >
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-btn-group>
            </template>
            <template v-else>
              <v-chip
                v-if="paragraph.type === 'chorus'"
                size="small"
                color="surface-variant"
                variant="tonal"
                class="text-uppercase"
                style="letter-spacing: 0.5px; opacity: 0.8;"
              >
                Chorus
              </v-chip>
              <v-chip
                v-else-if="paragraph.type === 'coda'"
                size="small"
                color="surface-variant"
                variant="tonal"
                class="text-uppercase"
                style="letter-spacing: 0.5px; opacity: 0.8;"
              >
                Coda
              </v-chip>
              <v-chip
                v-else
                size="small"
                color="surface-variant"
                variant="tonal"
                class="text-uppercase"
                style="letter-spacing: 0.5px; opacity: 0.8;"
              >
                Verse
              </v-chip>
            </template>
          </div>

          <v-textarea
            v-if="isEditMode"
            v-model="paragraph.editText"
            :ref="el => setTextareaRef(el, paragraph.id)"
            auto-grow
            hide-details
            rows="2"
            density="compact"
            data-testid="lyrics-textarea"
          ></v-textarea>
          <v-sheet v-else color="transparent">
            <div
              v-for="(line, lineIndex) in paragraph.lines"
              :key="lineIndex"
              class="lyrics mb-1"
              :class="fontSizeClass"
            >
              {{ line.text }}
            </div>
          </v-sheet>
        </div>
      </div>
    </div>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error" text="Song not found"></v-alert>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="keyDialog" max-width="320">
      <v-card rounded="xl" class="pa-4">
        <v-card-text class="pt-4">
          <div class="text-center text-h4 mb-6">
            {{ selectedRoot }}{{ selectedAccidental }}{{ selectedQuality }}
          </div>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedRoot"
                :items="['C', 'D', 'E', 'F', 'G', 'A', 'B']"
                label="Note"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                menu-icon="arrow_drop_down"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="selectedAccidental"
                :items="[
                  { title: '♮ (Natural)', value: '' },
                  { title: '♭ (Flat)', value: 'b' },
                  { title: '♯ (Sharp)', value: '#' }
                ]"
                label="Accidental"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                menu-icon="arrow_drop_down"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="selectedQuality"
                :items="[
                  { title: 'Major', value: '' },
                  { title: 'Minor', value: 'm' }
                ]"
                label="Type"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                menu-icon="arrow_drop_down"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-space-between px-2 pb-2">
          <v-btn data-testid="key-cancel-btn" variant="text" @click="keyDialog = false" rounded="lg">Cancel</v-btn>
          <v-btn data-testid="key-save-btn" color="primary" variant="flat" @click="saveKeyChange" rounded="lg">Change</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongsRepository from '../services/SongsRepository';
import LyricsService from '../services/LyricsService';

import { useShare } from '../composables/useShare';
import { usePlaylist } from '../composables/usePlaylist';
import { useAuth } from '../composables/useAuth';
import { useSongSettings } from '../composables/useSongSettings';

const route = useRoute();
const router = useRouter();
const song = ref(null);
const { playlist, togglePlaylist, isInPlaylist } = usePlaylist();
const { isAuthenticated, isAuthenticating } = useAuth();
const { fontSizeClass, cycleFontSize } = useSongSettings();

const isEditMode = ref(false);
const isSaving = ref(false);
const songInPlaylist = computed(() => song.value ? isInPlaylist(song.value.id) : false);
const loading = ref(true);
const paragraphs = ref([]);
const snackbar = ref(false);
const snackbarText = ref('');
const editTitle = ref('');
const { share } = useShare(); 

const textareaRefs = new Map();
const setTextareaRef = (el, id) => {
  if (el) {
    textareaRefs.set(id, el);
  } else {
    textareaRefs.delete(id);
  }
};

// Key Change Dialog Logic
const keyDialog = ref(false);
const selectedRoot = ref('C');
const selectedAccidental = ref('');
const selectedQuality = ref('');

const openKeyDialog = () => {
  if (!song.value || !song.value.originalKey) return;
  
  // Parse current key: e.g., "C#m" -> root: "C", accidental: "#", quality: "m"
  const match = song.value.originalKey.match(/^([A-G])([#b]?)(m?)$/);
  if (match) {
    selectedRoot.value = match[1];
    selectedAccidental.value = match[2];
    selectedQuality.value = match[3];
  }
  
  keyDialog.value = true;
};

const saveKeyChange = async () => {
  const newKey = `${selectedRoot.value}${selectedAccidental.value}${selectedQuality.value}`;
  
  try {
    await SongsRepository.save(song.value.id, song.value.content, null, newKey);
    song.value.originalKey = newKey;
    keyDialog.value = false;
    snackbarText.value = 'Key changed successfully';
    snackbar.value = true;
  } catch (error) {
    console.error('Failed to change key:', error);
    snackbarText.value = 'Error changing key';
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

const handleShare = async () => {
  if (!song.value) return;
  const url = window.location.href;
  const result = await share(song.value.title, url);
  if (result.copied) {
    snackbarText.value = 'Link copied to clipboard';
    snackbar.value = true;
  }
};

const goBack = () => {
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push('/');
  }
};

const addParagraph = (index, position) => {
  const newP = LyricsService.createParagraph('verse');
  newP.editText = '';
  const insertAt = position === 'above' ? index : index + 1;
  paragraphs.value.splice(insertAt, 0, newP);

  nextTick(() => {
    const component = textareaRefs.get(newP.id);
    if (component) {
      const target = component.$el?.querySelector('textarea') || component;
      target.focus?.();
    }
  });
};

const removeParagraph = (index) => {
  if (paragraphs.value.length > 1) {
    paragraphs.value.splice(index, 1);
  }
};

const toggleEditMode = async () => {
  if (isEditMode.value) {
    // Exiting edit mode — cleanup, sync, then save
    if (song.value && paragraphs.value.length > 0) {
      // 1. Validation: Title
      if (!editTitle.value || editTitle.value.trim().length < 3) {
        snackbarText.value = 'Title must have at least 3 characters';
        snackbar.value = true;
        return;
      }

      // 2. Validation: At least one paragraph must have 3+ characters
      const validParagraphs = paragraphs.value.filter(p => {
        const text = (p.editText || '').replace(/\s/g, '');
        return text.length >= 3;
      });

      if (validParagraphs.length === 0) {
        snackbarText.value = 'Each paragraph must have at least 3 characters';
        snackbar.value = true;
        return;
      }

      isSaving.value = true;
      try {
        // 3. Cleanup: Remove paragraphs that are too short (less than 3 chars)
        paragraphs.value = validParagraphs;

        // 4. Sync editText back into structured lines
        paragraphs.value.forEach((p) => {
          if (p.editText !== undefined) {
            LyricsService.syncParagraphLines(p, p.editText);
          }
        });

        const newContent = LyricsService.serialize(paragraphs.value);
        await SongsRepository.save(song.value.id, newContent, editTitle.value);
        
        song.value.title = editTitle.value;
        snackbarText.value = 'Changes saved to cloud';
        snackbar.value = true;
        isEditMode.value = false;
      } catch (error) {
        console.error('Save failed:', error);
        snackbarText.value = 'Error saving: ' + (error.code === 'permission-denied' ? 'Permission Denied' : error.message);
        snackbar.value = true;
      } finally {
        isSaving.value = false;
      }
    } else {
      isEditMode.value = false;
    }
  } else {
    // Entering edit mode — populate editText and title
    editTitle.value = song.value.title;
    paragraphs.value.forEach((p) => {
      p.editText = p.lines.map(l => l.text).join('\n');
    });
    isEditMode.value = true;
  }
};

const resolveSong = () => {
  const id = route.params.id;
  song.value = SongsRepository.getSong(id);
  if (song.value) {
    isEditMode.value = false;
    paragraphs.value = LyricsService.parseToParagraphs(song.value.content);
  }
  loading.value = false;
};

onMounted(() => {
  if (!SongsRepository.loading.value) {
    resolveSong();
  } else {
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

onUnmounted(() => {
    isEditMode.value = false;
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

.lyrics {
  white-space: pre-wrap; /* Preserve spaces in lyrics */
  line-height: 1.5;
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
