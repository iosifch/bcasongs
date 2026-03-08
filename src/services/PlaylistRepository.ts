import { ref, readonly } from 'vue';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import type { Unsubscribe, DocumentReference } from 'firebase/firestore';

const _songIds = ref<string[]>([]);
const _loading = ref(true);
const _error = ref<string | null>(null);

let _unsubscribe: Unsubscribe | null = null;

const PLAYLIST_DOC = 'shared';
const PLAYLIST_COLLECTION = 'playlists';

function _playlistRef(): DocumentReference {
    return doc(db, PLAYLIST_COLLECTION, PLAYLIST_DOC);
}

interface FirebaseError extends Error {
    code?: string
}

export default {
    songIds: readonly(_songIds),
    loading: readonly(_loading),
    error: readonly(_error),

    initialize(): void {
        if (_unsubscribe) return; // Already initialized

        _loading.value = true;

        _unsubscribe = onSnapshot(
            _playlistRef(),
            (snapshot) => {
                if (snapshot.exists()) {
                    _songIds.value = snapshot.data().songIds || [];
                } else {
                    _songIds.value = [];
                }
                _loading.value = false;
                _error.value = null;
            },
            (err) => {
                console.error('PlaylistRepository Error:', err);
                _error.value = err.message;
                _loading.value = false;
            }
        );
    },

    stop(): void {
        if (_unsubscribe) {
            _unsubscribe();
            _unsubscribe = null;
        }
    },

    containsSong(songId: string): boolean {
        return _songIds.value.includes(songId);
    },

    async addSongToPlaylist(songId: string): Promise<void> {
        try {
            await updateDoc(_playlistRef(), {
                songIds: arrayUnion(songId),
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            if ((e as FirebaseError).code === 'not-found') {
                await setDoc(_playlistRef(), {
                    songIds: [songId],
                    updatedAt: serverTimestamp()
                });
            } else {
                console.error('Error adding song to playlist:', e);
                throw e;
            }
        }
    },

    async removeSongFromPlaylist(songId: string): Promise<void> {
        try {
            await updateDoc(_playlistRef(), {
                songIds: arrayRemove(songId),
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error('Error removing song from playlist:', e);
            throw e;
        }
    },

    async reorderSongsInPlaylist(newOrderIds: string[]): Promise<void> {
        try {
            await setDoc(_playlistRef(), {
                songIds: newOrderIds,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error('Error reordering playlist:', e);
            throw e;
        }
    },

    async replaceAllSongsInPlaylist(newIds: string[]): Promise<void> {
        try {
            await setDoc(_playlistRef(), {
                songIds: newIds,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error('Error replacing playlist:', e);
            throw e;
        }
    }
};
