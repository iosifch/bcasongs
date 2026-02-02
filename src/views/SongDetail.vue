<template>
  <v-container>

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
          
          <v-app-bar-title class="text-h6 font-weight-regular mr-2">
            {{ song.title }}
          </v-app-bar-title>
          
          <v-btn
            :icon="showChords ? 'mdi-music-note' : 'mdi-music-note-off'"
            variant="text"
            @click="showChords = !showChords"
            class="mr-2"
            title="Toggle Chords"
            density="comfortable"
            rounded="lg"
          ></v-btn>
          
          <v-btn
            icon="mdi-format-size"
            variant="text"
            @click="cycleFontSize"
            title="Change Font Size"
            density="comfortable"
            rounded="lg"
          ></v-btn>
        </v-container>
      </v-app-bar>

      <div class="song-content mt-4 px-3">
          <template v-for="(line, lineIndex) in parsedLines" :key="lineIndex">
            <!-- Normal Line or Chorus Line (rendered individually) -->
            <div 
              v-if="!line.isCoda"
              class="song-line"
              :class="{ 
                'lyrics-mode': !showChords,
                'mb-1': !line.isSpacer && !line.isChorus,
                'mb-2': line.isChorus,
                'py-2': line.isSpacer,
                'font-italic pl-4': line.isChorus
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

            <!-- Coda Block (rendered only once at the start of a coda sequence) -->
            <div 
              v-else-if="line.isCoda && (lineIndex === 0 || !parsedLines[lineIndex - 1].isCoda)"
              class="coda-block pl-4 border-s-md border-grey-lighten-1 mb-2"
            >
              <div 
                v-for="(codaLine, codaIndex) in getCodaBlock(parsedLines, lineIndex)" 
                :key="codaIndex"
                class="song-line mb-1"
                :class="{ 'lyrics-mode': !showChords }"
              >
                <div 
                  v-for="(segment, segIndex) in codaLine.segments" 
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
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MusicService from '../services/MusicService';

const route = useRoute();
const song = ref(null);
const loading = ref(true);
const transposeAmount = ref(0);
const rawParsedLines = ref([]);
const showChords = ref(false);
const fontSizeLevel = ref(0); // 0: Normal, 1: Large, 2: Extra Large

const fontSizes = ['lyrics-text-1', 'lyrics-text-2', 'lyrics-text-3'];

const fontSizeClass = computed(() => fontSizes[fontSizeLevel.value]);

const cycleFontSize = () => {
  fontSizeLevel.value = (fontSizeLevel.value + 1) % fontSizes.length;
};

onMounted(async () => {
  try {
    const id = route.params.id;
    song.value = await MusicService.getSong(id);
    if (song.value) {
      rawParsedLines.value = MusicService.parse(song.value.content);
    }
  } finally {
    loading.value = false;
  }
});

const transpose = (amount) => {
  transposeAmount.value += amount;
};

const parsedLines = computed(() => {
  if (!rawParsedLines.value.length) return [];
  return MusicService.transposeParsedContent(rawParsedLines.value, transposeAmount.value);
});

const getCodaBlock = (allLines, startIndex) => {
  const block = [];
  for (let i = startIndex; i < allLines.length; i++) {
    if (allLines[i].isCoda) {
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
