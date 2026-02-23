import { describe, it, expect, vi, beforeEach } from 'vitest';
import SongsRepository from './SongsRepository';

const mockGetDocs = vi.fn();
const mockGetDoc = vi.fn();
const mockQuery = vi.fn((...args: any[]) => ({ _type: 'mock-query', args }));
const mockOrderBy = vi.fn((...args: any[]) => ({ _type: 'mock-orderBy', args }));
const mockLimit = vi.fn((...args: any[]) => ({ _type: 'mock-limit', args }));
const mockStartAfter = vi.fn((...args: any[]) => ({ _type: 'mock-startAfter', args }));
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn(() => ({ _type: 'mock-collection-ref' }));
const mockDoc = vi.fn((_db: unknown, coll: string, id: string) => ({ _path: `${coll}/${id}` }));

vi.mock('../firebaseConfig', () => ({
  db: { _type: 'mock-db' }
}));

vi.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => (mockCollection as any)(...args),
  getDocs: (...args: unknown[]) => (mockGetDocs as any)(...args),
  getDoc: (...args: unknown[]) => (mockGetDoc as any)(...args),
  query: (...args: unknown[]) => (mockQuery as any)(...args),
  orderBy: (...args: unknown[]) => (mockOrderBy as any)(...args),
  limit: (...args: unknown[]) => (mockLimit as any)(...args),
  startAfter: (...args: unknown[]) => (mockStartAfter as any)(...args),
  addDoc: (...args: unknown[]) => (mockAddDoc as any)(...args),
  updateDoc: (...args: unknown[]) => (mockUpdateDoc as any)(...args),
  deleteDoc: (...args: unknown[]) => (mockDeleteDoc as any)(...args),
  doc: (...args: unknown[]) => (mockDoc as any)(...args),
  serverTimestamp: () => 'timestamp'
}));

interface MockItem {
  id: string
  [key: string]: unknown
}

const makeDocs = (items: MockItem[]) => items.map(item => ({
  id: item.id,
  data: () => {
    const { id: _id, ...rest } = item;
    return rest;
  }
}));

describe('SongsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SongsRepository.stop();
  });

  describe('initialize', () => {
    it('should fetch first page of songs', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: makeDocs([
          { id: '1', title: 'Song 1' },
          { id: '2', title: 'Song 2' }
        ])
      });

      await SongsRepository.initialize();

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), 'songs');
      expect(mockQuery).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalledWith('title');
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(SongsRepository.songs.value).toHaveLength(2);
      expect(SongsRepository.songs.value[0]).toEqual({ id: '1', title: 'Song 1' });
      expect(SongsRepository.loading.value).toBe(false);
      expect(SongsRepository.fullyLoaded.value).toBe(true);
    });

    it('should paginate when first page is full', async () => {
      const firstPage = makeDocs(
        Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, title: `Song ${i}` }))
      );
      const secondPage = makeDocs([
        { id: '20', title: 'Song 20' },
        { id: '21', title: 'Song 21' }
      ]);

      mockGetDocs
        .mockResolvedValueOnce({ docs: firstPage })
        .mockResolvedValueOnce({ docs: secondPage });

      await SongsRepository.initialize();

      expect(mockGetDocs).toHaveBeenCalledTimes(2);
      expect(mockStartAfter).toHaveBeenCalled();
      expect(SongsRepository.songs.value).toHaveLength(22);
      expect(SongsRepository.fullyLoaded.value).toBe(true);
    });

    it('should set loading to false after first page', async () => {
      const firstPage = makeDocs(
        Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, title: `Song ${i}` }))
      );

      let resolveSecondPage: (value: { docs: unknown[] }) => void;
      mockGetDocs
        .mockResolvedValueOnce({ docs: firstPage })
        .mockImplementationOnce(() => new Promise(resolve => { resolveSecondPage = resolve; }));

      const initPromise = SongsRepository.initialize();

      // Wait for first page to resolve
      await vi.waitFor(() => {
        expect(SongsRepository.loading.value).toBe(false);
      });

      expect(SongsRepository.songs.value).toHaveLength(20);
      expect(SongsRepository.fullyLoaded.value).toBe(false);

      // Resolve second page
      resolveSecondPage!({ docs: [] });
      await initPromise;

      expect(SongsRepository.fullyLoaded.value).toBe(true);
    });

    it('should handle errors', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Network error'));

      await SongsRepository.initialize();

      expect(SongsRepository.error.value).toBe('Network error');
      expect(SongsRepository.loading.value).toBe(false);
    });
  });

  describe('getSong', () => {
    it('should return a song from local cache', async () => {
      mockGetDocs.mockResolvedValueOnce({
        docs: makeDocs([
          { id: '1', title: 'Song 1' },
          { id: '2', title: 'Song 2' }
        ])
      });

      await SongsRepository.initialize();

      const song = await SongsRepository.getSong('2');
      expect(song).toEqual({ id: '2', title: 'Song 2' });
      expect(mockGetDoc).not.toHaveBeenCalled();
    });

    it('should fetch from Firestore when not in local cache', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'remote-1',
        data: () => ({ title: 'Remote Song' })
      });

      const song = await SongsRepository.getSong('remote-1');

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'songs', 'remote-1');
      expect(song).toEqual({ id: 'remote-1', title: 'Remote Song' });
      // Should be added to local cache
      expect(SongsRepository.songs.value).toContainEqual({ id: 'remote-1', title: 'Remote Song' });
    });

    it('should return null when song does not exist in Firestore', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const song = await SongsRepository.getSong('non-existent');

      expect(song).toBeNull();
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

      const updatePayload = mockUpdateDoc.mock.calls[0][1] as Record<string, unknown>;
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
});
