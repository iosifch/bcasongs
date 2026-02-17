import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import SongDetail from './SongDetail.vue';
import { useAuth } from '../composables/useAuth';
import SongsRepository from '../services/SongsRepository';
import LyricsService from '../services/LyricsService';
import { mountWithLayout, getSnackbarText } from '../test-utils';

// -- Mocks --
vi.mock('../composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: ref(false),
    isAuthenticating: ref(false),
    initializeAuth: vi.fn()
  }))
}));

vi.mock('../composables/usePlaylist', () => ({
  usePlaylist: vi.fn(() => ({
    playlist: ref([]),
    togglePlaylist: vi.fn(),
    isInPlaylist: vi.fn(() => false)
  }))
}));

vi.mock('../composables/useShare', () => ({
  useShare: vi.fn(() => ({
    share: vi.fn()
  }))
}));

vi.mock('../composables/useSongSettings', () => ({
  useSongSettings: vi.fn(() => ({
    fontSizeClass: ref('lyrics-text-1'),
    cycleFontSize: vi.fn()
  }))
}));

vi.mock('../services/SongsRepository', () => ({
  default: {
    getSong: vi.fn(),
    save: vi.fn(),
    addSong: vi.fn(),
    initialize: vi.fn(),
    loading: ref(false)
  }
}));

vi.mock('../services/LyricsService', () => ({
  default: {
    parseToParagraphs: vi.fn(() => []),
    serialize: vi.fn(() => ''),
    createParagraph: vi.fn((type) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: type || 'verse',
      lines: []
    })),
    syncParagraphLines: vi.fn((p, text) => {
      p.lines = text.split('\n').map(l => ({ text: l, isSpacer: l.trim() === '' }));
    }),
    filterEmptyParagraphs: vi.fn(p => p.filter(item => {
      const text = (item.editText !== undefined) ? item.editText : (item.lines || []).map(l => l.text).join('');
      return text.trim().length > 0;
    }))
  }
}));

const mockRouter = { back: vi.fn(), push: vi.fn(), replace: vi.fn() };
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: '1' } })),
  useRouter: vi.fn(() => mockRouter)
}));

// -- Shared helpers --
const setupAuthenticated = () => {
  useAuth.mockReturnValue({
    isAuthenticated: computed(() => true),
    isAuthenticating: ref(false)
  });
};

const setupUnauthenticated = () => {
  useAuth.mockReturnValue({
    isAuthenticated: computed(() => false),
    isAuthenticating: ref(false)
  });
};

const mountAndWait = async () => {
  const wrapper = mountWithLayout(SongDetail);
  await flushPromises();
  return wrapper;
};

const findEditBtn = (wrapper) => wrapper.find('[data-testid="edit-btn"]');
const getEditIcon = (wrapper) => findEditBtn(wrapper).findComponent({ name: 'VIcon' }).props('icon');

const enterEditMode = async (wrapper) => {
  await findEditBtn(wrapper).trigger('click');
  await flushPromises();
};

// -- Test suites --
describe('SongDetail.vue - Key Change', () => {
  const mockSong = {
    id: '1',
    title: 'Test Song',
    originalKey: 'G',
    content: '[G]Test lyrics',
    bookNumber: '123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.getSong.mockReturnValue(mockSong);
    vi.mocked(useRoute).mockReturnValue({ params: { id: '1' } });
  });

  it('shows key as a chip when not authenticated', async () => {
    setupUnauthenticated();

    const wrapper = await mountAndWait();

    expect(wrapper.find('[data-testid="key-chip"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="key-chip"]').text()).toBe('G');
    expect(wrapper.find('[data-testid="key-btn"]').exists()).toBe(false);
  });

  it('shows key as a button when authenticated', async () => {
    setupAuthenticated();

    const wrapper = await mountAndWait();

    expect(wrapper.find('[data-testid="key-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="key-btn"]').text().trim()).toBe('G');
    expect(wrapper.find('[data-testid="key-chip"]').exists()).toBe(false);
  });

  it('opens dialog with note selector when key button is clicked', async () => {
    setupAuthenticated();

    const wrapper = await mountAndWait();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');
    await flushPromises();

    const rootSelect = document.querySelector('[data-testid="key-root-select"]');
    expect(rootSelect).not.toBeNull();
  });

  it('parses complex key correctly when opening dialog', async () => {
    SongsRepository.getSong.mockReturnValue({ ...mockSong, originalKey: 'C#m' });
    setupAuthenticated();

    const wrapper = await mountAndWait();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');
    await flushPromises();

    const dialogPreview = document.querySelector('.v-dialog .text-h4');
    expect(dialogPreview?.textContent?.trim()).toBe('C#m');
  });

  it('saves new key via Change button and updates displayed key', async () => {
    setupAuthenticated();
    SongsRepository.save.mockResolvedValue();

    const wrapper = await mountAndWait();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');
    await flushPromises();

    // v-select components are teleported to body — direct DOM interaction is impractical,
    // so we set the reactive values that the selects are bound to
    wrapper.vm.selectedRoot = 'A';
    wrapper.vm.selectedAccidental = 'b';
    wrapper.vm.selectedQuality = 'm';
    await flushPromises();

    const saveBtn = document.querySelector('[data-testid="key-save-btn"]');
    saveBtn.click();
    await flushPromises();

    expect(SongsRepository.save).toHaveBeenCalledWith('1', mockSong.content, null, 'Abm');
    expect(getSnackbarText()).toContain('Key changed successfully');
    expect(wrapper.find('[data-testid="key-btn"]').text().trim()).toBe('Abm');
  });

  it('shows error snackbar when key change fails', async () => {
    setupAuthenticated();
    SongsRepository.save.mockRejectedValue(new Error('Network error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = await mountAndWait();

    await wrapper.find('[data-testid="key-btn"]').trigger('click');
    await flushPromises();

    const saveBtn = document.querySelector('[data-testid="key-save-btn"]');
    saveBtn.click();
    await flushPromises();

    expect(getSnackbarText()).toContain('Error changing key');
  });
});

describe('SongDetail.vue - Edit Mode Save Flow', () => {
  const mockSong = {
    id: '1',
    title: 'Test Song',
    originalKey: 'G',
    content: 'Test lyrics',
    bookNumber: '123'
  };

  const mockParagraphs = [
    { id: 'p1', type: 'verse', lines: [{ text: 'Line 1', isSpacer: false }] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.getSong.mockReturnValue(mockSong);
    LyricsService.parseToParagraphs.mockReturnValue([...mockParagraphs.map(p => ({ ...p, lines: [...p.lines] }))]);
    LyricsService.serialize.mockReturnValue('Line 1');
    setupAuthenticated();
    vi.mocked(useRoute).mockReturnValue({ params: { id: '1' } });
  });

  it('enters edit mode when edit button is clicked', async () => {
    const wrapper = await mountAndWait();

    expect(getEditIcon(wrapper)).toContain('edit_document');

    await enterEditMode(wrapper);

    expect(getEditIcon(wrapper)).toContain('check');
  });

  it('saves and exits edit mode after successful persistence', async () => {
    SongsRepository.save.mockResolvedValue();

    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);
    expect(getEditIcon(wrapper)).toContain('check');

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(LyricsService.serialize).toHaveBeenCalled();
    expect(SongsRepository.save).toHaveBeenCalledWith('1', 'Line 1', 'Test Song');
    expect(getEditIcon(wrapper)).toContain('edit_document');
    expect(getSnackbarText()).toContain('Changes saved to cloud');
  });

  it('stays in edit mode when save fails', async () => {
    SongsRepository.save.mockRejectedValue(new Error('Network error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(getEditIcon(wrapper)).toContain('check');
    expect(getSnackbarText()).toContain('Error saving');
  });

  it('shows permission denied message on permission error', async () => {
    const permError = new Error('Permission denied');
    permError.code = 'permission-denied';
    SongsRepository.save.mockRejectedValue(permError);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);
    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(getEditIcon(wrapper)).toContain('check');
    expect(getSnackbarText()).toContain('Permission Denied');
  });

  it('disables edit button while saving', async () => {
    let resolverFn;
    SongsRepository.save.mockImplementation(() => new Promise(resolve => { resolverFn = resolve; }));

    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);
    expect(findEditBtn(wrapper).classes()).not.toContain('v-btn--disabled');

    const exitPromise = wrapper.vm.toggleEditMode();
    await flushPromises();

    expect(findEditBtn(wrapper).classes()).toContain('v-btn--disabled');

    resolverFn();
    await exitPromise;
    await flushPromises();

    expect(findEditBtn(wrapper).classes()).not.toContain('v-btn--disabled');
    expect(getEditIcon(wrapper)).toContain('edit_document');
  });

  it('shows textareas when edit mode is active', async () => {
    const wrapper = await mountAndWait();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(0);

    await enterEditMode(wrapper);

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);
  });

  it('textarea contains paragraph text when entering edit mode', async () => {
    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);

    const textarea = wrapper.find('[data-testid="lyrics-textarea"] textarea');
    expect(textarea.element.value).toBe('Line 1');
  });

  it('saves modified textarea content', async () => {
    SongsRepository.save.mockResolvedValue();

    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);

    const textarea = wrapper.find('[data-testid="lyrics-textarea"] textarea');
    await textarea.setValue('Modified Line 1\nNew Line 2');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(LyricsService.serialize).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'p1',
        type: 'verse',
        lines: [
          { text: 'Modified Line 1', isSpacer: false },
          { text: 'New Line 2', isSpacer: false }
        ]
      })
    ]);
  });

  it('hides textareas after exiting edit mode', async () => {
    SongsRepository.save.mockResolvedValue();

    const wrapper = await mountAndWait();

    await enterEditMode(wrapper);
    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(0);
  });

  it('disables font size button in edit mode', async () => {
    const wrapper = await mountAndWait();

    const fontSizeBtn = wrapper.find('[data-testid="font-size-btn"]');
    expect(fontSizeBtn.classes()).not.toContain('v-btn--disabled');

    await enterEditMode(wrapper);

    expect(fontSizeBtn.classes()).toContain('v-btn--disabled');
  });
});

describe('SongDetail.vue - Paragraph Management', () => {
  const mockSong = { id: '1', title: 'Test', content: 'Verse 1\n\nVerse 2' };
  const mockParagraphs = [
    { id: 'p1', type: 'verse', lines: [{ text: 'Verse 1', isSpacer: false }] },
    { id: 'p2', type: 'verse', lines: [{ text: 'Verse 2', isSpacer: false }] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.getSong.mockReturnValue(mockSong);
    LyricsService.parseToParagraphs.mockReturnValue([...mockParagraphs.map(p => ({ ...p, lines: [...p.lines] }))]);
    setupAuthenticated();
    vi.mocked(useRoute).mockReturnValue({ params: { id: '1' } });
  });

  it('adds a paragraph above the current one', async () => {
    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(2);

    await wrapper.findAll('[data-testid="add-above-btn"]')[1].trigger('click');
    await flushPromises();

    const textareas = wrapper.findAll('[data-testid="lyrics-textarea"]');
    expect(textareas).toHaveLength(3);
    expect(textareas[1].find('textarea').element.value).toBe('');
  });

  it('adds a paragraph below the current one', async () => {
    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    await wrapper.findAll('[data-testid="add-below-btn"]')[0].trigger('click');
    await flushPromises();

    const textareas = wrapper.findAll('[data-testid="lyrics-textarea"]');
    expect(textareas).toHaveLength(3);
    expect(textareas[1].find('textarea').element.value).toBe('');
  });

  it('removes a paragraph', async () => {
    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(2);

    await wrapper.findAll('[data-testid="delete-paragraph-btn"]')[0].trigger('click');
    await flushPromises();

    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);
    expect(wrapper.find('[data-testid="lyrics-textarea"] textarea').element.value).toBe('Verse 2');
  });

  it('disables delete button if only one paragraph remains', async () => {
    LyricsService.parseToParagraphs.mockReturnValue([{ id: 'p1', type: 'verse', lines: [] }]);
    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    const deleteBtn = wrapper.find('[data-testid="delete-paragraph-btn"]');
    expect(deleteBtn.classes()).toContain('v-btn--disabled');
  });

  it('allows editing and saving the song title', async () => {
    SongsRepository.save.mockResolvedValue();
    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    const titleInput = wrapper.find('[data-testid="title-input"] input');
    expect(titleInput.exists()).toBe(true);

    await titleInput.setValue('New Updated Title');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(SongsRepository.save).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'New Updated Title'
    );
  });

  it('prevents saving if title is too short', async () => {
    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    const titleInput = wrapper.find('[data-testid="title-input"] input');
    await titleInput.setValue('Ab');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(getSnackbarText()).toContain('Title must have at least 3 characters');
    expect(getEditIcon(wrapper)).toContain('check');
  });

  it('prevents saving if no paragraph has at least 3 characters', async () => {
    LyricsService.parseToParagraphs.mockReturnValue([
      { id: 'p1', type: 'verse', lines: [{ text: '1', isSpacer: false }] },
      { id: 'p2', type: 'verse', lines: [{ text: '2', isSpacer: false }] }
    ]);

    const wrapper = await mountAndWait();
    await enterEditMode(wrapper);

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(getSnackbarText()).toContain('Each paragraph must have at least 3 characters');
    expect(getEditIcon(wrapper)).toContain('check');
  });
});

describe('SongDetail.vue - Add New Song Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAuthenticated();
    vi.mocked(useRoute).mockReturnValue({ params: { id: 'new' } });
  });

  it('initializes with empty state and edit mode active for new songs', async () => {
    const wrapper = await mountAndWait();

    expect(wrapper.find('[data-testid="title-input"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="lyrics-textarea"]')).toHaveLength(1);
    expect(getEditIcon(wrapper)).toContain('check');
  });

  it('saves new song and redirects to its detail page', async () => {
    SongsRepository.addSong.mockResolvedValue('new-id-123');
    LyricsService.serialize.mockReturnValue('Line 1\nLine 2');

    const wrapper = await mountAndWait();

    await wrapper.find('[data-testid="title-input"] input').setValue('Brand New Song');
    await wrapper.find('[data-testid="lyrics-textarea"] textarea').setValue('Line 1\nLine 2');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(SongsRepository.addSong).toHaveBeenCalledWith('Brand New Song', 'Line 1\nLine 2', null);
    expect(mockRouter.replace).toHaveBeenCalledWith('/song/new-id-123');
  });

  it('shows error snackbar when adding a new song fails', async () => {
    SongsRepository.addSong.mockRejectedValue(new Error('Firestore write failed'));
    LyricsService.serialize.mockReturnValue('Some lyrics');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = await mountAndWait();

    await wrapper.find('[data-testid="title-input"] input').setValue('New Song Title');
    await wrapper.find('[data-testid="lyrics-textarea"] textarea').setValue('Some lyrics');
    await flushPromises();

    await findEditBtn(wrapper).trigger('click');
    await flushPromises();

    expect(getSnackbarText()).toContain('Error saving');
    expect(getEditIcon(wrapper)).toContain('check');
  });
});
