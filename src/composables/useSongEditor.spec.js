import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useSongEditor } from './useSongEditor';
import SongsRepository from '../services/SongsRepository';

// Mock Router/Route globally for this file
const mockReplace = vi.fn();
let mockRouteParams = { id: '1' };

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useRoute: () => ({ params: mockRouteParams })
}));

vi.mock('../services/SongsRepository', () => ({
  default: {
    save: vi.fn(),
    addSong: vi.fn()
  }
}));

describe('useSongEditor', () => {
  let snackbarText, snackbar, songRef;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteParams = { id: '1' }; // Reset to default
    snackbarText = ref('');
    snackbar = ref(false);
    songRef = ref({ id: '1', title: 'Test', content: 'Verse 1', originalKey: 'G' });
  });

  it('validates title length (min 3 chars)', async () => {
    const editor = useSongEditor(songRef, snackbarText, snackbar);
    editor.isEditMode.value = true;
    editor.editTitle.value = 'Ab'; // Too short
    editor.paragraphs.value = [{ editText: 'Valid content long enough' }];

    await editor.toggleEditMode();

    expect(snackbarText.value).toBe('Title must have at least 3 characters');
    expect(snackbar.value).toBe(true);
    expect(editor.isEditMode.value).toBe(true);
  });

  it('validates that at least one paragraph is long enough', async () => {
    const editor = useSongEditor(songRef, snackbarText, snackbar);
    editor.isEditMode.value = true;
    editor.editTitle.value = 'Valid Title';
    editor.paragraphs.value = [{ editText: '12' }]; // Too short

    await editor.toggleEditMode();

    expect(snackbarText.value).toBe('Each paragraph must have at least 3 characters');
    expect(editor.isEditMode.value).toBe(true);
  });

  it('cleans up short paragraphs before saving', async () => {
    const editor = useSongEditor(songRef, snackbarText, snackbar);
    editor.isEditMode.value = true;
    editor.editTitle.value = 'Valid Title';
    // One long, one short
    editor.paragraphs.value = [
      { id: 'p1', editText: 'Valid line', lines: [], type: 'verse' },
      { id: 'p2', editText: '1', lines: [], type: 'verse' }
    ];
    
    SongsRepository.save.mockResolvedValue();

    await editor.toggleEditMode();

    expect(editor.paragraphs.value).toHaveLength(1);
    expect(editor.paragraphs.value[0].id).toBe('p1');
  });

  it('handles "new" song creation logic', async () => {
    mockRouteParams = { id: 'new' };

    const editor = useSongEditor(songRef, snackbarText, snackbar);
    editor.isEditMode.value = true;
    editor.editTitle.value = 'Brand New';
    editor.paragraphs.value = [{ editText: 'Some lyrics', lines: [], type: 'verse' }];
    
    SongsRepository.addSong.mockResolvedValue('new-id');

    await editor.toggleEditMode();

    expect(SongsRepository.addSong).toHaveBeenCalledWith('Brand New', expect.any(String), 'G');
    expect(mockReplace).toHaveBeenCalledWith('/song/new-id');
  });
});
