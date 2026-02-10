<template>
  <div>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <div v-else-if="song">
      <v-app-bar color="secondary-container" elevation="2" scroll-behavior="hide">
        <v-container class="pa-0 fill-height d-flex align-center px-3">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            to="/"
            class="mr-2"
            density="comfortable"
            rounded="lg"
          ></v-btn>

          <v-app-bar-title class="text-h6 font-weight-regular">
            {{ song.title }}
          </v-app-bar-title>
        </v-container>
      </v-app-bar>

      <div class="song-content mt-4 px-3">
          <template v-for="(line, lineIndex) in parsedLines" :key="lineIndex">
            <!-- Normal Line or Spacer -->
            <div 
              v-if="!line.isChorus && !line.isBridge && !line.isCoda"
              class="song-line"
              :class="{ 
                'lyrics-mode': !showChords,
                'mb-1': !line.isSpacer,
                'py-2': line.isSpacer
              }"
            >
              <template v-if="!line.isSpacer">
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
              </template>
            </div>

            <!-- Section Block (Chorus, Bridge, Coda) -->
            <div 
              v-else-if="shouldStartSection(parsedLines, lineIndex)"
              class="section-block pl-4 mb-2"
              :class="{ 
                'chorus-style font-italic': line.isChorus,
                'bridge-style border-s-md border-primary-lighten-2': line.isBridge,
                'coda-style border-s-md border-grey-lighten-1': line.isCoda
              }"
            >
              <div 
                v-for="(sectionLine, sectionLineIndex) in getSectionBlock(parsedLines, lineIndex)" 
                :key="sectionLineIndex"
                class="song-line mb-1"
                :class="{ 'lyrics-mode': !showChords }"
              >
                <div 
                  v-for="(segment, segIndex) in sectionLine.segments" 
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
            </div>
          </template>
      </div>
    </div>

    <v-row v-else>
      <v-col cols="12">
        <v-alert type="error" text="Song not found"></v-alert>
      </v-col>
    </v-row>

    <v-speed-dial location="bottom right" transition="scale-transition" :close-on-content-click="false">
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab v-bind="activatorProps" app location="bottom right" color="primary" icon="mdi-dots-vertical"></v-fab>
      </template>

      <v-btn key="chords" icon @click="showChords = !showChords" :title="showChords ? 'Hide Chords' : 'Show Chords'">
        <v-icon>{{ showChords ? 'mdi-music-note' : 'mdi-music-note-off' }}</v-icon>
      </v-btn>

      <v-btn key="font-size" icon @click="cycleFontSize" title="Change Font Size">
        <v-icon>mdi-format-size</v-icon>
      </v-btn>

      <v-btn key="share" icon @click="shareSong" title="Share Song">
        <v-icon>mdi-share-variant</v-icon>
      </v-btn>
    </v-speed-dial>

    <v-snackbar v-model="snackbar" :timeout="2000" color="inverse-surface">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="inverse-primary" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MusicService from '../services/MusicService';

import { useShare } from '../composables/useShare';

const route = useRoute();
const song = ref(null);
const loading = ref(true);
const parsedLines = ref([]);
const showChords = ref(false);
const fontSizeLevel = ref(0); // 0: Normal, 1: Large, 2: Extra Large
const snackbar = ref(false);
const snackbarText = ref('');
const { share } = useShare();

const fontSizes = ['lyrics-text-1', 'lyrics-text-2', 'lyrics-text-3'];

const fontSizeClass = computed(() => fontSizes[fontSizeLevel.value]);

const cycleFontSize = () => {
  fontSizeLevel.value = (fontSizeLevel.value + 1) % fontSizes.length;
};

const shareSong = async () => {
  if (!song.value) return;

  const result = await share(song.value.title, window.location.href);
  
  if (result.copied) {
    snackbarText.value = 'Link copied to clipboard';
    snackbar.value = true;
  }
};

onMounted(async () => {
  try {
    const id = route.params.id;
    song.value = await MusicService.getSong(id);
    if (song.value) {
      parsedLines.value = MusicService.parse(song.value.content);
    }
  } finally {
    loading.value = false;
  }
});

const shouldStartSection = (allLines, index) => {
  const line = allLines[index];
  if (!line.isChorus && !line.isBridge && !line.isCoda) return false;
  
  if (index === 0) return true;
  
  const prevLine = allLines[index - 1];
  if (line.isChorus && !prevLine.isChorus) return true;
  if (line.isBridge && !prevLine.isBridge) return true;
  if (line.isCoda && !prevLine.isCoda) return true;
  
  return false;
};

const getSectionBlock = (allLines, startIndex) => {
  const line = allLines[startIndex];
  const block = [];
  const type = line.isChorus ? 'isChorus' : (line.isBridge ? 'isBridge' : 'isCoda');
  
  for (let i = startIndex; i < allLines.length; i++) {
    if (allLines[i][type]) {
      block.push(allLines[i]);
    } else {
      break;
    }
  }
  return block;
};
</script>

<style scoped>
.lyrics-text-1 {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}

.lyrics-text-2 {
  font-size: 1.25rem; /* 20px */
  line-height: 1.6;
  font-weight: 300;
}

.lyrics-text-3 {
  font-size: 1.375rem; /* 22px */
  line-height: 1.6;
  font-weight: 300;
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
</style>
