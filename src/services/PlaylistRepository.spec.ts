import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlaylistRepository from './PlaylistRepository';

const mockOnSnapshot = vi.fn();
const mockUpdateDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn(() => ({ _type: 'mock-doc-ref' }));
const mockArrayUnion = vi.fn((val: unknown) => ({ type: 'arrayUnion', val }));
const mockArrayRemove = vi.fn((val: unknown) => ({ type: 'arrayRemove', val }));

vi.mock('../firebaseConfig', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    doc: (...args: unknown[]) => mockDoc(...args),
    onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    setDoc: (...args: unknown[]) => mockSetDoc(...args),
    arrayUnion: (...args: unknown[]) => mockArrayUnion(...args),
    arrayRemove: (...args: unknown[]) => mockArrayRemove(...args),
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
            expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'playlists', 'shared');
            expect(mockOnSnapshot).toHaveBeenCalledWith(
                expect.anything(),
                expect.any(Function),
                expect.any(Function)
            );
        });

        it('should populate songIds when snapshot triggers', () => {
            mockOnSnapshot.mockImplementation((_docRef: unknown, callback: (snapshot: unknown) => void) => {
                callback({
                    exists: () => true,
                    data: () => ({ songIds: ['song1', 'song2'] })
                });
                return vi.fn();
            });

            PlaylistRepository.initialize();

            expect(PlaylistRepository.songIds.value).toEqual(['song1', 'song2']);
            expect(PlaylistRepository.loading.value).toBe(false);
        });

        it('should handle empty playlist document', () => {
            mockOnSnapshot.mockImplementation((_docRef: unknown, callback: (snapshot: unknown) => void) => {
                callback({
                    exists: () => false,
                    data: () => null
                });
                return vi.fn();
            });

            PlaylistRepository.initialize();

            expect(PlaylistRepository.songIds.value).toEqual([]);
            expect(PlaylistRepository.loading.value).toBe(false);
        });
    });

    describe('containsSong', () => {
        it('should return true if song is in playlist and false otherwise', () => {
            mockOnSnapshot.mockImplementation((_docRef: unknown, callback: (snapshot: unknown) => void) => {
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
        it('addSongToPlaylist should call updateDoc with arrayUnion payload', async () => {
            await PlaylistRepository.addSongToPlaylist('song1');

            expect(mockUpdateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    songIds: { type: 'arrayUnion', val: 'song1' },
                    updatedAt: 'timestamp'
                })
            );
        });

        it('removeSongFromPlaylist should call updateDoc with arrayRemove payload', async () => {
            await PlaylistRepository.removeSongFromPlaylist('song1');

            expect(mockUpdateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    songIds: { type: 'arrayRemove', val: 'song1' },
                    updatedAt: 'timestamp'
                })
            );
        });

        it('reorderSongsInPlaylist should persist the new order via setDoc', async () => {
            await PlaylistRepository.reorderSongsInPlaylist(['song2', 'song1']);

            expect(mockSetDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    songIds: ['song2', 'song1'],
                    updatedAt: 'timestamp'
                }),
                { merge: true }
            );
        });

        it('replaceAllSongsInPlaylist should persist the new ids via setDoc', async () => {
            await PlaylistRepository.replaceAllSongsInPlaylist(['song3', 'song4']);

            expect(mockSetDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    songIds: ['song3', 'song4'],
                    updatedAt: 'timestamp'
                }),
                { merge: true }
            );
        });
    });

    describe('addSongToPlaylist error handling', () => {
        it('should fall back to setDoc when updateDoc throws not-found', async () => {
            const notFoundError = new Error('Document not found') as Error & { code: string };
            notFoundError.code = 'not-found';
            mockUpdateDoc.mockRejectedValue(notFoundError);

            await PlaylistRepository.addSongToPlaylist('song1');

            expect(mockUpdateDoc).toHaveBeenCalled();
            expect(mockSetDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    songIds: ['song1'],
                    updatedAt: 'timestamp'
                })
            );
        });

        it('should rethrow non-not-found errors from updateDoc', async () => {
            const otherError = new Error('Permission denied') as Error & { code: string };
            otherError.code = 'permission-denied';
            mockUpdateDoc.mockRejectedValue(otherError);
            vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(PlaylistRepository.addSongToPlaylist('song1')).rejects.toThrow('Permission denied');
            expect(mockSetDoc).not.toHaveBeenCalled();
        });
    });
});
