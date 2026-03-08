<template>
  <v-app-bar flat color="background" class="px-2">
      <v-btn
        icon="chevron_left"
        variant="tonal"
        color="surface-variant"
        @click="goBack"
        class="mr-2"
        density="comfortable"
        rounded="lg"
      >
      </v-btn>

      <v-app-bar-title class="text-h7 font-weight-regular text-truncate ml-0 pl-0">
        {{ song?.title }}
      </v-app-bar-title>

  </v-app-bar>

  <v-app-bar location="bottom" flat color="background" class="px-2">
    <v-chip
      v-if="song?.originalKey"
      data-testid="key-chip"
      color="outline"
      variant="outlined"
      size="small"
      class="mr-2 font-weight-bold text-on-surface-variant text-none"
    >
      {{ song.originalKey }}
    </v-chip>

    <v-chip
      v-if="song?.bookNumber"
      color="outline"
      variant="outlined"
      size="small"
      class="font-weight-bold text-on-surface-variant"
    >
      #{{ song.bookNumber }}
    </v-chip>

    <v-spacer></v-spacer>
    
    <v-btn
      variant="tonal"
      color="surface-variant"
      @click="cycleFontSize"
      title="Change Font Size"
      class="ml-2"
      density="comfortable"
      rounded="lg"
      :ripple="false"
      :disabled="isEditMode"
      data-testid="font-size-btn"
      icon="format_size"
    >
      
    </v-btn>

    <v-btn
      variant="tonal"
      color="surface-variant"
      @click="handleShare(song)"
      title="Share Song"
      class="ml-2"
      density="comfortable"
      rounded="lg"
      :ripple="false"
      :disabled="isEditMode"
      icon="share"
    >
    </v-btn>

    <v-btn
      v-if="isAuthenticated"
      data-testid="key-btn"
      variant="tonal"
      color="surface-variant"
      @click="openKeyDialog"
      title="Change Key"
      class="ml-2 font-weight-bold text-none"
      density="comfortable"
      rounded="lg"
      :ripple="false"
      :disabled="isEditMode"
      icon="music_note_add"
    >
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
      rounded="lg"
      :ripple="false"
      :icon="isEditMode ? 'check' : 'edit_document'"
    >
    </v-btn>

    <v-btn
      v-if="isAuthenticated"
      variant="tonal"
      :color="songInPlaylist ? 'primary' : 'surface-variant'"
      @click="song?.id && handleTogglePlaylist(song.id)"
      class="ml-2"
      title="Toggle Playlist"
      density="comfortable"
      rounded="lg"
      :ripple="false"
      :disabled="isEditMode"
      :icon="songInPlaylist ? 'playlist_remove' : 'playlist_add'"
    >
    </v-btn>
  </v-app-bar>

  <v-row v-if="loading">
    <v-col cols="12" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-col>
  </v-row>

  <div v-else-if="song">
    <div class="song-content px-3">
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
                @click="onAddParagraph(pIndex, 'above')"
                data-testid="add-above-btn"
              >
                <v-icon icon="add_row_above"></v-icon>
              </v-btn>
              <v-btn
                size="small"
                title="Add Below"
                @click="onAddParagraph(pIndex, 'below')"
                data-testid="add-below-btn"
              >
                <v-icon icon="add_row_below"></v-icon>
              </v-btn>
              <v-btn
                size="small"
                title="Delete Paragraph"
                :disabled="paragraphs.length <= 1"
                @click="removeParagraph(pIndex)"
                data-testid="delete-paragraph-btn"
              >
                <v-icon icon="delete"></v-icon>
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
            >
              Chorus
            </v-chip>
            <v-chip
              v-else-if="paragraph.type === 'coda'"
              size="small"
              color="surface-variant"
              variant="tonal"
              class="text-uppercase"
            >
              Coda
            </v-chip>
            <v-chip
              v-else
              size="small"
              color="surface-variant"
              variant="tonal"
              class="text-uppercase"
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

</template>

<script setup lang="ts">
import { computed, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';

import { usePlaylist } from '../composables/usePlaylist';
import { useAuth } from '../composables/useAuth';
import { useSongSettings } from '../composables/useSongSettings';
import { useSongEditor } from '../composables/useSongEditor';
import { useKeyManager } from '../composables/useKeyManager';
import { useSongActions } from '../composables/useSongActions';
import { useCurrentSong } from '../composables/useCurrentSong';
import { useAppNavigation } from '../composables/useAppNavigation';
import type { Song } from '../services/SongsRepository';

const route = useRoute();
const { isInPlaylist } = usePlaylist();
const { isAuthenticated } = useAuth();
const { fontSizeClass, cycleFontSize } = useSongSettings();
const { goBack } = useAppNavigation();

const { snackbar, snackbarText, handleTogglePlaylist, handleShare } = useSongActions();
const songId = route.params.id as string;
const { song, loading } = useCurrentSong(songId, (resolvedSong: Song) => initializeEditor(resolvedSong));
const { isEditMode, isSaving, editTitle, paragraphs, initializeEditor, addParagraph, removeParagraph, toggleEditMode } = useSongEditor(song, snackbarText, snackbar);
const { keyDialog, selectedRoot, selectedAccidental, selectedQuality, openKeyDialog, saveKeyChange } = useKeyManager(song, snackbarText, snackbar);

const songInPlaylist = computed(() => (song.value && song.value.id) ? isInPlaylist(song.value.id) : false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const textareaRefs = new Map<string, any>();
const setTextareaRef = (el: unknown, id: string) => {
  if (el) {
    textareaRefs.set(id, el);
  } else {
    textareaRefs.delete(id);
  }
};

const onAddParagraph = (index: number, position: 'above' | 'below') => {
  const newId = addParagraph(index, position);
  nextTick(() => {
    const component = textareaRefs.get(newId);
    if (component) {
      const target = component.$el?.querySelector('textarea') || component;
      target.focus?.();
    }
  });
};

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

.lyrics {
  white-space: pre-wrap; /* Preserve spaces in lyrics */
  line-height: 1.5;
}

</style>
