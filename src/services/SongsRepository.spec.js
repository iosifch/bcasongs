import { describe, it, expect, vi, beforeEach } from 'vitest';
import SongsRepository from './SongsRepository';

const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn(() => ({ _type: 'mock-collection-ref' }));
const mockDoc = vi.fn((db, collection, id) => ({ _path: `${collection}/${id}` }));

vi.mock('../firebaseConfig', () => ({
  db: { _type: 'mock-db' }
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
      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'songs');
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should update songs state when snapshot triggers', () => {
      mockOnSnapshot.mockImplementation((collection, callback) => {
        const mockSnapshot = {
          docs: [
            { id: '1', data: () => ({ title: 'Song 1' }) },
            { id: '2', data: () => ({ title: 'Song 2' }) }
          ]
        };
        callback(mockSnapshot);
        return vi.fn();
      });

      SongsRepository.initialize();

      expect(SongsRepository.songs.value).toHaveLength(2);
      expect(SongsRepository.songs.value[0]).toEqual({ id: '1', title: 'Song 1' });
      expect(SongsRepository.songs.value[1]).toEqual({ id: '2', title: 'Song 2' });
      expect(SongsRepository.loading.value).toBe(false);
    });
  });

  describe('CRUD Operations', () => {
    it('addSong should call addDoc with correct payload and return new id', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-id-123' });
      const id = await SongsRepository.addSong('New Song', 'Lyrics', 'G');

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: 'New Song',
          content: 'Lyrics',
          originalKey: 'G'
        })
      );
      expect(id).toBe('new-id-123');
    });

    it('save should update content and title for the correct document', async () => {
      await SongsRepository.save('123', 'New Lyrics', 'New Title');

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'songs', '123');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          content: 'New Lyrics',
          title: 'New Title',
          updatedAt: 'timestamp'
        })
      );
    });

    it('save should include originalKey in the update payload when provided', async () => {
      await SongsRepository.save('456', 'Lyrics', null, 'C#m');

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'songs', '456');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          originalKey: 'C#m',
          updatedAt: 'timestamp'
        })
      );
    });

    it('save should not include title in payload when title is null', async () => {
      await SongsRepository.save('789', 'Lyrics', null);

      const updatePayload = mockUpdateDoc.mock.calls[0][1];
      expect(updatePayload).not.toHaveProperty('title');
      expect(updatePayload.content).toBe('Lyrics');
    });

    it('deleteSong should delete the correct document', async () => {
      await SongsRepository.deleteSong('123');

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'songs', '123');
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.objectContaining({
        _path: 'songs/123'
      }));
    });
  });

  describe('getSong', () => {
    beforeEach(() => {
      SongsRepository.stop();
    });

    it('should return the correct song by ID', () => {
      mockOnSnapshot.mockImplementation((collection, callback) => {
        callback({
          docs: [
            { id: '1', data: () => ({ title: 'Song 1' }) },
            { id: '2', data: () => ({ title: 'Song 2' }) }
          ]
        });
        return vi.fn();
      });

      SongsRepository.initialize();

      expect(SongsRepository.getSong('2')).toEqual({ id: '2', title: 'Song 2' });
    });

    it('should return undefined for a non-existent song ID', () => {
      mockOnSnapshot.mockImplementation((collection, callback) => {
        callback({
          docs: [
            { id: '1', data: () => ({ title: 'Song 1' }) }
          ]
        });
        return vi.fn();
      });

      SongsRepository.initialize();

      expect(SongsRepository.getSong('non-existent')).toBeUndefined();
    });
  });
});
