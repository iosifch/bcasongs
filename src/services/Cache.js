const CACHE_KEY = 'bca_songs_cache';

export default {
  get() {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  },

  set(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  },

  clear() {
    localStorage.removeItem(CACHE_KEY);
  }
};
