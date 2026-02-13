import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlaylistRepository from './PlaylistRepository';

const mockOnSnapshot = vi.fn();
const mockUpdateDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn();
const mockArrayUnion = vi.fn(val => ({ type: 'arrayUnion', val }));
const mockArrayRemove = vi.fn(val => ({ type: 'arrayRemove', val }));

vi.mock('../firebaseConfig', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    doc: (...args) => mockDoc(...args),
    onSnapshot: (...args) => mockOnSnapshot(...args),
    updateDoc: (...args) => mockUpdateDoc(...args),
    setDoc: (...args) => mockSetDoc(...args),
    arrayUnion: (...args) => mockArrayUnion(...args),
    arrayRemove: (...args) => mockArrayRemove(...args),
    serverTimestamp: () => 'timestamp'
}));

describe('PlaylistRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PlaylistRepository.stop();
    });

    describe('initialize', () => {
        it('should subscribe to the shared playlist document', () => {
            PlaylistRepository.initialize();
            expect(mockDoc).toHaveBeenCalled();
            expect(mockOnSnapshot).toHaveBeenCalled();
        });

        it('should populate songIds when snapshot triggers', () => {
            mockOnSnapshot.mockImplementation((docRef, callback) => {
                const mockSnapshot = {
                    exists: () => true,
                    data: () => ({ songIds: ['song1', 'song2'] })
                };
                callback(mockSnapshot);
                return vi.fn();
            });

            PlaylistRepository.initialize();

            expect(PlaylistRepository.songIds.value).toEqual(['song1', 'song2']);
            expect(PlaylistRepository.loading.value).toBe(false);
        });

        it('should handle empty playlist document', () => {
            mockOnSnapshot.mockImplementation((docRef, callback) => {
                const mockSnapshot = {
                    exists: () => false,
                    data: () => null
                };
                callback(mockSnapshot);
                return vi.fn();
            });

            PlaylistRepository.initialize();

            expect(PlaylistRepository.songIds.value).toEqual([]);
            expect(PlaylistRepository.loading.value).toBe(false);
        });
    });

    describe('containsSong', () => {
        it('should return true if song is in playlist', () => {
            mockOnSnapshot.mockImplementation((docRef, callback) => {
                callback({
                    exists: () => true,
                    data: () => ({ songIds: ['song1'] })
                });
                return vi.fn();
            });
            PlaylistRepository.initialize();

            expect(PlaylistRepository.containsSong('song1')).toBe(true);
            expect(PlaylistRepository.containsSong('song2')).toBe(false);
        });
    });

    describe('write operations', () => {
        it('addSongToPlaylist should call updateDoc with arrayUnion', async () => {
            await PlaylistRepository.addSongToPlaylist('song1');
            expect(mockUpdateDoc).toHaveBeenCalled();
            expect(mockArrayUnion).toHaveBeenCalledWith('song1');
        });

        it('removeSongFromPlaylist should call updateDoc with arrayRemove', async () => {
            await PlaylistRepository.removeSongFromPlaylist('song1');
            expect(mockUpdateDoc).toHaveBeenCalled();
            expect(mockArrayRemove).toHaveBeenCalledWith('song1');
        });

        it('reorderSongsInPlaylist should call setDoc with new order', async () => {
            await PlaylistRepository.reorderSongsInPlaylist(['song2', 'song1']);
            expect(mockSetDoc).toHaveBeenCalled();
        });

        it('replaceAllSongsInPlaylist should call setDoc with new ids', async () => {
            await PlaylistRepository.replaceAllSongsInPlaylist(['song3', 'song4']);
            expect(mockSetDoc).toHaveBeenCalled();
        });
    });
});
