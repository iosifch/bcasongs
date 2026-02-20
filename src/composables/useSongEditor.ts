import { ref, type Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SongsRepository from '../services/SongsRepository';
import LyricsService from '../services/LyricsService';
import type { Song } from '../services/SongsRepository';
import type { Paragraph } from '../services/LyricsService';

interface FirebaseError extends Error {
  code?: string
}

export function useSongEditor(songRef: Ref<Song | null>, snackbarText: Ref<string>, snackbar: Ref<boolean>) {
  const router = useRouter();
  const route = useRoute();

  const isEditMode = ref(false);
  const isSaving = ref(false);
  const editTitle = ref('');
  const paragraphs = ref<Paragraph[]>([]);

  const initializeEditor = (song: Song | null): void => {
    if (!song) return;
    if (route.params?.id === 'new') {
      isEditMode.value = true;
      editTitle.value = '';
      paragraphs.value = [LyricsService.createParagraph('verse')];
      paragraphs.value[0].editText = '';
    } else {
      isEditMode.value = false;
      editTitle.value = song.title;
      paragraphs.value = LyricsService.parseToParagraphs(song.content);
    }
  };

  const addParagraph = (index: number, position: 'above' | 'below'): string => {
    const newP = LyricsService.createParagraph('verse');
    newP.editText = '';
    const insertAt = position === 'above' ? index : index + 1;
    paragraphs.value.splice(insertAt, 0, newP);
    return newP.id;
  };

  const removeParagraph = (index: number): void => {
    if (paragraphs.value.length > 1) {
      paragraphs.value.splice(index, 1);
    }
  };

  const toggleEditMode = async (): Promise<void> => {
    if (isEditMode.value) {
      if (songRef.value && paragraphs.value.length > 0) {
        if (!editTitle.value || editTitle.value.trim().length < 3) {
          snackbarText.value = 'Title must have at least 3 characters';
          snackbar.value = true;
          return;
        }

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
          paragraphs.value = validParagraphs;
          paragraphs.value.forEach((p) => {
            if (p.editText !== undefined) {
              LyricsService.syncParagraphLines(p, p.editText);
            }
          });

          const newContent = LyricsService.serialize(paragraphs.value);

          if (route.params?.id === 'new') {
            const newId = await SongsRepository.addSong(editTitle.value, newContent, songRef.value.originalKey ?? null);
            snackbarText.value = 'Song created successfully';
            snackbar.value = true;
            router.replace(`/song/${newId}`);
          } else {
            await SongsRepository.save(songRef.value.id, newContent, editTitle.value);
            songRef.value.title = editTitle.value;
            songRef.value.content = newContent;
            snackbarText.value = 'Changes saved to cloud';
            snackbar.value = true;
            isEditMode.value = false;
          }
        } catch (error) {
          console.error('Save failed:', error);
          const fbError = error as FirebaseError;
          snackbarText.value = 'Error saving: ' + (fbError.code === 'permission-denied' ? 'Permission Denied' : fbError.message);
          snackbar.value = true;
        } finally {
          isSaving.value = false;
        }
      } else {
        isEditMode.value = false;
      }
    } else {
      if (songRef.value) {
        editTitle.value = songRef.value.title;
      }
      paragraphs.value.forEach((p) => {
        p.editText = p.lines.map(l => l.text).join('\n');
      });
      isEditMode.value = true;
    }
  };

  return {
    isEditMode,
    isSaving,
    editTitle,
    paragraphs,
    initializeEditor,
    addParagraph,
    removeParagraph,
    toggleEditMode
  };
}
