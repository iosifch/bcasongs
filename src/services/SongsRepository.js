import { ref, readonly } from 'vue';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const _songs = ref([]);
const _loading = ref(true);
const _error = ref(null);

// Subscription unsubscriber function
let _unsubscribe = null;

export default {
  songs: readonly(_songs),
  loading: readonly(_loading),
  error: readonly(_error),

  initialize() {
    if (_unsubscribe) return; // Already initialized

    _loading.value = true;

    // Subscribe to the "songs" collection
    const songsCollection = collection(db, 'songs');

    _unsubscribe = onSnapshot(songsCollection,
      (snapshot) => {
        _songs.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        _loading.value = false;
        _error.value = null;
        console.log(`Songs updated from Firestore: ${_songs.value.length} songs.`);
      },
      (err) => {
        console.error("Firestore Error:", err);
        _error.value = err.message;
        _loading.value = false;
      }
    );
  },

  stop() {
    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
    }
  },

  getSong(id) {
    return _songs.value.find(s => s.id === id);
  },

  // --- Write Operations ---

  async addSong(title, content, key = '', artist = '') {
    try {
      await addDoc(collection(db, 'songs'), {
        title,
        content,
        key,
        artist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding song:", e);
      throw e;
    }
  },

  async save(id, content, title = null) {
    // Determine what to update
    const updateData = {
      content,
      updatedAt: serverTimestamp()
    };

    if (title) updateData.title = title;

    try {
      const songRef = doc(db, 'songs', id);
      await updateDoc(songRef, updateData);
    } catch (e) {
      console.error("Error updating song:", e);
      throw e;
    }
  },

  async deleteSong(id) {
    try {
      await deleteDoc(doc(db, 'songs', id));
    } catch (e) {
      console.error("Error deleting song:", e);
      throw e;
    }
  }
};
