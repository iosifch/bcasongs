import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useKeyManager } from './useKeyManager';
import SongsRepository from '../services/SongsRepository';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } })
}));

vi.mock('../services/SongsRepository', () => ({
  default: {
    save: vi.fn()
  }
}));

describe('useKeyManager', () => {
  let songRef, snackbarText, snackbar;

  beforeEach(() => {
    vi.clearAllMocks();
    songRef = ref({ id: '1', content: 'lyrics', originalKey: 'G' });
    snackbarText = ref('');
    snackbar = ref(false);
  });

  it('correctly parses simple key when opening dialog', () => {
    const { openKeyDialog, selectedRoot, selectedAccidental, selectedQuality } = useKeyManager(songRef, snackbarText, snackbar);
    
    openKeyDialog();
    
    expect(selectedRoot.value).toBe('G');
    expect(selectedAccidental.value).toBe('');
    expect(selectedQuality.value).toBe('');
  });

  it('correctly parses complex keys (e.g. C#m)', () => {
    songRef.value.originalKey = 'C#m';
    const { openKeyDialog, selectedRoot, selectedAccidental, selectedQuality } = useKeyManager(songRef, snackbarText, snackbar);
    
    openKeyDialog();
    
    expect(selectedRoot.value).toBe('C');
    expect(selectedAccidental.value).toBe('#');
    expect(selectedQuality.value).toBe('m');
  });

  it('saves new key and updates songRef', async () => {
    const { saveKeyChange, selectedRoot, selectedAccidental, selectedQuality } = useKeyManager(songRef, snackbarText, snackbar);
    
    selectedRoot.value = 'A';
    selectedAccidental.value = 'b';
    selectedQuality.value = 'm';
    
    await saveKeyChange();
    
    expect(SongsRepository.save).toHaveBeenCalledWith('1', 'lyrics', null, 'Abm');
    expect(songRef.value.originalKey).toBe('Abm');
    expect(snackbarText.value).toBe('Key changed successfully');
  });
});
