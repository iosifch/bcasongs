import { describe, it, expect, vi, beforeEach } from 'vitest';
import SongsRepository from './SongsRepository';

// Mock dependencies
const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn();
const mockDoc = vi.fn();

vi.mock('../firebaseConfig', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  addDoc: (...args) => mockAddDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  doc: (...args) => mockDoc(...args),
  serverTimestamp: () => 'timestamp'
}));

describe('SongsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should subscribe to songs collection', () => {
      SongsRepository.initialize();
      expect(mockCollection).toHaveBeenCalled(); // checks if collection() was called
      expect(mockOnSnapshot).toHaveBeenCalled(); // checks if onSnapshot() was called
    });

    it('should update songs state when snapshot triggers', () => {
      // Setup mock implementation for onSnapshot to trigger the callback immediately
      mockOnSnapshot.mockImplementation((collection, callback) => {
        const mockSnapshot = {
          docs: [
            { id: '1', data: () => ({ title: 'Song 1' }) },
            { id: '2', data: () => ({ title: 'Song 2' }) }
          ]
        };
        callback(mockSnapshot);
        return vi.fn(); // unsubscribe function
      });

      SongsRepository.initialize();

      expect(SongsRepository.songs.value).toHaveLength(2);
      expect(SongsRepository.songs.value[0]).toEqual({ id: '1', title: 'Song 1' });
      expect(SongsRepository.loading.value).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('addSong should call addDoc', async () => {
      await SongsRepository.addSong('New Song', 'Lyrics');
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('save (update) should call updateDoc', async () => {
      await SongsRepository.save('123', 'New Lyrics', 'New Title');
      expect(mockDoc).toHaveBeenCalled();
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('deleteSong should call deleteDoc', async () => {
      await SongsRepository.deleteSong('123');
      expect(mockDoc).toHaveBeenCalled();
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});
