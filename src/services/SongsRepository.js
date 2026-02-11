import { ref, readonly } from 'vue';
import Cache from './Cache';
import Database from './Database';

const _songs = ref([]);
const _version = ref(0);
const _isSyncing = ref(false);

export default {
  songs: readonly(_songs),
  version: readonly(_version),
  isSyncing: readonly(_isSyncing),

  async initialize() {
    // 1. Load from cache first for instant UI
    const cachedData = Cache.get();
    if (cachedData) {
      _songs.value = cachedData.songs || [];
      _version.value = cachedData.version || 0;
    }

    // 2. Start background sync
    this.sync();
  },

  async sync() {
    if (_isSyncing.value) return;
    _isSyncing.value = true;

    try {
      // 1. Fetch only the version first
      const remoteVersion = await Database.fetchVersion();
      
      // 2. Compare versions
      if (remoteVersion > _version.value) {
        console.log(`Syncing: New version detected (${remoteVersion}). Fetching full data...`);
        
        // 3. Fetch full data only if needed
        const remoteData = await Database.fetchData();
        
        Cache.set(remoteData);
        _songs.value = remoteData.songs;
        _version.value = remoteData.version;
        console.log(`Syncing: Updated to version ${remoteVersion} successfully.`);
      } else {
        console.log('Syncing: Already up to date (version ' + _version.value + ')');
      }
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      _isSyncing.value = false;
    }
  },

  getSong(id) {
    return _songs.value.find(s => s.id === id);
  },

  async save(id, content) {
    const songIndex = _songs.value.findIndex(s => s.id === id);
    if (songIndex !== -1) {
      // Update local state
      _songs.value[songIndex].content = content;
      
      // Update cache
      Cache.set({
        version: _version.value,
        songs: _songs.value
      });
      
      // In the future, this is where we would also call Database.update(id, content)
    }
  }
};
