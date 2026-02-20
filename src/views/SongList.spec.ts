import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { mountWithLayout } from '../test-utils';
import { ref } from 'vue';
import SongList from './SongList.vue';
import { vuetify } from '../vitest-setup';
import { useSongs } from '../composables/useSongs';
import type { Mock } from 'vitest';
import type { Ref } from 'vue';

// --- Mocks ---

vi.mock('../composables/useAuth', () => ({
    useAuth: vi.fn(() => ({
        isAuthenticated: ref(true),
        isAuthenticating: ref(false),
        initializeAuth: vi.fn()
    }))
}));

vi.mock('../composables/usePlaylist', () => ({
    usePlaylist: vi.fn(() => ({
        isInPlaylist: vi.fn(() => false),
        playlistCount: ref(0)
    }))
}));

vi.mock('../composables/useSongActions', () => ({
    useSongActions: vi.fn(() => ({
        snackbar: ref(false),
        snackbarText: ref(''),
        handleTogglePlaylist: vi.fn(),
        handleShare: vi.fn()
    }))
}));

// Mock useSongs
vi.mock('../composables/useSongs', async () => {
    const { ref } = await vi.importActual<typeof import('vue')>('vue');

    const songs = ref<{ id: string; title: string; content: string }[]>([]);
    const search = ref('');
    const loading = ref(false);

    const fn = vi.fn(() => ({
        songs,
        search,
        loading
    })) as Mock & { mockState: { songs: Ref; search: Ref<string>; loading: Ref<boolean> } };

    fn.mockState = { songs, search, loading };

    return {
        useSongs: fn
    };
});


describe('SongList.vue', () => {
    const mockUseSongs = useSongs as Mock & { mockState: { songs: Ref; search: Ref<string>; loading: Ref<boolean> } };

    beforeEach(() => {
        vi.useFakeTimers();
        // Reset state
        mockUseSongs.mockState.search.value = '';
        mockUseSongs.mockState.songs.value = [];
        mockUseSongs.mockState.loading.value = false;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const mountComponent = () => {
        return mountWithLayout(SongList, {
            global: {
                plugins: [vuetify],
                stubs: {
                    SongCard: true,
                    UserAuth: true,
                    VVirtualScroll: false // Allow rendering to check props
                }
            }
        });
    };

    it('debounces search input updates', async () => {
        const wrapper = mountComponent();
        const input = wrapper.find('input[type="text"]');

        await input.setValue('Amazing Grace');

        // Should not update immediately
        expect(mockUseSongs.mockState.search.value).toBe('');

        // Advance time
        vi.advanceTimersByTime(300);

        expect(mockUseSongs.mockState.search.value).toBe('Amazing Grace');
    });

    it('displays loading spinner when loading and no songs', async () => {
        mockUseSongs.mockState.loading.value = true;
        const wrapper = mountComponent();

        expect(wrapper.findComponent({ name: 'VProgressCircular' }).exists()).toBe(true);
    });

    it('displays "No songs found" when songs is empty and not loading', async () => {
        mockUseSongs.mockState.loading.value = false;
        mockUseSongs.mockState.songs.value = [];
        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('No songs found');
    });

    it('renders virtual scroll when songs are present', async () => {
        mockUseSongs.mockState.songs.value = [
            { id: '1', title: 'Song 1', content: 'Lyrics 1' },
            { id: '2', title: 'Song 2', content: 'Lyrics 2' }
        ];
        const wrapper = mountComponent();

        const virtualScroll = wrapper.findComponent({ name: 'VVirtualScroll' });
        expect(virtualScroll.exists()).toBe(true);
        expect(virtualScroll.props('items')).toHaveLength(2);
    });
});
