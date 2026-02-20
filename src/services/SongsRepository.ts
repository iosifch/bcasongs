import { ref, readonly } from 'vue';
import { db } from '../firebaseConfig';
import { collection, getDocs, getDoc, query, orderBy, limit, startAfter, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const PAGE_SIZE = 20;

export interface Song {
  id: string
  title: string
  content: string
  originalKey?: string | null
  createdAt?: unknown
  updatedAt?: unknown
}

const _songs = ref<Song[]>([]);
const _loading = ref(true);
const _error = ref<string | null>(null);
const _fullyLoaded = ref(false);

export default {
  songs: readonly(_songs),
  loading: readonly(_loading),
  error: readonly(_error),
  fullyLoaded: readonly(_fullyLoaded),

  async initialize(): Promise<void> {
    if (_loading.value === false && _songs.value.length > 0) return;

    _loading.value = true;
    _error.value = null;
    _fullyLoaded.value = false;

    const songsCollection = collection(db, 'songs');
    let lastDoc: unknown = null;

    try {
      // First page
      const firstQuery = query(songsCollection, orderBy('title'), limit(PAGE_SIZE));
      const firstSnapshot = await getDocs(firstQuery);

      _songs.value = firstSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Song));
      _loading.value = false;

      if (firstSnapshot.docs.length < PAGE_SIZE) {
        _fullyLoaded.value = true;
        return;
      }

      lastDoc = firstSnapshot.docs[firstSnapshot.docs.length - 1];

      // Remaining pages in background
      while (true) {
        const nextQuery = query(songsCollection, orderBy('title'), startAfter(lastDoc), limit(PAGE_SIZE));
        const nextSnapshot = await getDocs(nextQuery);

        if (nextSnapshot.docs.length === 0) break;

        _songs.value = [
          ..._songs.value,
          ...nextSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Song))
        ];

        if (nextSnapshot.docs.length < PAGE_SIZE) break;
        lastDoc = nextSnapshot.docs[nextSnapshot.docs.length - 1];
      }

      _fullyLoaded.value = true;
    } catch (err) {
      console.error("Firestore Error:", err);
      _error.value = (err as Error).message;
      _loading.value = false;
    }
  },

  stop(): void {
    _songs.value = [];
    _loading.value = true;
    _fullyLoaded.value = false;
    _error.value = null;
  },

  async getSong(id: string): Promise<Song | null> {
    const local = _songs.value.find(s => s.id === id);
    if (local) return local;

    const docSnap = await getDoc(doc(db, 'songs', id));
    if (docSnap.exists()) {
      const song: Song = { id: docSnap.id, ...docSnap.data() } as Song;
      if (!_songs.value.find(s => s.id === id)) {
        _songs.value = [..._songs.value, song];
      }
      return song;
    }
    return null;
  },

  // --- Write Operations ---

  async addSong(title: string, content: string, key: string | null = null): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'songs'), {
        title,
        content,
        originalKey: key || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      console.error("Error adding song:", e);
      throw e;
    }
  },

  async save(id: string, content: string, title: string | null = null, originalKey: string | null = null): Promise<void> {
    const updateData: Record<string, unknown> = {
      content,
      updatedAt: serverTimestamp()
    };

    if (title) updateData.title = title;
    if (originalKey !== null) updateData.originalKey = originalKey;

    try {
      const songRef = doc(db, 'songs', id);
      await updateDoc(songRef, updateData);
    } catch (e) {
      console.error("Error updating song:", e);
      throw e;
    }
  },

  async deleteSong(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'songs', id));
    } catch (e) {
      console.error("Error deleting song:", e);
      throw e;
    }
  }
};
