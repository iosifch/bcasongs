import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { mountWithLayout } from '../test-utils';
import { ref } from 'vue';
import SongList from './SongList.vue';
import { vuetify } from '../vitest-setup';
import SongCard from '../components/SongCard.vue';
import SongsRepository from '../services/SongsRepository';
import { useSongFiltering } from '../composables/useSongFiltering';

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

// Mock SongsRepository
vi.mock('../services/SongsRepository', async () => {
    const { ref } = await vi.importActual('vue');
    return {
        default: {
            songs: ref([]),
            loading: ref(false)
        }
    };
});

// Mock useSongFiltering
vi.mock('../composables/useSongFiltering', async () => {
    const { ref } = await vi.importActual('vue');

    // Create shared refs
    const search = ref('');
    const filteredSongs = ref([]);

    const fn = vi.fn(() => ({
        search,
        filteredSongs
    }));

    // Expose refs for testing
    fn.mockState = { search, filteredSongs };

    return {
        useSongFiltering: fn
    };
});


describe('SongList.vue', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset state
        useSongFiltering.mockState.search.value = '';
        useSongFiltering.mockState.filteredSongs.value = [];
        SongsRepository.loading.value = false;
        SongsRepository.songs.value = [];
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
        expect(useSongFiltering.mockState.search.value).toBe('');

        // Advance time
        vi.advanceTimersByTime(300);

        expect(useSongFiltering.mockState.search.value).toBe('Amazing Grace');
    });

    it('displays loading spinner when loading and no songs', async () => {
        SongsRepository.loading.value = true;
        const wrapper = mountComponent();

        expect(wrapper.findComponent({ name: 'VProgressCircular' }).exists()).toBe(true);
    });

    it('displays "No songs found" when filteredSongs is empty and not loading', async () => {
        SongsRepository.loading.value = false;
        useSongFiltering.mockState.filteredSongs.value = [];
        const wrapper = mountComponent(); // Re-mounting to reflect state

        expect(wrapper.text()).toContain('No songs found');
    });

    it('renders virtual scroll when songs are present', async () => {
        useSongFiltering.mockState.filteredSongs.value = [
            { id: '1', title: 'Song 1', content: 'Lyrics 1' },
            { id: '2', title: 'Song 2', content: 'Lyrics 2' }
        ];
        const wrapper = mountComponent();

        const virtualScroll = wrapper.findComponent({ name: 'VVirtualScroll' });
        expect(virtualScroll.exists()).toBe(true);
        expect(virtualScroll.props('items')).toHaveLength(2);
    });
});
