import { describe, it, expect, vi, beforeEach } from 'vitest';
import SongsRepository from './SongsRepository';
import Database from './Database';
import Cache from './Cache';

// Mock dependencies
vi.mock('./Database', () => ({
  default: {
    fetchVersion: vi.fn(),
    fetchData: vi.fn()
  }
}));

vi.mock('./Cache', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

describe('SongsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with cached data', async () => {
    const mockCache = { version: 1, songs: [{ id: '1', title: 'Cached' }] };
    Cache.get.mockReturnValue(mockCache);
    Database.fetchVersion.mockResolvedValue(1); // Same version

    await SongsRepository.initialize();
    
    expect(SongsRepository.songs.value).toHaveLength(1);
    expect(SongsRepository.songs.value[0].title).toBe('Cached');
  });

  it('should sync when remote version is newer', async () => {
    Cache.get.mockReturnValue({ version: 1, songs: [] });
    Database.fetchVersion.mockResolvedValue(2); // Newer version
    Database.fetchData.mockResolvedValue({ version: 2, songs: [{ id: '2', title: 'New' }] });

    await SongsRepository.sync();
    
    expect(Database.fetchData).toHaveBeenCalled();
    expect(SongsRepository.version.value).toBe(2);
    expect(SongsRepository.songs.value[0].title).toBe('New');
  });

  it('should not fetch full data if versions match', async () => {
    // Current version is 1
    Database.fetchVersion.mockResolvedValue(SongsRepository.version.value);

    await SongsRepository.sync();
    
    expect(Database.fetchData).not.toHaveBeenCalled();
  });
});
