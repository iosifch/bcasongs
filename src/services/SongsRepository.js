import { ref } from 'vue';
import Cache from './Cache';
import Database from './Database';

const songs = ref([]);
const version = ref(0);
const isSyncing = ref(false);

export default {
  songs,
  version,
  isSyncing,

  async initialize() {
    // 1. Load from cache first for instant UI
    const cachedData = Cache.get();
    if (cachedData) {
      songs.value = cachedData.songs || [];
      version.value = cachedData.version || 0;
    }

    // 2. Start background sync
    this.sync();
  },

  async sync() {
    if (isSyncing.value) return;
    isSyncing.value = true;

    try {
      // 1. Fetch only the version first
      const remoteVersion = await Database.fetchVersion();
      
      // 2. Compare versions
      if (remoteVersion > version.value) {
        console.log(`Syncing: New version detected (${remoteVersion}). Fetching full data...`);
        
        // 3. Fetch full data only if needed
        const remoteData = await Database.fetchData();
        
        Cache.set(remoteData);
        songs.value = remoteData.songs;
        version.value = remoteData.version;
        console.log(`Syncing: Updated to version ${remoteVersion} successfully.`);
      } else {
        console.log('Syncing: Already up to date (version ' + version.value + ')');
      }
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      isSyncing.value = false;
    }
  },

  getSong(id) {
    return songs.value.find(s => s.id === id);
  },

  async save(id, content) {
    const songIndex = songs.value.findIndex(s => s.id === id);
    if (songIndex !== -1) {
      // Update local state
      songs.value[songIndex].content = content;
      
      // Update cache
      Cache.set({
        version: version.value,
        songs: songs.value
      });
      
      // In the future, this is where we would also call Database.update(id, content)
    }
  }
};
